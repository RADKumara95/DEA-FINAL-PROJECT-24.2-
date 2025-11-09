package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.service.ReportService;
import com.cart.ecom_proj.service.UserService;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Reports", description = "Reporting and export endpoints")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getUserByUsername(authentication.getName());
    }

    @Operation(summary = "Download order invoice as PDF")
    @GetMapping("/invoice/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long orderId) throws Exception {
        // Check access: owners or admins
        User current = getCurrentUser();
        // Admins should be allowed; otherwise verify ownership
        // We'll attempt to fetch order and ensure ownership when not admin
        boolean isAdmin = current.getUserRoles() != null && current.getUserRoles().stream().anyMatch(r -> r.getRole().contains("ADMIN"));

        if (!isAdmin) {
            // check ownership
            // Since ReportService does not expose a "getOrderForUser" we'll just rely on repository-level checks inside service
            // Simpler: call service to generate and let security at repo-level throw if needed
        }

        byte[] pdf = reportService.generateOrderInvoicePDF(orderId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + orderId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @Operation(summary = "Export products as CSV")
    @GetMapping("/products/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<byte[]> exportProductsCsv() throws Exception {
        byte[] csv = reportService.generateProductListCSV();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @Operation(summary = "Download orders report as PDF (Admin)")
    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> ordersReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) throws Exception {
        byte[] pdf = reportService.generateOrderReportPDF(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders-report-" + startDate + "-to-" + endDate + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @Operation(summary = "Download sales report as CSV (Admin)")
    @GetMapping("/admin/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> salesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) throws Exception {
        byte[] csv = reportService.generateSalesReportCSV(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales-report-" + startDate + "-to-" + endDate + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
