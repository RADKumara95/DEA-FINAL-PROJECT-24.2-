package com.service;

import com.dto.CreateOrderRequest;
import com.exception.InsufficientStockException;
import com.exception.InvalidOrderStatusException;
import com.exception.ResourceNotFoundException;
import com.exception.UnauthorizedException;
import com.model.*;
import com.repository.OrderRepository;
import com.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /**
     * Create a new order with stock validation and total calculation
     */
    @Transactional
    public Order createOrder(CreateOrderRequest request, User user) {
        // Validate and prepare order items
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getOrderItems()) {
            // Fetch product
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + itemRequest.getProductId()));
            
            // Validate stock availability
            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        String.format("Insufficient stock for product '%s'. Available: %d, Requested: %d",
                                product.getName(), product.getStockQuantity(), itemRequest.getQuantity()));
            }
            
            // Create order item with price at order time
            OrderItem orderItem = new OrderItem(product, itemRequest.getQuantity(), product.getPrice());
            orderItems.add(orderItem);
            
            // Update product stock quantity
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }
        
        // Create order
        Order order = new Order(
                user,
                request.getShippingAddress(),
                request.getPhoneNumber(),
                request.getPaymentMethod(),
                PaymentStatus.PENDING
        );
        
        order.setBillingAddress(request.getBillingAddress() != null ? 
                request.getBillingAddress() : request.getShippingAddress());
        order.setNotes(request.getNotes());
        
        // Add order items and calculate total
        for (OrderItem item : orderItems) {
            order.addOrderItem(item);
        }
        order.calculateTotalAmount();
        
        return orderRepository.save(order);
    }

    /**
     * Get order by ID - verify user owns order or is admin
     */
    public Order getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return order;
    }

    /**
     * Get order by ID with ownership verification
     */
    public Order getOrderById(Long id, User currentUser, boolean isAdmin) {
        Order order = getOrderById(id);
        
        // Check if user owns the order or is admin
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to access this order");
        }
        
        return order;
    }

    /**
     * Get all orders for a user
     */
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    /**
     * Get paginated orders for a user
     */
    public Page<Order> getUserOrdersPaginated(Long userId, int page, int size, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, sortBy != null ? sortBy : "orderDate");
        Pageable pageable = PageRequest.of(page, size, sort);
        return orderRepository.findByUserId(userId, pageable);
    }

    /**
     * Update order status - admin/seller only
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus, boolean isAdminOrSeller) {
        if (!isAdminOrSeller) {
            throw new UnauthorizedException("Only admin or seller can update order status");
        }
        
        Order order = getOrderById(orderId);
        
        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);
        
        order.setStatus(newStatus);
        
        // If order is cancelled, restore stock
        if (newStatus == OrderStatus.CANCELLED && 
            (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CONFIRMED)) {
            restoreStock(order);
        }
        
        return orderRepository.save(order);
    }

    /**
     * Cancel order - user can cancel if PENDING/CONFIRMED
     */
    @Transactional
    public Order cancelOrder(Long orderId, User currentUser, boolean isAdmin) {
        Order order = getOrderById(orderId);
        
        // Verify ownership or admin
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to cancel this order");
        }
        
        // Check if order can be cancelled
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStatusException(
                    String.format("Order cannot be cancelled. Current status: %s", order.getStatus()));
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        
        // Restore stock
        restoreStock(order);
        
        return orderRepository.save(order);
    }

    /**
     * Get all orders with pagination - admin only
     */
    public Page<Order> getAllOrders(int page, int size, boolean isAdmin) {
        if (!isAdmin) {
            throw new UnauthorizedException("Only admin can view all orders");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(pageable);
    }

    /**
     * Delete order - admin only (soft delete preferred)
     * Note: This is a hard delete. For soft delete, add a 'deleted' flag to Order entity
     */
    @Transactional
    public void deleteOrder(Long id, boolean isAdmin) {
        if (!isAdmin) {
            throw new UnauthorizedException("Only admin can delete orders");
        }
        
        Order order = getOrderById(id);
        
        // Restore stock if order was not cancelled
        if (order.getStatus() != OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        
        orderRepository.delete(order);
    }

    /**
     * Restore stock when order is cancelled or deleted
     */
    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }

    /**
     * Validate status transition
     */
    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Define valid transitions
        switch (currentStatus) {
            case PENDING:
                if (newStatus != OrderStatus.CONFIRMED && newStatus != OrderStatus.CANCELLED) {
                    throw new InvalidOrderStatusException(
                            String.format("Cannot transition from %s to %s", currentStatus, newStatus));
                }
                break;
            case CONFIRMED:
                if (newStatus != OrderStatus.PROCESSING && newStatus != OrderStatus.CANCELLED) {
                    throw new InvalidOrderStatusException(
                            String.format("Cannot transition from %s to %s", currentStatus, newStatus));
                }
                break;
            case PROCESSING:
                if (newStatus != OrderStatus.SHIPPED) {
                    throw new InvalidOrderStatusException(
                            String.format("Cannot transition from %s to %s", currentStatus, newStatus));
                }
                break;
            case SHIPPED:
                if (newStatus != OrderStatus.DELIVERED) {
                    throw new InvalidOrderStatusException(
                            String.format("Cannot transition from %s to %s", currentStatus, newStatus));
                }
                break;
            case DELIVERED:
            case CANCELLED:
                throw new InvalidOrderStatusException(
                        String.format("Cannot change status from %s", currentStatus));
                break;
        }
    }
}

