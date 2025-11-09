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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Orders", description = "Order management APIs for customers and administrators")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getUserByUsername(authentication.getName());
    }

    @Operation(summary = "Create new order", description = "Create a new order with items from the cart")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Order created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid order data or insufficient inventory"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Order creation details", required = true,
            content = @Content(schema = @Schema(implementation = CreateOrderRequest.class))) CreateOrderRequest request) {
        User user = getCurrentUser();
        Order order = orderService.createOrder(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToOrderResponse(order));
    }

    @Operation(summary = "Get user orders", description = "Get paginated list of orders for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderResponse>> getUserOrders(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field", example = "orderDate") @RequestParam(defaultValue = "orderDate") String sortBy) {
        User user = getCurrentUser();
        Page<Order> orders = orderService.getUserOrdersPaginated(user.getId(), page, size, sortBy);
        Page<OrderResponse> orderResponses = orders.map(this::mapToOrderResponse);
        return ResponseEntity.ok(orderResponses);
    }

    @Operation(summary = "Get specific order", description = "Get details of a specific order for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Order does not belong to user"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrder(@Parameter(description = "Order ID", example = "1") @PathVariable Long id) {
        User user = getCurrentUser();
        Order order = orderService.getOrderByIdForUser(id, user.getId());
        return ResponseEntity.ok(mapToOrderResponse(order));
    }

    @Operation(summary = "Cancel order", description = "Cancel an order (if cancellable)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order cancelled successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Order cannot be cancelled"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Order does not belong to user"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> cancelOrder(@Parameter(description = "Order ID", example = "1") @PathVariable Long id) {
        User user = getCurrentUser();
        Order order = orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(mapToOrderResponse(order));
    }

    @Operation(summary = "Get all orders (Admin/Seller)", description = "Get paginated list of all orders with optional status filter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin/Seller role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filter by order status", example = "PENDING") @RequestParam(required = false) OrderStatus status) {
        Page<Order> orders = orderService.getAllOrders(page, size, status);
        Page<OrderResponse> orderResponses = orders.map(this::mapToOrderResponse);
        return ResponseEntity.ok(orderResponses);
    }

    @Operation(summary = "Update order status (Admin/Seller)", description = "Update the status of an order")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order status updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status transition"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin/Seller role required"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @Parameter(description = "Order ID", example = "1") @PathVariable Long id,
            @Valid @RequestBody @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "New order status", required = true,
                    content = @Content(schema = @Schema(implementation = UpdateOrderStatusRequest.class))) UpdateOrderStatusRequest request) {
        Order order = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(mapToOrderResponse(order));
    }

    @Operation(summary = "Delete order (Admin)", description = "Permanently delete an order from the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order deleted successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrder(@Parameter(description = "Order ID", example = "1") @PathVariable Long id) {
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

