package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    private Product createTestProduct() {
        Product product = new Product();
        product.setId(1);
        product.setName("Test Product");
        product.setDescription("Test Description for Product");
        product.setBrand("Test Brand");
        product.setPrice(new BigDecimal("99.99"));
        product.setCategory("Electronics");
        product.setReleaseDate(new Date());
        product.setProductAvailable(true);
        product.setStockQuantity(10);
        return product;
    }

    @Test
    void getAllProducts_ShouldReturnProducts() throws Exception {
        // Arrange
        List<Product> products = Arrays.asList(createTestProduct());
        when(productService.getAllProducts()).thenReturn(products);

        // Act & Assert
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Product"));
    }

    @Test
    void getAllProducts_WithPagination_ShouldReturnPaginatedProducts() throws Exception {
        // Arrange
        Page<Product> productPage = new PageImpl<>(Arrays.asList(createTestProduct()), PageRequest.of(0, 12), 1);
        when(productService.getAllProductsPaginated(0, 12, "id", "asc")).thenReturn(productPage);

        // Act & Assert
        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "12")
                        .param("sortBy", "id")
                        .param("sortDir", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Product"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getProduct_WhenProductExists_ShouldReturnProduct() throws Exception {
        // Arrange
        Product product = createTestProduct();
        when(productService.getProductById(1)).thenReturn(product);

        // Act & Assert
        mockMvc.perform(get("/api/product/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void addProduct_WithValidData_ShouldReturnCreated() throws Exception {
        // Arrange
        Product product = createTestProduct();
        when(productService.addProduct(any(Product.class), any())).thenReturn(product);

        // Act & Assert
        mockMvc.perform(multipart("/api/product")
                        .file("product", objectMapper.writeValueAsString(product).getBytes())
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteProduct_ShouldReturnOk() throws Exception {
        // Arrange
        doNothing().when(productService).deleteProduct(1);

        // Act & Assert
        mockMvc.perform(delete("/api/product/1")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void searchProducts_ShouldReturnMatchingProducts() throws Exception {
        // Arrange
        List<Product> products = Arrays.asList(createTestProduct());
        when(productService.searchProducts("test")).thenReturn(products);

        // Act & Assert
        mockMvc.perform(get("/api/products/search")
                        .param("keyword", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Product"));
    }
}

