package com.cart.ecom_proj.service;

import com.cart.ecom_proj.exception.ResourceNotFoundException;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.repo.ProductRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepo productRepo;

    @Mock
    private FileValidationService fileValidationService;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(1);
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description for Product");
        testProduct.setBrand("Test Brand");
        testProduct.setPrice(new BigDecimal("99.99"));
        testProduct.setCategory("Electronics");
        testProduct.setReleaseDate(new Date());
        testProduct.setProductAvailable(true);
        testProduct.setStockQuantity(10);
    }

    @Test
    void getAllProducts_ShouldReturnListOfProducts() {
        // Arrange
        List<Product> products = Arrays.asList(testProduct);
        when(productRepo.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getAllProducts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testProduct.getName(), result.get(0).getName());
        verify(productRepo, times(1)).findAll();
    }

    @Test
    void getAllProductsPaginated_ShouldReturnPaginatedProducts() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(testProduct), pageable, 1);
        when(productRepo.findAll(any(Pageable.class))).thenReturn(productPage);

        // Act
        Page<Product> result = productService.getAllProductsPaginated(0, 10, "id", "asc");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(productRepo, times(1)).findAll(any(Pageable.class));
    }

    @Test
    void getProductById_WhenProductExists_ShouldReturnProduct() {
        // Arrange
        when(productRepo.findById(1)).thenReturn(Optional.of(testProduct));

        // Act
        Product result = productService.getProductById(1);

        // Assert
        assertNotNull(result);
        assertEquals(testProduct.getId(), result.getId());
        assertEquals(testProduct.getName(), result.getName());
        verify(productRepo, times(1)).findById(1);
    }

    @Test
    void getProductById_WhenProductDoesNotExist_ShouldThrowException() {
        // Arrange
        when(productRepo.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductById(999);
        });
        verify(productRepo, times(1)).findById(999);
    }

    @Test
    void deleteProduct_WhenProductExists_ShouldDeleteProduct() {
        // Arrange
        when(productRepo.existsById(1)).thenReturn(true);
        doNothing().when(productRepo).deleteById(1);

        // Act
        productService.deleteProduct(1);

        // Assert
        verify(productRepo, times(1)).existsById(1);
        verify(productRepo, times(1)).deleteById(1);
    }

    @Test
    void deleteProduct_WhenProductDoesNotExist_ShouldThrowException() {
        // Arrange
        when(productRepo.existsById(999)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.deleteProduct(999);
        });
        verify(productRepo, times(1)).existsById(999);
        verify(productRepo, never()).deleteById(anyInt());
    }

    @Test
    void searchProducts_ShouldReturnMatchingProducts() {
        // Arrange
        String keyword = "test";
        List<Product> products = Arrays.asList(testProduct);
        when(productRepo.searchProducts(keyword)).thenReturn(products);

        // Act
        List<Product> result = productService.searchProducts(keyword);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productRepo, times(1)).searchProducts(keyword);
    }
}

