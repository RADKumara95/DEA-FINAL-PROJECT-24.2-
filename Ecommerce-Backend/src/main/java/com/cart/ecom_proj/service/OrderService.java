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

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepo productRepo;

    @Autowired(required = false)
    private EmailService emailService;

    public Order createOrder(CreateOrderRequest request, User user) {
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress() != null ? request.getBillingAddress() : request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setNotes(request.getNotes());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepo.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Validate stock availability
            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for product: " + product.getName() + ". Available: " + product.getStockQuantity());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPriceAtOrder(product.getPrice());
            orderItem.calculateAndSetSubtotal();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepo.save(product);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        
        // Send order confirmation email
        if (emailService != null) {
            try {
                emailService.sendOrderConfirmationEmail(savedOrder);
            } catch (Exception e) {
                // Log error but don't fail order creation
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
            }
        }
        
        return savedOrder;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    public Order getOrderByIdForUser(Long id, Long userId) {
        Order order = getOrderById(id);
        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to access this order");
        }
        return order;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public Page<Order> getUserOrdersPaginated(Long userId, int page, int size, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, sortBy != null ? sortBy : "orderDate");
        Pageable pageable = PageRequest.of(page, size, sort);
        return orderRepository.findByUserId(userId, pageable);
    }

    public Order updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = getOrderById(orderId);
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(request.getStatus());
        if (request.getDeliveryDate() != null) {
            order.setDeliveryDate(request.getDeliveryDate());
        }
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }
        if (request.getStatus() == OrderStatus.DELIVERED) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Send status update email if status changed
        if (emailService != null && !oldStatus.equals(request.getStatus())) {
            try {
                emailService.sendOrderStatusUpdateEmail(savedOrder);
            } catch (Exception e) {
                // Log error but don't fail status update
                System.err.println("Failed to send order status update email: " + e.getMessage());
            }
        }
        
        return savedOrder;
    }

    public Order cancelOrder(Long orderId, Long userId) {
        Order order = getOrderById(orderId);
        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to cancel this order");
        }
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        // Restore product stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepo.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        return orderRepository.save(order);
    }

    public Page<Order> getAllOrders(int page, int size, OrderStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        if (status != null) {
            return orderRepository.findByStatus(status, pageable);
        }
        return orderRepository.findAll(pageable);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        // Soft delete: mark as deleted instead of physically removing from DB
        order.setDeleted(true);
        orderRepository.save(order);
    }
}

