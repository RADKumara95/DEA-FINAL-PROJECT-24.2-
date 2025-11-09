package com.cart.ecom_proj.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchFiltersResponse {
    private List<String> categories;
    private List<String> brands;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}