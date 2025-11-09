package com.cart.ecom_proj.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdvancedSearchRequest {
    private String keyword;
    private String category;
    private String brand;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean available;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDir;
}