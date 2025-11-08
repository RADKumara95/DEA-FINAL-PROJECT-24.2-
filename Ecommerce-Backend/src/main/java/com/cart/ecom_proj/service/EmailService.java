package com.cart.ecom_proj.service;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final String FROM_EMAIL = "noreply@ecommerce.com";

    public void sendWelcomeEmail(User user) {
        if (mailSender == null) {
            // Email not configured, skip sending
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to Our E-commerce Platform!");

            String htmlContent = buildWelcomeEmailContent(user);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            // Log error but don't fail the registration process
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    public void sendOrderConfirmationEmail(Order order) {
        if (mailSender == null) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Confirmation - Order #" + order.getId());

            String htmlContent = buildOrderConfirmationEmailContent(order);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }

    public void sendOrderStatusUpdateEmail(Order order) {
        if (mailSender == null) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Status Update - Order #" + order.getId());

            String htmlContent = buildOrderStatusUpdateEmailContent(order);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send order status update email: " + e.getMessage());
        }
    }

    private String buildWelcomeEmailContent(User user) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".container{max-width:600px;margin:0 auto;padding:20px;}");
        html.append(".header{background-color:#4CAF50;color:white;padding:20px;text-align:center;}");
        html.append(".content{padding:20px;background-color:#f9f9f9;}");
        html.append(".footer{text-align:center;padding:20px;color:#666;font-size:12px;}</style></head><body>");
        html.append("<div class='container'>");
        html.append("<div class='header'><h1>Welcome!</h1></div>");
        html.append("<div class='content'>");
        html.append("<h2>Hello ").append(user.getFirstName() != null ? user.getFirstName() : user.getUsername()).append("!</h2>");
        html.append("<p>Thank you for registering with our e-commerce platform.</p>");
        html.append("<p>Your account has been successfully created with the username: <strong>").append(user.getUsername()).append("</strong></p>");
        html.append("<p>You can now start shopping and enjoy our amazing products!</p>");
        html.append("</div>");
        html.append("<div class='footer'><p>&copy; 2024 E-commerce Platform. All rights reserved.</p></div>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String buildOrderConfirmationEmailContent(Order order) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' HH:mm");
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".container{max-width:600px;margin:0 auto;padding:20px;}");
        html.append(".header{background-color:#2196F3;color:white;padding:20px;text-align:center;}");
        html.append(".content{padding:20px;background-color:#f9f9f9;}");
        html.append(".order-details{background-color:white;padding:15px;margin:15px 0;border-left:4px solid #2196F3;}");
        html.append(".item-row{padding:10px 0;border-bottom:1px solid #eee;}");
        html.append(".footer{text-align:center;padding:20px;color:#666;font-size:12px;}</style></head><body>");
        html.append("<div class='container'>");
        html.append("<div class='header'><h1>Order Confirmed!</h1></div>");
        html.append("<div class='content'>");
        html.append("<h2>Thank you for your order!</h2>");
        html.append("<div class='order-details'>");
        html.append("<p><strong>Order ID:</strong> #").append(order.getId()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(order.getOrderDate().format(dateFormatter)).append("</p>");
        html.append("<p><strong>Status:</strong> ").append(order.getStatus()).append("</p>");
        html.append("<p><strong>Payment Method:</strong> ").append(order.getPaymentMethod()).append("</p>");
        html.append("<h3>Order Items:</h3>");
        
        order.getOrderItems().forEach(item -> {
            html.append("<div class='item-row'>");
            html.append("<p><strong>").append(item.getProduct().getName()).append("</strong></p>");
            html.append("<p>Quantity: ").append(item.getQuantity()).append(" x ").append(currencyFormat.format(item.getPriceAtOrder()))
                .append(" = ").append(currencyFormat.format(item.getSubtotal())).append("</p>");
            html.append("</div>");
        });
        
        html.append("<p style='font-size:18px;font-weight:bold;margin-top:20px;'>Total: ").append(currencyFormat.format(order.getTotalAmount())).append("</p>");
        html.append("<h3>Shipping Address:</h3>");
        html.append("<p>").append(order.getShippingAddress()).append("</p>");
        html.append("</div>");
        html.append("<p>We'll send you another email when your order ships.</p>");
        html.append("</div>");
        html.append("<div class='footer'><p>&copy; 2024 E-commerce Platform. All rights reserved.</p></div>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String buildOrderStatusUpdateEmailContent(Order order) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' HH:mm");
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".container{max-width:600px;margin:0 auto;padding:20px;}");
        html.append(".header{background-color:#FF9800;color:white;padding:20px;text-align:center;}");
        html.append(".content{padding:20px;background-color:#f9f9f9;}");
        html.append(".order-details{background-color:white;padding:15px;margin:15px 0;border-left:4px solid #FF9800;}");
        html.append(".footer{text-align:center;padding:20px;color:#666;font-size:12px;}</style></head><body>");
        html.append("<div class='container'>");
        html.append("<div class='header'><h1>Order Status Update</h1></div>");
        html.append("<div class='content'>");
        html.append("<h2>Your order status has been updated</h2>");
        html.append("<div class='order-details'>");
        html.append("<p><strong>Order ID:</strong> #").append(order.getId()).append("</p>");
        html.append("<p><strong>New Status:</strong> <span style='font-size:18px;font-weight:bold;color:#FF9800;'>").append(order.getStatus()).append("</span></p>");
        
        if (order.getDeliveryDate() != null) {
            html.append("<p><strong>Expected Delivery:</strong> ").append(order.getDeliveryDate().format(dateFormatter)).append("</p>");
        }
        
        if (order.getNotes() != null && !order.getNotes().isEmpty()) {
            html.append("<p><strong>Notes:</strong> ").append(order.getNotes()).append("</p>");
        }
        
        html.append("</div>");
        html.append("<p>You can track your order status in your account dashboard.</p>");
        html.append("</div>");
        html.append("<div class='footer'><p>&copy; 2024 E-commerce Platform. All rights reserved.</p></div>");
        html.append("</div></body></html>");
        return html.toString();
    }
}

