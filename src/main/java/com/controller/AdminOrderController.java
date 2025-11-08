package com.controller;

import com.dto.OrderResponse;
import com.dto.UpdateOrderStatusRequest;
import com.exception.InvalidOrderStatusException;
import com.exception.ResourceNotFoundException;
import com.exception.UnauthorizedException;
import com.model.Order;
import com.model.OrderItem;
import com.model.OrderStatus;
import com.repository.OrderRepository;
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
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public AdminOrderController(OrderService orderService, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    /**
     * GET /api/admin/orders - Get all orders (admin only) with pagination, filtering by status
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<?> getAllOrders(
            @RequestHeader(value = "X-Is-Admin", required = false, defaultValue = "false") boolean isAdmin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {
        
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin access required");
        }
        
        try {
            Page<Order> orderPage;
            
            if (status != null) {
                // Filter by status
                Pageable pageable = PageRequest.of(page, size, 
                        Sort.by(Sort.Direction.DESC, "orderDate"));
                orderPage = orderRepository.findByStatus(status, pageable);
            } else {
                // Get all orders
                orderPage = orderService.getAllOrders(page, size, isAdmin);
            }
            
            Page<OrderResponse> responsePage = orderPage.map(this::mapToOrderResponse);
            return ResponseEntity.ok(responsePage);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching orders: " + e.getMessage());
        }
    }

    /**
     * PUT /api/admin/orders/{id}/status - Update order status (admin/seller only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @RequestHeader(value = "X-Is-Admin", required = false, defaultValue = "false") boolean isAdmin,
            @RequestHeader(value = "X-Is-Seller", required = false, defaultValue = "false") boolean isSeller) {
        
        boolean isAdminOrSeller = isAdmin || isSeller;
        
        if (!isAdminOrSeller) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin or seller access required");
        }
        
        try {
            Order order = orderService.updateOrderStatus(id, request.getStatus(), isAdminOrSeller);
            
            // Update delivery date and notes if provided
            if (request.getDeliveryDate() != null) {
                order.setDeliveryDate(request.getDeliveryDate());
            }
            if (request.getNotes() != null) {
                order.setNotes(request.getNotes());
            }
            
            // Save updated order
            order = orderRepository.save(order);
            
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
                    .body("Error updating order status: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/admin/orders/{id} - Delete order (admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrder(
            @PathVariable Long id,
            @RequestHeader(value = "X-Is-Admin", required = false, defaultValue = "false") boolean isAdmin) {
        
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin access required");
        }
        
        try {
            orderService.deleteOrder(id, isAdmin);
            return ResponseEntity.ok("Order deleted successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting order: " + e.getMessage());
        }
    }

    /**
     * Map Order entity to OrderResponse DTO
     */
    private OrderResponse mapToOrderResponse(Order order) {
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

