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

/**
 * Service class for managing product-related operations.
 * Handles CRUD operations, search functionality, filtering, and image management.
 * 
 * @author Ecommerce Team
 * @version 1.0
 */
@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    // FileValidationService is optional to avoid circular dependency issues
    @Autowired(required = false)
    private FileValidationService fileValidationService;

<<<<<<< HEAD
    @Cacheable(value = "products")
=======
    /**
     * Retrieves all products from the database.
     * Note: This method returns all products without pagination - use with caution for large datasets.
     * 
     * @return List of all products
     */
>>>>>>> main
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    /**
     * Retrieves products with pagination and sorting capabilities.
     * This is the recommended method for fetching products in production to avoid memory issues.
     * 
     * @param page     Page number (0-based)
     * @param size     Number of items per page
     * @param sortBy   Field to sort by (e.g., "name", "price", "id")
     * @param sortDir  Sort direction ("asc" for ascending, "desc" for descending)
     * @return Page containing products with pagination metadata
     */
    public Page<Product> getAllProductsPaginated(int page, int size, String sortBy, String sortDir) {
        // Create sort object based on direction - defaults to ascending if not "desc"
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        // Create pageable object with page, size, and sort parameters
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return repo.findAll(pageable);
    }

<<<<<<< HEAD
    @Cacheable(value = "product", key = "#id")
=======
    /**
     * Retrieves a specific product by its ID.
     * Throws ResourceNotFoundException if product is not found.
     * 
     * @param id Product ID to search for
     * @return Product object if found
     * @throws ResourceNotFoundException if product with given ID doesn't exist
     */
>>>>>>> main
    public Product getProductById(int id){
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

<<<<<<< HEAD
    @CacheEvict(value = "products", allEntries = true)
=======
    /**
     * Creates a new product with optional image upload.
     * Handles image file validation, encoding, and storage.
     * 
     * @param product   Product object containing product details
     * @param imageFile Optional image file for the product
     * @return Saved product with generated ID
     * @throws IOException if image processing fails
     */
>>>>>>> main
    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        // Process image file if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            // Validate image file format and size (if validation service is available)
            if (fileValidationService != null) {
                fileValidationService.validateImageFile(imageFile);
            }
            
            // Store image metadata and binary data
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImageData(imageFile.getBytes()); // Convert to byte array for database storage
        }
        
        // Save product to database (JPA will auto-generate ID)
        return repo.save(product);
    }

<<<<<<< HEAD
    @CacheEvict(value = {"product", "products"}, allEntries = true)
=======
    /**
     * Updates an existing product with new information and optional image replacement.
     * Preserves existing image if no new image is provided.
     * 
     * @param id        ID of the product to update
     * @param product   Product object containing updated information
     * @param imageFile Optional new image file (null to keep existing image)
     * @return Updated product object
     * @throws IOException if image processing fails
     * @throws ResourceNotFoundException if product with given ID doesn't exist
     */
>>>>>>> main
    public Product updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        // First, retrieve the existing product to ensure it exists
        Product existingProduct = getProductById(id);
        
        // Update all product fields with new values
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setReleaseDate(product.getReleaseDate());
        existingProduct.setProductAvailable(product.isProductAvailable());
        existingProduct.setStockQuantity(product.getStockQuantity());
        
        // Process new image file if provided (replaces existing image)
        if (imageFile != null && !imageFile.isEmpty()) {
            // Validate new image file
            if (fileValidationService != null) {
                fileValidationService.validateImageFile(imageFile);
            }
            
            // Replace existing image data with new image
            existingProduct.setImageData(imageFile.getBytes());
            existingProduct.setImageName(imageFile.getOriginalFilename());
            existingProduct.setImageType(imageFile.getContentType());
        }
        // Note: If no new image is provided, existing image data is preserved
        
        return repo.save(existingProduct);
    }

<<<<<<< HEAD
    @CacheEvict(value = {"product", "products"}, allEntries = true)
=======
    /**
     * Deletes a product from the database.
     * Performs existence check before deletion to provide meaningful error messages.
     * 
     * @param id ID of the product to delete
     * @throws ResourceNotFoundException if product with given ID doesn't exist
     */
>>>>>>> main
    public void deleteProduct(int id) {
        // Check if product exists before attempting deletion
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        
        // Delete the product (cascade rules will handle related data if configured)
        repo.deleteById(id);
    }

    /**
     * Searches for products by keyword across multiple fields.
     * Note: Returns all matching results without pagination - use searchProductsPaginated for large result sets.
     * 
     * @param keyword Search term to match against product name, description, brand, or category
     * @return List of products matching the search criteria
     */
    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }

    /**
     * Searches for products by keyword with pagination support.
     * Recommended for production use to handle large search result sets efficiently.
     * 
     * @param keyword Search term to match against product fields
     * @param page    Page number (0-based)
     * @param size    Number of items per page
     * @param sortBy  Field to sort results by (defaults to "id" if null)
     * @return Page containing search results with pagination metadata
     */
    public Page<Product> searchProductsPaginated(String keyword, int page, int size, String sortBy) {
        // Default to sorting by ID if no sort field is specified
        Sort sort = Sort.by(sortBy != null ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return repo.searchProductsPaginated(keyword, pageable);
    }

    /**
     * Filters products by category with pagination support.
     * 
     * @param category Category name to filter by
     * @param page     Page number (0-based)
     * @param size     Number of items per page
     * @return Page containing products in the specified category
     */
    public Page<Product> filterProductsByCategoryPaginated(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findByCategory(category, pageable);
    }

    /**
     * Filters products by brand with pagination support.
     * 
     * @param brand Brand name to filter by
     * @param page  Page number (0-based)
     * @param size  Number of items per page
     * @return Page containing products from the specified brand
     */
    public Page<Product> filterProductsByBrandPaginated(String brand, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findByBrand(brand, pageable);
    }

    /**
     * Filters products by price range with pagination support.
     * Both minPrice and maxPrice are inclusive in the range.
     * 
     * @param minPrice Minimum price (inclusive)
     * @param maxPrice Maximum price (inclusive)
     * @param page     Page number (0-based)
     * @param size     Number of items per page
     * @return Page containing products within the specified price range
     */
    public Page<Product> filterProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findByPriceBetween(minPrice, maxPrice, pageable);
    }

    /**
     * Performs advanced search with multiple optional filters.
     * All parameters are optional (can be null) and will be ignored if not provided.
     * This method combines keyword search with category, brand, price, and availability filters.
     * 
     * @param keyword   Optional keyword to search in name, description, etc.
     * @param category  Optional category filter
     * @param brand     Optional brand filter
     * @param minPrice  Optional minimum price filter (inclusive)
     * @param maxPrice  Optional maximum price filter (inclusive)
     * @param available Optional availability status filter
     * @param page      Page number (0-based)
     * @param size      Number of items per page
     * @param sortBy    Field to sort by (defaults to "id" if null)
     * @return Page containing products matching all specified criteria
     */
    public Page<Product> advancedSearchProducts(String keyword, String category, String brand, 
                                                  BigDecimal minPrice, BigDecimal maxPrice, 
                                                  Boolean available, int page, int size, String sortBy) {
        // Default to sorting by ID if no sort field is specified
        Sort sort = Sort.by(sortBy != null ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Delegate to repository method which handles the complex query logic
        return repo.advancedSearch(keyword, category, brand, minPrice, maxPrice, available, pageable);
    }
}
