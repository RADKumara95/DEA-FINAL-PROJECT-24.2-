package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api")
@Tag(name = "Products", description = "Product management APIs")
public class ProductController {

    @Autowired
    private ProductService service;

    @Operation(summary = "Get all products", description = "Retrieve all products with optional pagination and sorting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "12")
            @RequestParam(required = false, defaultValue = "12") int size,
            @Parameter(description = "Sort field", example = "id")
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)", example = "asc")
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        
        // If pagination parameters are provided, return paginated results
        if (page >= 0 && size > 0) {
            Page<Product> productsPage = service.getAllProductsPaginated(page, size, sortBy, sortDir);
            return ResponseEntity.ok(productsPage);
        }
        
        // Otherwise return all products (for backward compatibility)
        List<Product> products = service.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @Operation(summary = "Get product by ID", description = "Retrieve a specific product by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class))),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(
            @Parameter(description = "Product ID", required = true, example = "1")
            @PathVariable int id){
        Product product = service.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @Operation(summary = "Add new product", description = "Create a new product (Admin/Seller only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Product created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin/Seller role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @PostMapping("/product")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<Product> addProduct(
            @Parameter(description = "Product details", required = true)
            @Valid @RequestPart Product product,
            @Parameter(description = "Product image file")
            @RequestPart(required = false) MultipartFile imageFile) {
        try {
            Product savedProduct = service.addProduct(product, imageFile);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Get product image", description = "Retrieve product image by product ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Image retrieved successfully",
                    content = @Content(mediaType = "image/*")),
            @ApiResponse(responseCode = "404", description = "Product or image not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(
            @Parameter(description = "Product ID", required = true, example = "1")
            @PathVariable int productId){
        Product product = service.getProductById(productId);
        if (product == null || product.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageFile = product.getImageData();

        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(product.getImageType()))
                .body(imageFile);
    }

    @Operation(summary = "Update product", description = "Update an existing product (Admin/Seller only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin/Seller role required"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @PutMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(
            @Parameter(description = "Product ID", required = true, example = "1")
            @PathVariable int id,
            @Parameter(description = "Updated product details", required = true)
            @Valid @RequestPart Product product,
            @Parameter(description = "New product image file")
            @RequestPart(required = false) MultipartFile imageFile){
        try {
            Product updatedProduct = service.updateProduct(id, product, imageFile);
            return ResponseEntity.ok(updatedProduct);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Delete product", description = "Delete a product (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "cookieAuth")
    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(
            @Parameter(description = "Product ID", required = true, example = "1")
            @PathVariable int id){
        service.deleteProduct(id);
        return ResponseEntity.ok().body("Product deleted successfully");
    }

    @Operation(summary = "Search products", description = "Search products by keyword with optional pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/products/search")
    public ResponseEntity<?> searchProducts(
            @Parameter(description = "Search keyword", required = true, example = "laptop")
            @RequestParam String keyword,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "12")
            @RequestParam(required = false, defaultValue = "12") int size,
            @Parameter(description = "Sort field", example = "id")
            @RequestParam(required = false, defaultValue = "id") String sortBy) {
        
        if (page >= 0 && size > 0) {
            Page<Product> productsPage = service.searchProductsPaginated(keyword, page, size, sortBy);
            return ResponseEntity.ok(productsPage);
        }
        
        List<Product> products = service.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @Operation(summary = "Advanced product search", description = "Search products with multiple criteria and pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Advanced search completed successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/products/advanced-search")
    public ResponseEntity<Page<Product>> advancedSearch(
            @Parameter(description = "Search keyword", example = "laptop")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Product category", example = "Electronics")
            @RequestParam(required = false) String category,
            @Parameter(description = "Product brand", example = "Dell")
            @RequestParam(required = false) String brand,
            @Parameter(description = "Minimum price", example = "100.00")
            @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price", example = "1000.00")
            @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Product availability", example = "true")
            @RequestParam(required = false) Boolean available,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "12")
            @RequestParam(required = false, defaultValue = "12") int size,
            @Parameter(description = "Sort field", example = "id")
            @RequestParam(required = false, defaultValue = "id") String sortBy) {
        
        Page<Product> products = service.advancedSearchProducts(
                keyword, category, brand, minPrice, maxPrice, available, page, size, sortBy);
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Filter products", description = "Filter products by various criteria with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Products filtered successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "400", description = "Invalid filter parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/products/filter")
    public ResponseEntity<?> filterProducts(
            @Parameter(description = "Filter by category", example = "Electronics")
            @RequestParam(required = false) String category,
            @Parameter(description = "Filter by brand", example = "Dell")
            @RequestParam(required = false) String brand,
            @Parameter(description = "Minimum price", example = "100.00")
            @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price", example = "1000.00")
            @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "12")
            @RequestParam(required = false, defaultValue = "12") int size) {
        
        if (category != null) {
            Page<Product> products = service.filterProductsByCategoryPaginated(category, page, size);
            return ResponseEntity.ok(products);
        }
        
        if (brand != null) {
            Page<Product> products = service.filterProductsByBrandPaginated(brand, page, size);
            return ResponseEntity.ok(products);
        }
        
        if (minPrice != null && maxPrice != null) {
            Page<Product> products = service.filterProductsByPriceRange(minPrice, maxPrice, page, size);
            return ResponseEntity.ok(products);
        }
        
        // Default: return all products with pagination
        Page<Product> products = service.getAllProductsPaginated(page, size, "id", "asc");
        return ResponseEntity.ok(products);
    }
}
