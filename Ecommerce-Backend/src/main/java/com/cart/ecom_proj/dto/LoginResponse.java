package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String username;
    private String email;
    private Set<String> roles;
    private String message;
}

