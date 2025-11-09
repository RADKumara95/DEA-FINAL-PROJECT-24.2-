package com.cart.ecom_proj.service;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Email service for sending various types of emails to users.
 * Supports welcome emails, order confirmations, status updates, and password resets.
 * Uses external HTML templates for better maintainability and customization.
 * 
 * Email functionality is optional - the service gracefully handles cases where
 * email is not configured by making the JavaMailSender dependency optional.
 */
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    // 'from' address will default to spring.mail.username

    /**
     * Loads an email template from the classpath resources.
     * 
     * @param path the path to the template file in resources
     * @return the template content as a string
     * @throws IOException if the template cannot be loaded
     */
    private String loadTemplate(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream in = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining(System.lineSeparator()));
        }
    }

    /**
     * Sends a welcome email to a newly registered user.
     * 
     * @param user the user who just registered
     * @throws MessagingException if email sending fails
     * @throws IOException if template loading fails
     */
    public void sendWelcomeEmail(User user) throws MessagingException, IOException {
        if (mailSender == null) {
            // Email not configured, skip sending gracefully
            return;
        }
        
        String content = loadTemplate("templates/welcome-email.html");
        content = content.replace("{{username}}", user.getUsername() == null ? "" : user.getUsername())
                .replace("{{firstName}}", user.getFirstName() == null ? "" : user.getFirstName());

        sendHtmlEmail(user.getEmail(), "Welcome to Our Store", content);
    }

    /**
     * Sends an order confirmation email when an order is placed.
     * 
     * @param order the order that was placed
     * @throws MessagingException if email sending fails
     * @throws IOException if template loading fails
     */
    public void sendOrderConfirmationEmail(Order order) throws MessagingException, IOException {
        if (mailSender == null) {
            return;
        }
        
        String content = loadTemplate("templates/order-confirmation-email.html");
        String itemsHtml = order.getOrderItems().stream().map(oi ->
                String.format("<li>%s x %d - %s", oi.getProduct().getName(), oi.getQuantity(), oi.getSubtotal().setScale(2, RoundingMode.HALF_UP).toString())
        ).collect(Collectors.joining(""));

        content = content.replace("{{username}}", order.getUser().getFirstName() == null ? order.getUser().getUsername() : order.getUser().getFirstName())
                .replace("{{orderId}}", String.valueOf(order.getId()))
                .replace("{{totalAmount}}", order.getTotalAmount() == null ? "0.00" : order.getTotalAmount().setScale(2, RoundingMode.HALF_UP).toString())
                .replace("{{items}}", itemsHtml);

        sendHtmlEmail(order.getUser().getEmail(), "Order Confirmation - Order #" + order.getId(), content);
    }

    /**
     * Sends an email notification when an order status is updated.
     * 
     * @param order the order with updated status
     * @throws MessagingException if email sending fails
     * @throws IOException if template loading fails
     */
    public void sendOrderStatusUpdateEmail(Order order) throws MessagingException, IOException {
        if (mailSender == null) {
            return;
        }
        
        String content = loadTemplate("templates/order-status-update-email.html");
        content = content.replace("{{username}}", order.getUser().getFirstName() == null ? order.getUser().getUsername() : order.getUser().getFirstName())
                .replace("{{orderId}}", String.valueOf(order.getId()))
                .replace("{{status}}", order.getStatus() == null ? "" : order.getStatus().name());

        sendHtmlEmail(order.getUser().getEmail(), "Order #" + order.getId() + " - Status Update", content);
    }

    /**
     * Sends a password reset email to a user who requested to reset their password.
     * 
     * @param user the user requesting password reset
     * @param token the reset token to include in the email
     * @throws MessagingException if email sending fails
     * @throws IOException if template loading fails
     */
    public void sendPasswordResetEmail(User user, String token) throws MessagingException, IOException {
        if (mailSender == null) {
            return;
        }
        
        String content = loadTemplate("templates/password-reset-email.html");
        String resetLink = ""; // You may construct a frontend URL here: e.g. https://your-frontend/reset?token=" + token
        content = content.replace("{{username}}", user.getUsername() == null ? "" : user.getUsername())
                .replace("{{resetLink}}", resetLink)
                .replace("{{token}}", token == null ? "" : token);

        sendHtmlEmail(user.getEmail(), "Password Reset Request", content);
    }

    /**
     * Helper method to send HTML emails.
     * 
     * @param to the recipient email address
     * @param subject the email subject
     * @param htmlContent the HTML content of the email
     * @throws MessagingException if email sending fails
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        helper.setText(htmlContent, true);
        helper.setTo(to);
        helper.setSubject(subject);
        // from will be taken from mailSender properties (spring.mail.username)
        mailSender.send(message);
    }
}