package com.cart.ecom_proj.service;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.OrderItem;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.repo.OrderRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepo productRepo;

    /**
     * Generate a simple invoice PDF for an order.
     */
    public byte[] generateOrderInvoicePDF(Long orderId) throws IOException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph(String.format(Locale.US, "Invoice - Order #%d", order.getId())).setBold());
            document.add(new Paragraph(" "));

            // Order basic info
            Table infoTable = new Table(new float[]{1, 2});
            infoTable.setWidthPercent(100);
            infoTable.addCell(new Cell().add(new Paragraph("Order ID:")));
            infoTable.addCell(new Cell().add(new Paragraph(String.valueOf(order.getId()))));
            infoTable.addCell(new Cell().add(new Paragraph("Order Date:")));
            infoTable.addCell(new Cell().add(new Paragraph(String.valueOf(order.getOrderDate()))));
            infoTable.addCell(new Cell().add(new Paragraph("Customer:")));
            infoTable.addCell(new Cell().add(new Paragraph(order.getUser() != null ? order.getUser().getUsername() : "N/A")));
            document.add(infoTable);

            document.add(new Paragraph(" "));

            // Items table
            Table table = new Table(new float[]{4, 1, 2, 2});
            table.setWidthPercent(100);
            table.addHeaderCell(new Cell().add(new Paragraph("Product")));
            table.addHeaderCell(new Cell().add(new Paragraph("Qty")));
            table.addHeaderCell(new Cell().add(new Paragraph("Unit Price")));
            table.addHeaderCell(new Cell().add(new Paragraph("Subtotal")));

            for (OrderItem item : order.getOrderItems()) {
                Product p = item.getProduct();
                String name = p != null ? p.getName() : "(deleted product)";
                table.addCell(new Cell().add(new Paragraph(name)));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity()))));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getPriceAtOrder()))));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getSubtotal()))));
            }

            // Totals
            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(String.format("Total: $%s", order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0.00")).setBold());

            document.close();
            return baos.toByteArray();
        }
    }

    /**
     * Export a product list as CSV
     */
    public byte[] generateProductListCSV() throws IOException {
        List<Product> products = productRepo.findAll();

        try (StringWriter sw = new StringWriter(); CSVWriter writer = new CSVWriter(sw)) {
            // header
            String[] header = new String[]{"Id", "Name", "Brand", "Category", "Price", "StockQuantity", "Available"};
            writer.writeNext(header);

            for (Product p : products) {
                String[] row = new String[]{
                        String.valueOf(p.getId()),
                        p.getName(),
                        p.getBrand(),
                        p.getCategory(),
                        p.getPrice() != null ? p.getPrice().toString() : "",
                        p.getStockQuantity() != null ? p.getStockQuantity().toString() : "",
                        String.valueOf(p.isProductAvailable())
                };
                writer.writeNext(row);
            }
            writer.flush();
            return sw.toString().getBytes();
        }
    }

    /**
     * Generate an orders report PDF for a date range.
     */
    public byte[] generateOrderReportPDF(LocalDate startDate, LocalDate endDate) throws IOException {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByOrderDateBetweenAndDeletedFalse(start, end);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph(String.format("Orders Report (%s - %s)", startDate, endDate)).setBold());
            document.add(new Paragraph(" "));

            Table table = new Table(new float[]{1, 2, 2, 2});
            table.setWidthPercent(100);
            table.addHeaderCell(new Cell().add(new Paragraph("Order ID")));
            table.addHeaderCell(new Cell().add(new Paragraph("Date")));
            table.addHeaderCell(new Cell().add(new Paragraph("Customer")));
            table.addHeaderCell(new Cell().add(new Paragraph("Total")));

            for (Order o : orders) {
                table.addCell(new Cell().add(new Paragraph(String.valueOf(o.getId()))));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(o.getOrderDate()))));
                table.addCell(new Cell().add(new Paragraph(o.getUser() != null ? o.getUser().getUsername() : "N/A")));
                table.addCell(new Cell().add(new Paragraph(o.getTotalAmount() != null ? o.getTotalAmount().toString() : "0.00")));
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        }
    }

    /**
     * Generate a CSV containing sales/orders rows for a date range.
     */
    public byte[] generateSalesReportCSV(LocalDate startDate, LocalDate endDate) throws IOException {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByOrderDateBetweenAndDeletedFalse(start, end);

        try (StringWriter sw = new StringWriter(); CSVWriter writer = new CSVWriter(sw)) {
            String[] header = new String[]{"OrderId", "OrderDate", "Customer", "TotalAmount", "PaymentStatus", "Status"};
            writer.writeNext(header);

            for (Order o : orders) {
                String[] row = new String[]{
                        String.valueOf(o.getId()),
                        String.valueOf(o.getOrderDate()),
                        o.getUser() != null ? o.getUser().getUsername() : "N/A",
                        o.getTotalAmount() != null ? o.getTotalAmount().toString() : "0.00",
                        o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "",
                        o.getStatus() != null ? o.getStatus().name() : ""
                };
                writer.writeNext(row);
            }
            writer.flush();
            return sw.toString().getBytes();
        }
    }
}
