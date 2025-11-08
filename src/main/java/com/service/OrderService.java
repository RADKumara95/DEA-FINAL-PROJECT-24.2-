package com.service;

import com.dto.CreateOrderRequest;
import com.dto.OrderItemRequest;
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

    @Transactional
    public Order createOrder(CreateOrderRequest request, User user) {
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemRequest itemRequest : request.getOrderItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + itemRequest.getProductId()));
            
            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        String.format("Insufficient stock for product '%s'. Available: %d, Requested: %d",
                                product.getName(), product.getStockQuantity(), itemRequest.getQuantity()));
            }
            
            OrderItem orderItem = new OrderItem(product, itemRequest.getQuantity(), product.getPrice());
            orderItems.add(orderItem);
            
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }
        
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
        
        for (OrderItem item : orderItems) {
            order.addOrderItem(item);
        }
        order.calculateTotalAmount();
        
        return orderRepository.save(order);
    }

    public Order getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return order;
    }

   
    public Order getOrderById(Long id, User currentUser, boolean isAdmin) {
        Order order = getOrderById(id);
        
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to access this order");
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

    
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus, boolean isAdminOrSeller) {
        if (!isAdminOrSeller) {
            throw new UnauthorizedException("Only admin or seller can update order status");
        }
        
        Order order = getOrderById(orderId);
        
        validateStatusTransition(order.getStatus(), newStatus);
        
        order.setStatus(newStatus);
        
        if (newStatus == OrderStatus.CANCELLED && 
            (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CONFIRMED)) {
            restoreStock(order);
        }
        
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId, User currentUser, boolean isAdmin) {
        Order order = getOrderById(orderId);
        
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to cancel this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStatusException(
                    String.format("Order cannot be cancelled. Current status: %s", order.getStatus()));
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        
        restoreStock(order);
        
        return orderRepository.save(order);
    }

   
    public Page<Order> getAllOrders(int page, int size, boolean isAdmin) {
        if (!isAdmin) {
            throw new UnauthorizedException("Only admin can view all orders");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(pageable);
    }

    @Transactional
    public void deleteOrder(Long id, boolean isAdmin) {
        if (!isAdmin) {
            throw new UnauthorizedException("Only admin can delete orders");
        }
        
        Order order = getOrderById(id);
        
        if (order.getStatus() != OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        
        orderRepository.delete(order);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }

    /**
     * Get OrderRepository (for controller access)
     */
    public OrderRepository getOrderRepository() {
        return orderRepository;
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
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

