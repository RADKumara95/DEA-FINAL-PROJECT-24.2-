package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.PaymentStatus;
import com.cart.ecom_proj.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhook")
public class StripeWebhookController {

    @Autowired
    private OrderService orderService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            
            // Handle the event
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (paymentIntent != null) {
                        String orderId = paymentIntent.getMetadata().get("orderId");
                        if (orderId != null) {
                            orderService.updateOrderPaymentStatus(Long.parseLong(orderId), PaymentStatus.PAID);
                        }
                    }
                    break;
                case "payment_intent.payment_failed":
                    paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (paymentIntent != null) {
                        String orderId = paymentIntent.getMetadata().get("orderId");
                        if (orderId != null) {
                            orderService.updateOrderPaymentStatus(Long.parseLong(orderId), PaymentStatus.FAILED);
                        }
                    }
                    break;
                default:
                    // Unexpected event type
                    return ResponseEntity.badRequest().body("Unhandled event type: " + event.getType());
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing webhook: " + e.getMessage());
        }
    }
}