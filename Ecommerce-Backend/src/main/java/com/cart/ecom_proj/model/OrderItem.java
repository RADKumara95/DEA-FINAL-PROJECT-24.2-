package com.cart.ecom_proj.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @NotNull(message = "Order is required")
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @NotNull(message = "Product is required")
    private Product product;

    @Column(nullable = false)
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Column(nullable = false, precision = 19, scale = 2)
    @NotNull(message = "Price at order is required")
    private BigDecimal priceAtOrder;

    @Column(nullable = false, precision = 19, scale = 2)
    @NotNull(message = "Subtotal is required")
    private BigDecimal subtotal;

    @PrePersist
    @PreUpdate
    private void calculateSubtotal() {
        if (quantity != null && priceAtOrder != null) {
            this.subtotal = priceAtOrder.multiply(BigDecimal.valueOf(quantity));
        }
    }
}

