package com.cart.ecom_proj.config;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.RoleRepository;
import com.cart.ecom_proj.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
@Order(1) // Ensure this runs before data.sql
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepo productRepo;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_USER");
                    return roleRepository.save(role);
                });

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_ADMIN");
                    return roleRepository.save(role);
                });

        Role sellerRole = roleRepository.findByName("ROLE_SELLER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_SELLER");
                    return roleRepository.save(role);
                });

        System.out.println("✓ Created roles");

        // Initialize users if they don't exist
        if (userRepository.count() == 0) {
            // Admin user
            User admin = createUser("admin", "admin@ecommerce.com", "password123", "Admin", "User", "1234567890");
            admin.setRoles(Set.of(userRole, adminRole));
            userRepository.save(admin);

            // Regular users
            User john = createUser("john_doe", "john@example.com", "password123", "John", "Doe", "9876543210");
            john.setRoles(Set.of(userRole));
            userRepository.save(john);

            User jane = createUser("jane_smith", "jane@example.com", "password123", "Jane", "Smith", "5551234567");
            jane.setRoles(Set.of(userRole));
            userRepository.save(jane);

            // Seller user
            User seller = createUser("seller1", "seller@ecommerce.com", "password123", "Seller", "One", "5559876543");
            seller.setRoles(Set.of(userRole, sellerRole));
            userRepository.save(seller);

            System.out.println("✓ Created sample users");
        }

        // Initialize products if they don't exist
        if (productRepo.count() == 0) {
            createProduct("iPhone 14 Pro", "Latest Apple smartphone with A16 Bionic chip and Dynamic Island", "Apple", 999.99, "Smartphones", "2023-09-16", 50);
            createProduct("Samsung Galaxy S23", "Flagship Android phone with 200MP camera and Snapdragon 8 Gen 2", "Samsung", 899.99, "Smartphones", "2023-02-17", 45);
            createProduct("MacBook Pro 14\"", "Professional laptop with M2 Pro chip and stunning Liquid Retina XDR display", "Apple", 1999.99, "Laptops", "2023-01-24", 30);
            createProduct("Dell XPS 13", "Ultra-portable Windows laptop with InfinityEdge display", "Dell", 1299.99, "Laptops", "2023-03-10", 25);
            createProduct("Sony WH-1000XM5", "Industry-leading noise canceling wireless headphones", "Sony", 399.99, "Audio", "2022-05-12", 100);
            createProduct("AirPods Pro 2", "Active noise cancellation with Adaptive Audio", "Apple", 249.99, "Audio", "2023-09-23", 120);
            createProduct("iPad Air 5", "Powerful tablet with M1 chip and 10.9-inch Liquid Retina display", "Apple", 599.99, "Tablets", "2022-03-18", 60);
            createProduct("Samsung Galaxy Tab S9", "Premium Android tablet with AMOLED display and S Pen", "Samsung", 799.99, "Tablets", "2023-08-11", 40);
            createProduct("Logitech MX Master 3S", "Advanced wireless mouse with ultra-fast scrolling", "Logitech", 99.99, "Accessories", "2022-06-21", 200);
            createProduct("Apple Watch Series 9", "Advanced health and fitness smartwatch", "Apple", 429.99, "Wearables", "2023-09-22", 75);
            createProduct("Google Pixel 8 Pro", "AI-powered smartphone with amazing camera capabilities", "Google", 999.99, "Smartphones", "2023-10-12", 35);
            createProduct("Microsoft Surface Pro 9", "2-in-1 tablet and laptop with Intel Core processor", "Microsoft", 1299.99, "Laptops", "2022-10-25", 20);
            createProduct("Bose QuietComfort 45", "Premium noise cancelling headphones with legendary comfort", "Bose", 329.99, "Audio", "2021-09-23", 80);
            createProduct("Samsung Galaxy Buds2 Pro", "Intelligent active noise canceling earbuds", "Samsung", 229.99, "Audio", "2022-08-26", 150);
            createProduct("LG UltraFine 4K Monitor", "27-inch 4K display with USB-C connectivity", "LG", 699.99, "Monitors", "2023-01-15", 35);

            System.out.println("✓ Created 15 sample products");
        }

        System.out.println("✓ Database initialization completed. Sample users:");
        System.out.println("  - admin@ecommerce.com (Admin)");
        System.out.println("  - john@example.com (User)");
        System.out.println("  - jane@example.com (User)");
        System.out.println("  - seller@ecommerce.com (Seller)");
        System.out.println("  Password for all: password123");
        System.out.println("  Total products: " + productRepo.count());
    }

    private User createUser(String username, String email, String password, String firstName, String lastName, String phone) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phone);
        user.setEnabled(true);
        user.setDeleted(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setRoles(new HashSet<>());
        return user;
    }

    private void createProduct(String name, String description, String brand, double price, String category, String releaseDate, int stock) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setBrand(brand);
        product.setPrice(BigDecimal.valueOf(price));
        product.setCategory(category);
        product.setReleaseDate(parseDate(releaseDate));
        product.setProductAvailable(true);
        product.setStockQuantity(stock);
        product.setDeleted(false);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        productRepo.save(product);
    }

    private Date parseDate(String dateStr) {
        try {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            return sdf.parse(dateStr);
        } catch (Exception e) {
            return new Date();
        }
    }
}

