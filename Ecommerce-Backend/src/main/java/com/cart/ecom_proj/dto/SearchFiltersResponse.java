package com.cart.ecom_proj.dto;

import lombok.Data;

@Data
public class SearchFiltersResponse {
    private List<String> categories;
    private List<String> brands;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Constructor for easy initialization
    public SearchFiltersResponse(List<String> categories, List<String> brands, BigDecimal minPrice, BigDecimal maxPrice) {
        this.categories = categories;
        this.brands = brands;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
}