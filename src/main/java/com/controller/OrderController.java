package com.controller;

import com.dto.CreateOrderRequest;
import com.dto.OrderResponse;
import com.exception.InsufficientStockException;
import com.exception.InvalidOrderStatusException;
import com.exception.ResourceNotFoundException;
import com.exception.UnauthorizedException;
import com.model.Order;
import com.model.OrderItem;
import com.model.OrderStatus;
import com.model.User;
import com.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/orders - Create new order (authenticated users)
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // TODO: Replace with proper authentication mechanism (e.g., Spring Security)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
        }
        
        // TODO: Fetch user from authentication context or user service
        // For now, creating a minimal user object
        User user = new User();
        user.setId(userId);
        
        try {
            Order order = orderService.createOrder(request, user);
            OrderResponse response = mapToOrderResponse(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InsufficientStockException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating order: " + e.getMessage());
        }
    }

    /**
     * GET /api/orders - Get current user's orders with pagination & sorting
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserOrders(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
        }
        
        try {
            Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? 
                    Sort.Direction.ASC : Sort.Direction.DESC;
            Page<Order> orderPage = orderService.getUserOrdersPaginated(
                    userId, page, size, sortBy);
            
            Page<OrderResponse> responsePage = orderPage.map(this::mapToOrderResponse);
            return ResponseEntity.ok(responsePage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching orders: " + e.getMessage());
        }
    }

    /**
     * GET /api/orders/{id} - Get specific order details (owner or admin)
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Is-Admin", required = false, defaultValue = "false") boolean isAdmin) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
        }
        
        try {
            User user = new User();
            user.setId(userId);
            
            Order order = orderService.getOrderById(id, user, isAdmin);
            OrderResponse response = mapToOrderResponse(order);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching order: " + e.getMessage());
        }
    }

    /**
     * PUT /api/orders/{id}/cancel - Cancel order (owner or admin)
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Is-Admin", required = false, defaultValue = "false") boolean isAdmin) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
        }
        
        try {
            User user = new User();
            user.setId(userId);
            
            Order order = orderService.cancelOrder(id, user, isAdmin);
            OrderResponse response = mapToOrderResponse(order);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (InvalidOrderStatusException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error cancelling order: " + e.getMessage());
        }
    }

    /**
     * Map Order entity to OrderResponse DTO
     * Made package-private for use by AdminOrderController
     */
    OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderDate(order.getOrderDate());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setShippingAddress(order.getShippingAddress());
        response.setPaymentStatus(order.getPaymentStatus());
        
        // Map order items
        List<OrderResponse.OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());
        response.setItems(itemResponses);
        
        return response;
    }

    /**
     * Map OrderItem entity to OrderItemResponse DTO
     */
    private OrderResponse.OrderItemResponse mapToOrderItemResponse(OrderItem orderItem) {
        OrderResponse.OrderItemResponse itemResponse = new OrderResponse.OrderItemResponse();
        itemResponse.setId(orderItem.getId());
        itemResponse.setProductId(orderItem.getProduct().getId());
        itemResponse.setProductName(orderItem.getProduct().getName());
        itemResponse.setQuantity(orderItem.getQuantity());
        itemResponse.setPriceAtOrder(orderItem.getPriceAtOrder());
        itemResponse.setSubtotal(orderItem.getSubtotal());
        return itemResponse;
    }
}

