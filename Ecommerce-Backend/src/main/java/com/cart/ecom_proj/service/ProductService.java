package com.cart.ecom_proj.service;

import com.cart.ecom_proj.exception.ResourceNotFoundException;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    @Autowired(required = false)
    private FileValidationService fileValidationService;

    @Cacheable(value = "products")
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Page<Product> getAllProductsPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return repo.findAll(pageable);
    }

    @Cacheable(value = "product", key = "#id")
    public Product getProductById(int id){
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            if (fileValidationService != null) {
                fileValidationService.validateImageFile(imageFile);
            }
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImageData(imageFile.getBytes());
        }
        return repo.save(product);
    }

    @CacheEvict(value = {"product", "products"}, allEntries = true)
    public Product updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        Product existingProduct = getProductById(id);
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setReleaseDate(product.getReleaseDate());
        existingProduct.setProductAvailable(product.isProductAvailable());
        existingProduct.setStockQuantity(product.getStockQuantity());
        
        if (imageFile != null && !imageFile.isEmpty()) {
            if (fileValidationService != null) {
                fileValidationService.validateImageFile(imageFile);
            }
            existingProduct.setImageData(imageFile.getBytes());
            existingProduct.setImageName(imageFile.getOriginalFilename());
            existingProduct.setImageType(imageFile.getContentType());
        }
        return repo.save(existingProduct);
    }

    @CacheEvict(value = {"product", "products"}, allEntries = true)
    public void deleteProduct(int id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        repo.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }

    public Page<Product> searchProductsPaginated(String keyword, int page, int size, String sortBy) {
        Sort sort = Sort.by(sortBy != null ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);
        return repo.searchProductsPaginated(keyword, pageable);
    }

    public Page<Product> filterProductsByCategoryPaginated(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findByCategory(category, pageable);
    }

    public Page<Product> filterProductsByBrandPaginated(String brand, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findByBrand(brand, pageable);
    }

    public Page<Product> filterProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findByPriceBetween(minPrice, maxPrice, pageable);
    }

    public Page<Product> advancedSearchProducts(String keyword, String category, String brand, 
                                                  BigDecimal minPrice, BigDecimal maxPrice, 
                                                  Boolean available, int page, int size, String sortBy) {
        Sort sort = Sort.by(sortBy != null ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);
        return repo.advancedSearch(keyword, category, brand, minPrice, maxPrice, available, pageable);
    }
}
