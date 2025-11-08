package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private BigDecimal priceAtOrder;
    private BigDecimal subtotal;
}

