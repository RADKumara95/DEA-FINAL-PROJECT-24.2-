package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.CreateOrderRequest;
import com.cart.ecom_proj.dto.OrderItemResponse;
import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.dto.UpdateOrderStatusRequest;
import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.OrderItem;
import com.cart.ecom_proj.model.OrderStatus;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.service.OrderService;
import com.cart.ecom_proj.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getUserByUsername(authentication.getName());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        User user = getCurrentUser();
        Order order = orderService.createOrder(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToOrderResponse(order));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderResponse>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy) {
        User user = getCurrentUser();
        Page<Order> orders = orderService.getUserOrdersPaginated(user.getId(), page, size, sortBy);
        Page<OrderResponse> orderResponses = orders.map(this::mapToOrderResponse);
        return ResponseEntity.ok(orderResponses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        User user = getCurrentUser();
        Order order = orderService.getOrderByIdForUser(id, user.getId());
        return ResponseEntity.ok(mapToOrderResponse(order));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        User user = getCurrentUser();
        Order order = orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(mapToOrderResponse(order));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {
        Page<Order> orders = orderService.getAllOrders(page, size, status);
        Page<OrderResponse> orderResponses = orders.map(this::mapToOrderResponse);
        return ResponseEntity.ok(orderResponses);
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order order = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(mapToOrderResponse(order));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok().body("Order deleted successfully");
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderDate(order.getOrderDate());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setShippingAddress(order.getShippingAddress());
        response.setBillingAddress(order.getBillingAddress());
        response.setPhoneNumber(order.getPhoneNumber());
        response.setNotes(order.getNotes());
        response.setDeliveryDate(order.getDeliveryDate());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setUsername(order.getUser().getUsername());

        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());
        response.setItems(itemResponses);

        return response;
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct().getId());
        response.setProductName(item.getProduct().getName());
        response.setQuantity(item.getQuantity());
        response.setPriceAtOrder(item.getPriceAtOrder());
        response.setSubtotal(item.getSubtotal());
        return response;
    }
}

