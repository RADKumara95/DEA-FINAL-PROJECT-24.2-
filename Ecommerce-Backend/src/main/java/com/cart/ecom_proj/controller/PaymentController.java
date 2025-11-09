package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.service.OrderService;
import com.cart.ecom_proj.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/create-payment-intent/{orderId}")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            PaymentIntent paymentIntent = paymentService.createPaymentIntent(order);
            
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/confirm/{paymentIntentId}")
    public ResponseEntity<Map<String, String>> confirmPayment(@PathVariable String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = paymentService.confirmPayment(paymentIntentId);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", paymentIntent.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/refund/{paymentIntentId}")
    public ResponseEntity<Map<String, String>> refundPayment(@PathVariable String paymentIntentId) {
        try {
            paymentService.refundPayment(paymentIntentId);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "refunded");
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}