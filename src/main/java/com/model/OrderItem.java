package com.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    @NotNull
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Column(name = "price_at_order", nullable = false, precision = 19, scale = 2)
    @NotNull
    private BigDecimal priceAtOrder;

    @Column(name = "subtotal", nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotal;

    public OrderItem() {
    }

    public OrderItem(Product product, Integer quantity, BigDecimal priceAtOrder) {
        this.product = product;
        this.quantity = quantity;
        this.priceAtOrder = priceAtOrder;
        calculateSubtotal();
    }

    @PrePersist
    @PreUpdate
    protected void calculateSubtotal() {
        if (quantity != null && priceAtOrder != null) {
            subtotal = priceAtOrder.multiply(BigDecimal.valueOf(quantity));
        } else {
            subtotal = BigDecimal.ZERO;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        calculateSubtotal();
    }

    public BigDecimal getPriceAtOrder() {
        return priceAtOrder;
    }

    public void setPriceAtOrder(BigDecimal priceAtOrder) {
        this.priceAtOrder = priceAtOrder;
        calculateSubtotal();
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    @Override
    public String toString() {
        return "OrderItem{" +
                "id=" + id +
                ", product=" + (product != null ? product.getId() : null) +
                ", quantity=" + quantity +
                ", priceAtOrder=" + priceAtOrder +
                ", subtotal=" + subtotal +
                '}';
    }
}

