package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.CreateOrderRequest;
import com.cart.ecom_proj.dto.OrderItemRequest;
import com.cart.ecom_proj.dto.UpdateOrderStatusRequest;
import com.cart.ecom_proj.exception.BadRequestException;
import com.cart.ecom_proj.exception.ForbiddenException;
import com.cart.ecom_proj.exception.InsufficientStockException;
import com.cart.ecom_proj.exception.ResourceNotFoundException;
import com.cart.ecom_proj.model.*;
import com.cart.ecom_proj.repo.OrderRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for managing order-related operations.
 * Handles order creation, status updates, cancellations, and inventory management.
 * Uses @Transactional to ensure data consistency across multiple database operations.
 * 
 * @author Ecommerce Team
 * @version 1.0
 */
@Service
@Transactional // Ensures all methods run within a transaction for data consistency
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepo productRepo;

    // EmailService is optional to avoid system dependency on email functionality
    @Autowired(required = false)
    private EmailService emailService;

    /**
     * Creates a new order from the provided request data.
     * This method performs several critical operations:
     * 1. Validates product availability and stock levels
     * 2. Creates order items with current pricing
     * 3. Updates product inventory
     * 4. Calculates total order amount
     * 5. Sends confirmation email
     * 
     * @param request Order creation request containing items, addresses, and payment info
     * @param user    User placing the order
     * @return Created order with generated ID and order items
     * @throws ResourceNotFoundException if any product in the order doesn't exist
     * @throws InsufficientStockException if any product has insufficient stock
     */
    public Order createOrder(CreateOrderRequest request, User user) {
        // Initialize new order with basic information
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        // Use shipping address as billing address if billing address is not provided
        order.setBillingAddress(request.getBillingAddress() != null ? request.getBillingAddress() : request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setNotes(request.getNotes());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        // Initialize collections for order items and total calculation
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process each item in the order request
        for (OrderItemRequest itemRequest : request.getItems()) {
            // Verify product exists
            Product product = productRepo.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Critical: Validate stock availability before creating order item
            // This prevents overselling and maintains inventory integrity
            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for product: " + product.getName() + ". Available: " + product.getStockQuantity());
            }

            // Create order item with current product price (price at time of order)
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPriceAtOrder(product.getPrice()); // Store current price to handle future price changes
            orderItem.calculateAndSetSubtotal(); // Calculate quantity * priceAtOrder

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Immediately update product stock to prevent race conditions
            // This is done within the same transaction to ensure consistency
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepo.save(product);
        }

        // Finalize order with all items and calculated total
        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        // Save order and all order items (cascaded)
        Order savedOrder = orderRepository.save(order);
        
        // Attempt to send order confirmation email (non-critical operation)
        if (emailService != null) {
            try {
                emailService.sendOrderConfirmationEmail(savedOrder);
            } catch (Exception e) {
                // Email failure should not cause order creation to fail
                // In production, this should use proper logging instead of System.err
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
            }
        }
        
        return savedOrder;
    }

    /**
     * Retrieves an order by its ID.
     * 
     * @param id Order ID to search for
     * @return Order object if found
     * @throws ResourceNotFoundException if order with given ID doesn't exist
     */
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    /**
     * Retrieves an order by ID with user authorization check.
     * Ensures users can only access their own orders for data security.
     * 
     * @param id     Order ID to retrieve
     * @param userId ID of the requesting user
     * @return Order object if found and user is authorized
     * @throws ResourceNotFoundException if order doesn't exist
     * @throws ForbiddenException if user doesn't own the order
     */
    public Order getOrderByIdForUser(Long id, Long userId) {
        Order order = getOrderById(id);
        
        // Security check: Ensure user can only access their own orders
        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to access this order");
        }
        
        return order;
    }

    /**
     * Retrieves all orders for a specific user, sorted by order date (newest first).
     * Note: Returns all orders without pagination - use getUserOrdersPaginated for large datasets.
     * 
     * @param userId ID of the user whose orders to retrieve
     * @return List of orders belonging to the user
     */
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdAndDeletedFalseOrderByOrderDateDesc(userId);
    }

    /**
     * Retrieves user orders with pagination support.
     * Recommended for production use to handle users with many orders.
     * 
     * @param userId ID of the user whose orders to retrieve
     * @param page   Page number (0-based)
     * @param size   Number of orders per page
     * @param sortBy Field to sort by (defaults to "orderDate" if null)
     * @return Page containing user's orders with pagination metadata
     */
    public Page<Order> getUserOrdersPaginated(Long userId, int page, int size, String sortBy) {
        // Default to descending order by order date (newest first)
        Sort sort = Sort.by(Sort.Direction.DESC, sortBy != null ? sortBy : "orderDate");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return orderRepository.findByUserIdAndDeletedFalse(userId, pageable);
    }

    /**
     * Updates the status of an order (admin/seller operation).
     * Handles status transitions and automatic payment status updates.
     * Sends notification emails when status changes.
     * 
     * @param orderId Order ID to update
     * @param request Update request containing new status and optional fields
     * @return Updated order object
     * @throws ResourceNotFoundException if order doesn't exist
     */
    public Order updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = getOrderById(orderId);
        OrderStatus oldStatus = order.getStatus(); // Store old status for comparison
        
        // Update order status and optional fields
        order.setStatus(request.getStatus());
        if (request.getDeliveryDate() != null) {
            order.setDeliveryDate(request.getDeliveryDate());
        }
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }
        
        // Business rule: Automatically mark payment as completed when order is delivered
        if (request.getStatus() == OrderStatus.DELIVERED) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Send status update notification if status actually changed
        if (emailService != null && !oldStatus.equals(request.getStatus())) {
            try {
                emailService.sendOrderStatusUpdateEmail(savedOrder);
            } catch (Exception e) {
                // Email failure should not cause status update to fail
                System.err.println("Failed to send order status update email: " + e.getMessage());
            }
        }
        
        return savedOrder;
    }

    /**
     * Cancels an order and restores product inventory.
     * Only allows cancellation of orders in PENDING or CONFIRMED status.
     * Automatically handles inventory restoration and payment status updates.
     * 
     * @param orderId Order ID to cancel
     * @param userId  ID of the user requesting cancellation
     * @return Cancelled order object
     * @throws ResourceNotFoundException if order doesn't exist
     * @throws ForbiddenException if user doesn't own the order
     * @throws BadRequestException if order cannot be cancelled (wrong status)
     */
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = getOrderById(orderId);
        
        // Security check: Only order owner can cancel their order
        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to cancel this order");
        }
        
        // Business rule: Only allow cancellation of pending or confirmed orders
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        // Critical: Restore product stock for all items in the cancelled order
        // This maintains inventory accuracy when orders are cancelled
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepo.save(product);
        }

        // Update order status to cancelled
        order.setStatus(OrderStatus.CANCELLED);
        
        // Handle payment status: If already paid, mark for refund
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        
        return orderRepository.save(order);
    }

    /**
     * Retrieves all orders in the system with optional status filtering (admin operation).
     * Used by administrators and sellers to manage all orders.
     * 
     * @param page   Page number (0-based)
     * @param size   Number of orders per page
     * @param status Optional status filter (null to get all orders)
     * @return Page containing orders matching the criteria
     */
    public Page<Order> getAllOrders(int page, int size, OrderStatus status) {
        // Always sort by order date descending (newest first)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        
        // Apply status filter if provided, otherwise return all orders
        if (status != null) {
            return orderRepository.findByStatusAndDeletedFalse(status, pageable);
        }
        return orderRepository.findAll(pageable);
    }

    /**
     * Soft deletes an order (admin operation).
     * Marks order as deleted instead of physically removing it from database.
     * This preserves data integrity and allows for audit trails.
     * 
     * @param id Order ID to delete
     * @throws ResourceNotFoundException if order doesn't exist
     */
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        // Soft delete: Mark as deleted instead of physically removing from DB
        // This preserves referential integrity and allows for data recovery if needed
        order.setDeleted(true);
        orderRepository.save(order);
    }

    /**
     * Updates the payment status of an order (webhook operation).
     * Used by payment gateways like Stripe to update payment status.
     * 
     * @param orderId Order ID to update
     * @param paymentStatus New payment status
     * @return Updated order object
     * @throws ResourceNotFoundException if order doesn't exist
     */
    public Order updateOrderPaymentStatus(Long orderId, PaymentStatus paymentStatus) {
        Order order = getOrderById(orderId);
        order.setPaymentStatus(paymentStatus);
        
        // If payment succeeded, we might want to move order to confirmed status
        if (paymentStatus == PaymentStatus.PAID && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        
        return orderRepository.save(order);
    }
}

