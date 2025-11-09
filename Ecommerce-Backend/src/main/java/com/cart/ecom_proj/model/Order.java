package com.cart.ecom_proj.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @Column(nullable = false)
    @NotNull(message = "Order date is required")
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Order status is required")
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false, precision = 19, scale = 2)
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Total must be greater than 0")
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 500)
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String billingAddress;

    @Column(nullable = false, length = 20)
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @Column(length = 1000)
    private String notes;

    private LocalDateTime deliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItem> orderItems = new ArrayList<>();

    @PrePersist
    private void setOrderDate() {
        if (this.orderDate == null) {
            this.orderDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    private void calculateTotal() {
        if (orderItems != null && !orderItems.isEmpty()) {
            this.totalAmount = orderItems.stream()
                    .map(OrderItem::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }

    @Column(nullable = false)
    private boolean deleted = false;
}

