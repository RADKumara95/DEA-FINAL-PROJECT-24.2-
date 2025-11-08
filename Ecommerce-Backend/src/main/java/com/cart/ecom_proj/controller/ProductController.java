package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.service.ProductService;
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
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
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

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id){
        Product product = service.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping("/product")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<Product> addProduct(
            @Valid @RequestPart Product product,
            @RequestPart(required = false) MultipartFile imageFile) {
        try {
            Product savedProduct = service.addProduct(product, imageFile);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId){
        Product product = service.getProductById(productId);
        if (product == null || product.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageFile = product.getImageData();

        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(product.getImageType()))
                .body(imageFile);
    }

    @PutMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable int id,
            @Valid @RequestPart Product product,
            @RequestPart(required = false) MultipartFile imageFile){
        try {
            Product updatedProduct = service.updateProduct(id, product, imageFile);
            return ResponseEntity.ok(updatedProduct);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable int id){
        service.deleteProduct(id);
        return ResponseEntity.ok().body("Product deleted successfully");
    }

    @GetMapping("/products/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy) {
        
        if (page >= 0 && size > 0) {
            Page<Product> productsPage = service.searchProductsPaginated(keyword, page, size, sortBy);
            return ResponseEntity.ok(productsPage);
        }
        
        List<Product> products = service.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/products/advanced-search")
    public ResponseEntity<Page<Product>> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy) {
        
        Page<Product> products = service.advancedSearchProducts(
                keyword, category, brand, minPrice, maxPrice, available, page, size, sortBy);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/filter")
    public ResponseEntity<?> filterProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "0") int page,
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
