# Full-Stack E-commerce Application - Assignment TODO List

## 📋 Project Information
- **Backend**: Spring Boot 3.3.3 with Java 21
- **Frontend**: React 18.2.0 with Vite 5.2.8
- **Database**: H2 (in-memory) - needs migration to persistent SQL
- **Current State**: Basic CRUD operations implemented for Product entity

---

## ✅ Already Implemented Features

### Backend
- ✅ Spring Boot 3.3.3 with Java 21
- ✅ Layered architecture (Controller → Service → Repository → Entity)
- ✅ Spring Data JPA with H2 database
- ✅ Product entity with basic fields
- ✅ Full CRUD operations for Product entity
- ✅ Basic search functionality (keyword search across name, description, brand, category)
- ✅ File upload support (product images with MultipartFile)
- ✅ CORS enabled for frontend communication
- ✅ RESTful API endpoints
- ✅ Spring Security dependency added
- ✅ Basic Authentication Controller setup
- ✅ Basic Security Configuration
- ✅ Test dependencies and basic test setup

### Frontend
- ✅ React 18.2.0 with Vite
- ✅ React Router DOM for navigation
- ✅ Bootstrap 5.3.3 for UI
- ✅ Axios for API calls
- ✅ Context API for state management
- ✅ Shopping cart functionality with localStorage
- ✅ Product listing, add, update, delete operations
- ✅ Image display for products
- ✅ Category filtering

---

## 🔴 Critical Missing Requirements

## NOTE: The optional ones and some are commented out, do not implement them.

### 1. User Accounts & Authentication ❌ (HIGH PRIORITY)

#### 1.1 Backend - Spring Security Setup
- [✓] Add Spring Security dependency to `pom.xml`
- [✓] Create `User` entity in `model` package with fields
- [✓] Create `Role` entity in `model` package with fields
- [✓] Create `UserRepository` interface extending `JpaRepository<User, Long>`
- [✓] Create `RoleRepository` interface extending `JpaRepository<Role, Long>`
- [✓] Create `UserService` class with basic methods
- [✓] Create `CustomUserDetailsService` implementing `UserDetailsService`
- [✓] Create basic `SecurityConfig` class

- [✓] Create `UserRepository` interface extending `JpaRepository<User, Long>`
  - Add method: `Optional<User> findByUsername(String username)`
  - Add method: `Optional<User> findByEmail(String email)`
  - Add method: `boolean existsByUsername(String username)`
  - Add method: `boolean existsByEmail(String email)`

- [✓] Create `RoleRepository` interface extending `JpaRepository<Role, Long>`
  - Add method: `Optional<Role> findByName(String name)`

- [✓] Create `UserService` class with methods:
  - `User registerUser(RegisterRequest request)` - hash password with BCrypt
  - `User getUserById(Long id)`
  - `User getUserByUsername(String username)`
  - `User updateUser(Long id, UpdateUserRequest request)`
  - `void deleteUser(Long id)`
  - `boolean existsByUsername(String username)`
  - `boolean existsByEmail(String email)`

- [✓] Create `CustomUserDetailsService` implementing `UserDetailsService`
  - Override `loadUserByUsername(String username)` method
  - Return `UserDetails` object with user info and authorities

- [✓] Create DTOs for authentication:
  - `LoginRequest` (username, password)
  - `RegisterRequest` (username, email, password, firstName, lastName, phoneNumber)
  - `LoginResponse` (username, email, roles, message)
  - `UpdateUserRequest` (firstName, lastName, phoneNumber, email)

- [✓] Create `AuthController` in `controller` package with endpoints:
  - `POST /api/auth/register` - user registration with validation
  - `POST /api/auth/login` - user login (returns session cookie)
  - `POST /api/auth/logout` - user logout (invalidates session)
  - `GET /api/auth/me` - get current authenticated user
  - `PUT /api/auth/profile` - update current user profile

- [✓] Create `SecurityConfig` class with `@Configuration` and `@EnableWebSecurity`:
  - Configure `SecurityFilterChain` bean with:
    - Session management: `sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)`
    - Enable session management with `maximumSessions(1)`
    - CSRF protection enabled for state-changing operations
    - Configure `CsrfTokenRepository` with `CookieCsrfTokenRepository.withHttpOnlyFalse()`
    - Public endpoints: `/api/auth/register`, `/api/auth/login`, `/api/products`, `/api/product/{id}`, `/api/product/{id}/image`
    - Protected endpoints: `/api/product` (POST - ADMIN/SELLER), `/api/product/{id}` (PUT/DELETE - ADMIN/SELLER)
    - Protected endpoints: `/api/orders/**` (authenticated users only)
    - Configure CORS to allow credentials
  - Configure `PasswordEncoder` bean: `BCryptPasswordEncoder`
  - Configure `AuthenticationManager` bean

- [✓] Configure CORS in `SecurityConfig` to:
  - Allow origin: `http://localhost:5173` (React dev server)
  - Allow credentials: `true`
  - Allow methods: GET, POST, PUT, DELETE, OPTIONS
  - Allow headers: Content-Type, Authorization, X-XSRF-TOKEN
  - Expose headers: X-XSRF-TOKEN

- [✓] Configure session cookies in `application.properties`:
  ```properties
  server.servlet.session.cookie.http-only=true
  server.servlet.session.cookie.secure=false
  server.servlet.session.cookie.same-site=lax
  server.servlet.session.timeout=30m
  ```

- [✓] Create production profile `application-prod.properties`:
  ```properties
  server.servlet.session.cookie.secure=true
  server.servlet.session.cookie.same-site=strict
  ```

- [✓] Add role-based authorization annotations:
  - Add `@PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")` to `addProduct()` in `ProductController`
  - Add `@PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")` to `updateProduct()` in `ProductController`
  - Add `@PreAuthorize("hasRole('ADMIN')")` to `deleteProduct()` in `ProductController`
  - Add `@Configuration` and `@EnableMethodSecurity` to enable method-level security

- [✓] Initialize default roles with DataInitializer:
  - Initialize 'ROLE_USER'
  - Initialize 'ROLE_ADMIN'
  - Initialize 'ROLE_SELLER'

### Dependencies to add in `pom.xml`:
- `spring-boot-starter-security`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (for JWT)
- `bucket4j-core` (for rate limiting)
- `dev.samstevens.totp:totp` (for 2FA)
- `spring-boot-starter-oauth2-client` (for social login)

### Core Requirements:
 **SecurityConfig** (`@Configuration`, `@EnableWebSecurity`, `@EnableMethodSecurity`)
   - Use `SecurityFilterChain` with:
     - `sessionCreationPolicy(IF_REQUIRED)` and `maximumSessions(1)`
     - CSRF with `CookieCsrfTokenRepository.withHttpOnlyFalse()`
     - Public endpoints: `/api/auth/**`, `/api/products`, `/api/product/**`, `/api/auth/verify`, `/api/auth/oauth2/**`
     - Protected: `/api/orders/**` (authenticated), `/api/product` POST/PUT/DELETE (ADMIN/SELLER)
   - Configure CORS for `http://localhost:5173` with credentials
   - Add `RateLimitingFilter` before authentication filters
   - Add `JwtAuthenticationFilter` **only if `auth.mode=jwt`**

 **Hybrid Auth Support**:
   - Add `application.properties` flag: `auth.mode=session` (default) or `jwt`
   - Create `JwtTokenProvider` with `generateToken()`, `validateToken()`, `getAuthentication()`
   - Create `RefreshToken` entity + repository
   - Endpoints: `POST /api/auth/token` (issue JWT), `POST /api/auth/refresh`

 **Email Verification with Expiry**:
   - Add to `User` entity: `verificationToken`, `verificationTokenExpiry`
   - Generate 24-hour UUID token on registration
   - Endpoints: `GET /api/auth/verify?token=...`, `POST /api/auth/resend-verification`

 **2FA with TOTP**:
   - Add to `User`: `twoFactorEnabled`, `totpSecret`
   - `TwoFactorAuthService`: generate secret, QR code URL, verify code
   - Endpoints: `GET /api/auth/2fa/setup`, `POST /api/auth/2fa/verify`, `POST /api/auth/2fa/enable`

 **OAuth2 Social Login**:
   - Configure Google & GitHub in `application.properties`
   - Handle callback at `/api/auth/oauth2/success`
   - Link or create user based on `email` or `providerId`

 **Rate Limiting**:
   - Use Bucket4j to limit `/api/auth/login` and `/api/auth/register` to **5 requests/min per IP**
   - Return `429 Too Many Requests` with `Retry-After`

 **Account Lockout**:
   - Add to `User`: `failedLoginAttempts`, `lockoutTime`
   - Lock after 5 failed attempts for 30 minutes
   - Endpoint: `POST /api/auth/unlock` (admin only)

 **Password Policy + History**:
   - Create `PasswordHistory` entity
   - Enforce: 8+ chars, upper, lower, digit, special char
   - Prevent reuse of last 3 passwords

 **Auth Audit Logging**:
   - Create `AuthAuditLog` entity (username, event, IP, timestamp)
   - Use Spring AOP to log: login, logout, register, failed login, lockout
   - Admin endpoint: `GET /api/admin/audit-logs` (paginated)

### Additional Config:
- Session cookies: `httpOnly=true`, `sameSite=lax`, `timeout=30m`
- Production profile (`application-prod.properties`): `secure=true`, `sameSite=strict`
- Enable `@PreAuthorize` with `@EnableMethodSecurity`
- Insert default roles in `data.sql`

Use Lombok, proper exceptions, logging (`@Slf4j`), and clean architecture. Generate all required classes: `SecurityConfig`, `JwtTokenProvider`, `RateLimitingFilter`, `TwoFactorAuthService`, `AuthAuditLog`, `PasswordPolicyValidator`, and updated `User` entity.


#### 1.2 Frontend - Authentication UI & Logic
- [✓] Create `AuthContext.jsx` in `Context` folder for authentication state
- [✓] Create `Login.jsx` component with form fields and validation
- [✓] Create `Register.jsx` component with registration form
- [✓] Create `Profile.jsx` component
- [✓] Create `PrivateRoute.jsx` component
- [✓] Update `axios.jsx` with auth configuration

- [✓] Create `Register.jsx` component in `components` folder:
  - Form fields: username, email, password, confirmPassword, firstName, lastName, phoneNumber
  - Client-side validation:
    - Username: 3-50 characters, alphanumeric
    - Email: valid format
    - Password: min 8 characters, mix of letters and numbers
    - Confirm password matches
  - Submit handler to call register API
  - Redirect to login on successful registration
  - Display backend error messages

- [✓] Create `Profile.jsx` component in `components` folder:
  - Display user information (username, email, firstName, lastName, phoneNumber, roles)
  - Edit profile form to update firstName, lastName, phoneNumber, email
  - Protected route - only accessible to authenticated users
  - Form validation and error handling

- [✓] Create `PrivateRoute.jsx` component:
  - Wrapper component to protect routes
  - Check authentication status
  - Redirect to login if not authenticated

- [✓] Update `axios.jsx` to:
  - Set `withCredentials: true` for all requests
  - Add CSRF token to headers for POST, PUT, DELETE requests
  - Intercept 401 responses to redirect to login

- [✓] Update `App.jsx`:
  - Wrap with `AuthProvider`
  - Add routes: `/login`, `/register`, `/profile`
  - Protect routes: `/add_product`, `/product/update/:id` should require authentication
  - Show different navbar items based on auth status

- [✓] Update `Navbar.jsx`:
  - Show "Login" and "Register" buttons when not authenticated
  - Show "Profile" and "Logout" buttons when authenticated
  - Display username when logged in
  - Show admin/seller specific options based on roles

---

### 2. Domain Features - Second Entity with Relationships ✅ (COMPLETED)

#### 2.1 Order Entity and Relationships
- [✓] Create `Order` entity with all required fields
- [✓] Create `OrderItem` entity with relationships
- [✓] Create `OrderStatus`, `PaymentMethod`, and `PaymentStatus` enums
- [✓] Update `Product` entity with order relationships
- [✓] Update `User` entity with order relationships
- [✓] Create `OrderRepository` and `OrderService`
- [✓] Implement order management endpoints in controller
- [✓] Create order-related DTOs
- [✓] Implement frontend components for orders
  - [✓] OrderList.jsx
  - [✓] OrderDetails.jsx
  - [✓] Checkout.jsx
- [✓] Add order-related routes and navigation

- [✓] Create `OrderItem` entity in `model` package with fields:
  - `Long id` (Primary Key, Auto-generated)
  - `Order order` (ManyToOne relationship, fetch LAZY)
  - `Product product` (ManyToOne relationship, fetch EAGER)
  - `Integer quantity` (not null, min 1)
  - `BigDecimal priceAtOrder` (not null, store price at time of order)
  - `BigDecimal subtotal` (calculated: quantity * priceAtOrder)

- [✓] Create enum `OrderStatus` with values:
  - PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

- [✓] Create enum `PaymentMethod` with values:
  - CASH_ON_DELIVERY, CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING

- [✓] Create enum `PaymentStatus` with values:
  - PENDING, PAID, FAILED, REFUNDED

- [✓] Update `Product` entity:
  - Add `List<OrderItem> orderItems` (OneToMany relationship)
  - Add audit fields: `LocalDateTime createdAt`, `LocalDateTime updatedAt`, `String createdBy`
  - Add `@EntityListeners(AuditingEntityListener.class)` annotation
  - Add `@CreatedDate` on `createdAt`
  - Add `@LastModifiedDate` on `updatedAt`
  - Add `@CreatedBy` on `createdBy`

- [✓] Update `User` entity:
  - Add `List<Order> orders` (OneToMany relationship)

- [✓] Enable JPA Auditing:
  - Create `JpaConfig` class with `@Configuration` and `@EnableJpaAuditing`
  - Implement `AuditorAware<String>` to return current username

#### 2.2 Create Order Repositories
- [ ] Create `OrderRepository` interface extending `JpaRepository<Order, Long>`:
  - Add method: `List<Order> findByUserIdOrderByOrderDateDesc(Long userId)`
  - Add method: `List<Order> findByUserIdAndStatus(Long userId, OrderStatus status)`
  - Add method: `Page<Order> findByUserId(Long userId, Pageable pageable)`
  - Add method: `Page<Order> findByStatus(OrderStatus status, Pageable pageable)`
  - Add method: `List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end)`

- [ ] Create `OrderItemRepository` interface extending `JpaRepository<OrderItem, Long>`:
  - Add method: `List<OrderItem> findByOrderId(Long orderId)`
  - Add method: `List<OrderItem> findByProductId(Integer productId)`

#### 2.3 Create Order Services
- [ ] Create `OrderService` class with methods:
  - `Order createOrder(CreateOrderRequest request, User user)` - validate stock, calculate total
  - `Order getOrderById(Long id)` - verify user owns order or is admin
  - `List<Order> getUserOrders(Long userId)` - get all orders for a user
  - `Page<Order> getUserOrdersPaginated(Long userId, int page, int size, String sortBy)`
  - `Order updateOrderStatus(Long orderId, OrderStatus newStatus)` - admin/seller only
  - `Order cancelOrder(Long orderId)` - user can cancel if PENDING/CONFIRMED
  - `List<Order> getAllOrders(int page, int size)` - admin only, paginated
  - `void deleteOrder(Long id)` - admin only (soft delete preferred)
  - Validate stock availability before creating order
  - Update product stock quantity after order creation
  - Calculate total amount from order items

#### 2.4 Create Order Controllers
- [ ] Create DTOs:
  - `CreateOrderRequest` (items: List<OrderItemRequest>, shippingAddress, billingAddress, phoneNumber, notes, paymentMethod)
  - `OrderItemRequest` (productId, quantity)
  - `OrderResponse` (id, orderDate, status, totalAmount, shippingAddress, items, paymentStatus)
  - `UpdateOrderStatusRequest` (status, deliveryDate, notes)

- [ ] Create `OrderController` in `controller` package with endpoints:
  - `POST /api/orders` - create new order (authenticated users)
  - `GET /api/orders` - get current user's orders with pagination & sorting
  - `GET /api/orders/{id}` - get specific order details (owner or admin)
  - `PUT /api/orders/{id}/cancel` - cancel order (owner or admin)
  - `GET /api/admin/orders` - get all orders (admin only) with pagination, filtering by status
  - `PUT /api/admin/orders/{id}/status` - update order status (admin/seller only)
  - `DELETE /api/admin/orders/{id}` - delete order (admin only)

- [✓] Add proper security annotations to `OrderController`:
  - `@PreAuthorize("isAuthenticated()")` on user order endpoints
  - `@PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")` on admin endpoints

#### 2.5 Frontend - Order Management
- [✓] Create `OrderContext.jsx` for order state management
- [✓] Create `Checkout.jsx` component:
  - Display cart items summary
  - Form for shipping address, billing address, phone, payment method
  - Validation for all required fields
  - Calculate and display total amount
  - Submit order button
  - Clear cart after successful order
  - Redirect to order confirmation page

- [✓] Create `OrderList.jsx` component:
  - Display user's orders in a table/cards
  - Show order ID, date, status, total amount
  - Pagination controls
  - Filter by status (All, Pending, Confirmed, Shipped, Delivered, Cancelled)
  - Sort by date (newest/oldest)
  - Link to order details

- [✓] Create `OrderDetails.jsx` component:
  - Display full order information
  - List of order items with product details
  - Order status timeline
  - Cancel button (if order is PENDING/CONFIRMED)
  - Download invoice button (future enhancement)

- [✓] Create `AdminOrders.jsx` component (admin/seller only):
  - Display all orders with pagination
  - Filter by status
  - Search by order ID or customer name
  - Update order status dropdown
  - View order details
  - Delete order option

- [✓] Update `Cart.jsx`:
  - Add "Proceed to Checkout" button
  - Link to Checkout component
  - Validate stock availability before checkout

- [✓] Update `Navbar.jsx`:
  - Add "My Orders" link for authenticated users
  - Add "Manage Orders" link for admin/seller

- [✓] Add routes in `App.jsx`:
  - `/checkout` - Checkout component (protected)
  - `/orders` - OrderList component (protected)
  - `/orders/:id` - OrderDetails component (protected)
  - `/admin/orders` - AdminOrders component (admin/seller only)

---

### 3. Pagination & Sorting ✅ (COMPLETED)

#### 3.1 Backend Pagination Implementation
- [✓] Update `ProductRepository` with pageable methods:
  - [✓] Basic JpaRepository pagination
  - [✓] Category-based pagination
  - [✓] Search with pagination
  - [✓] Filter with pagination
- [✓] Update `OrderRepository` with pageable methods
- [✓] Implement paginated endpoints in controllers
- [✓] Create reusable `Pagination.jsx` component
- [✓] Add pagination to product listing
- [✓] Add pagination to order listing
- [✓] Add sorting functionality

- [✓] Update `ProductService`:
  - Add method: `Page<Product> getAllProductsPaginated(int page, int size, String sortBy, String sortDir)`
  - Add method: `Page<Product> searchProductsPaginated(String keyword, int page, int size, String sortBy)`
  - Add method: `Page<Product> filterProductsByCategoryPaginated(String category, int page, int size)`
  - Add method: `Page<Product> filterProductsByPriceRange(BigDecimal min, BigDecimal max, int page, int size)`

- [✓] Update `ProductController`:
  - Modify `GET /api/products` to accept pagination parameters:
    - `@RequestParam(defaultValue = "0") int page`
    - `@RequestParam(defaultValue = "12") int size`
    - `@RequestParam(defaultValue = "id") String sortBy`
    - `@RequestParam(defaultValue = "asc") String sortDir`
  - Return `Page<Product>` with pagination metadata (totalPages, totalElements, currentPage)
  - Modify `GET /api/products/search` to support pagination
  - Add `GET /api/products/filter` for advanced filtering with pagination

#### 3.2 Frontend Pagination UI
- [✓] Create `Pagination.jsx` reusable component:
  - Props: currentPage, totalPages, onPageChange
  - Display page numbers with prev/next buttons
  - Highlight current page
  - Disable prev on first page, next on last page

- [✓] Update `Home.jsx`:
  - Add state for pagination: `currentPage`, `totalPages`, `pageSize`
  - Add state for sorting: `sortBy`, `sortDir`
  - Fetch paginated products from API
  - Add pagination controls at bottom
  - Add sorting dropdown (Price: Low to High, High to Low, Name A-Z, Z-A, Newest)
  - Add page size selector (12, 24, 48 items per page)
  - Update URL query parameters on page/sort change

- [✓] Update `Context.jsx`:
  - Modify `refreshData()` to accept pagination and sorting parameters
  - Store pagination metadata in context

---

### 4. Validation & Error Handling ✅ (COMPLETED)

#### 4.1 Backend Validation
- [✓] Add validation dependencies
- [✓] Implement entity validation annotations
- [✓] Add controller validation
- [✓] Implement global exception handling
- [✓] Create custom exceptions
- [✓] Add frontend form validation
- [✓] Add error message display

- [✓] Add validation annotations to `Product` entity:
  - `@NotBlank(message = "Product name is required")` on `name`
  - `@Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")` on `description`
  - `@NotBlank(message = "Brand is required")` on `brand`
  - `@NotNull(message = "Price is required")` on `price`
  - `@DecimalMin(value = "0.01", message = "Price must be greater than 0")` on `price`
  - `@NotBlank(message = "Category is required")` on `category`
  - `@NotNull(message = "Release date is required")` on `releaseDate`
  - `@Min(value = 0, message = "Stock quantity cannot be negative")` on `stockQuantity`

- [✓] Add validation annotations to `User` entity:
  - `@NotBlank(message = "Username is required")` on `username`
  - `@Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")` on `username`
  - `@NotBlank(message = "Email is required")` on `email`
  - `@Email(message = "Invalid email format")` on `email`
  - `@NotBlank(message = "Password is required")` on `password`
  - `@Size(min = 8, message = "Password must be at least 8 characters")` on `password`
  - `@Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")` on `phoneNumber`

- [✓] Add validation annotations to `Order` entity:
  - `@NotNull(message = "User is required")` on `user`
  - `@NotNull(message = "Order date is required")` on `orderDate`
  - `@NotNull(message = "Total amount is required")` on `totalAmount`
  - `@DecimalMin(value = "0.01", message = "Total must be greater than 0")` on `totalAmount`
  - `@NotBlank(message = "Shipping address is required")` on `shippingAddress`
  - `@NotBlank(message = "Phone number is required")` on `phoneNumber`
  - `@NotEmpty(message = "Order must have at least one item")` on `orderItems`

- [✓] Add validation annotations to `OrderItem` entity:
  - `@NotNull(message = "Product is required")` on `product`
  - `@NotNull(message = "Quantity is required")` on `quantity`
  - `@Min(value = 1, message = "Quantity must be at least 1")` on `quantity`

- [✓] Add `@Valid` annotation to controller method parameters:
  - `ProductController.addProduct(@Valid @RequestPart Product product, ...)`
  - `ProductController.updateProduct(..., @Valid @RequestPart Product product, ...)`
  - `AuthController.register(@Valid @RequestBody RegisterRequest request)`
  - `AuthController.login(@Valid @RequestBody LoginRequest request)`
  - `OrderController.createOrder(@Valid @RequestBody CreateOrderRequest request)`

#### 4.2 Centralized Error Handling
- [✓] Create `ErrorResponse` DTO class:
  - `String message`
  - `int status`
  - `LocalDateTime timestamp`
  - `Map<String, String> validationErrors` (for field-level errors)
  - `String path` (request URI)

- [✓] Create `GlobalExceptionHandler` class with `@ControllerAdvice`:
  - Handle `MethodArgumentNotValidException` (Bean Validation errors):
    - Extract field errors
    - Return `ErrorResponse` with status 400 and field-level errors
  - Handle `ResourceNotFoundException` (custom exception):
    - Return `ErrorResponse` with status 404
  - Handle `DuplicateResourceException` (custom exception):
    - Return `ErrorResponse` with status 409
  - Handle `UnauthorizedException` (custom exception):
    - Return `ErrorResponse` with status 401
  - Handle `ForbiddenException` (custom exception):
    - Return `ErrorResponse` with status 403
  - Handle `BadRequestException` (custom exception):
    - Return `ErrorResponse` with status 400
  - Handle `InsufficientStockException` (custom exception):
    - Return `ErrorResponse` with status 400
  - Handle `MaxUploadSizeExceededException`:
    - Return `ErrorResponse` with status 413 (file too large)
  - Handle generic `Exception`:
    - Log error details
    - Return `ErrorResponse` with status 500 and generic message

- [✓] Create custom exception classes in `exception` package:
  - `ResourceNotFoundException` extends `RuntimeException`
  - `DuplicateResourceException` extends `RuntimeException`
  - `UnauthorizedException` extends `RuntimeException`
  - `ForbiddenException` extends `RuntimeException`
  - `BadRequestException` extends `RuntimeException`
  - `InsufficientStockException` extends `RuntimeException`

- [✓] Update service methods to throw appropriate exceptions:
  - `ProductService.getProductById()` - throw `ResourceNotFoundException` if not found
  - `ProductService.updateProduct()` - throw `ResourceNotFoundException` if not found
  - `ProductService.deleteProduct()` - throw `ResourceNotFoundException` if not found
  - `OrderService.createOrder()` - throw `InsufficientStockException` if stock unavailable
  - `UserService.registerUser()` - throw `DuplicateResourceException` if username/email exists
  - `OrderService.getOrderById()` - throw `ForbiddenException` if user doesn't own order

- [✓] Configure file upload limits in `application.properties`:
  ```properties
  spring.servlet.multipart.max-file-size=5MB
  spring.servlet.multipart.max-request-size=10MB
  ```

#### 4.3 Frontend Error Handling
- [✓] Create `ErrorBoundary.jsx` component:
  - Catch React errors
  - Display friendly error message
  - Option to reload page

- [✓] Create `ErrorMessage.jsx` reusable component:
  - Props: message, type (error/warning/info)
  - Display formatted error message with icon
  - Auto-dismiss after 5 seconds (optional)

- [✓] Update all form components to display validation errors:
  - `Login.jsx` - show backend validation errors
  - `Register.jsx` - show both client-side and backend errors
  - `AddProduct.jsx` - show validation errors for each field
  - `UpdateProduct.jsx` - show validation errors
  - `Checkout.jsx` - show validation errors

- [✓] Update `axios.jsx` interceptors:
  - Response interceptor to handle errors globally
  - Extract error message from response
  - Display toast/alert for errors
  - Handle 401 by redirecting to login
  - Handle 403 by showing "Access Denied" message
  - Handle 404 by showing "Not Found" message
  - Handle 500 by showing "Server Error" message

- [✓] Add validation libraries:
  - Install `react-hook-form` for form validation: `npm install react-hook-form`
  - Install `yup` for schema validation: `npm install yup @hookform/resolvers`

- [✓] Update forms to use `react-hook-form`:
  - `Login.jsx` - validate username and password
  - `Register.jsx` - validate all fields with yup schema
  - `AddProduct.jsx` - validate product fields
  - `Checkout.jsx` - validate shipping info

---

### 5. CSRF Protection ✅ (COMPLETED)

#### 5.1 Security Configuration
- [✓] Implement CSRF protection in SecurityConfig
- [✓] Configure CSRF token repository
- [✓] Set up CSRF token cookie
- [✓] Add CSRF headers to CORS configuration
- [✓] Implement frontend CSRF handling
- [✓] Add CSRF token to axios requests

- [ ] Create `CsrfController` to expose CSRF token:
  - `GET /api/csrf` - returns CSRF token for initial page load

-#### 5.2 Frontend CSRF Handling
- [✓] Update `axios.jsx`:
  - Function to read CSRF token from cookie
  - Add CSRF token to headers for POST, PUT, DELETE requests
  - Header name: `X-XSRF-TOKEN`
  - Fetch CSRF token on app initialization

- [ ] Update `AuthContext.jsx`:
  - Fetch CSRF token after login
  - Refresh CSRF token on session renewal

---

### 6. Beyond CRUD - Pick at Least Two ✅ (PARTIAL) / ❌ (NEEDS MORE)

#### 6.1 Advanced Search/Filtering ✅ (PARTIAL - BASIC SEARCH EXISTS)
- [ ] Enhance backend search in `ProductRepository`:
  - Add `@Query` method for multi-criteria search:
    - Search by category, brand, price range, availability
    - Combine with keyword search
  - Method: `Page<Product> advancedSearch(String keyword, String category, String brand, BigDecimal minPrice, BigDecimal maxPrice, Boolean available, Pageable pageable)`

- [ ] Update `ProductService`:
  - Add `advancedSearchProducts()` method
  - Support multiple filter combinations

- [ ] Update `ProductController`:
  - Add `GET /api/products/advanced-search` endpoint
  - Parameters: keyword, category, brand, minPrice, maxPrice, available, page, size, sort

- [ ] Frontend - Advanced Search UI:
  - Create `SearchFilters.jsx` component
  - Filter inputs: category dropdown, brand dropdown, price range slider, availability checkbox
  - Reset filters button
  - Apply filters button
  - Update Home.jsx to use advanced filters
  - Show active filters as tags/chips with remove option

#### 6.2 File Uploads ✅ (ALREADY IMPLEMENTED)
- [ ] **Enhancement**: Add server-side validation for images:
  - In `ProductService.addProduct()` and `updateProduct()`:
    - Validate file type (only allow JPG, PNG, WEBP)
    - Validate file size (max 5MB)
    - Validate image dimensions (optional)
    - Throw `BadRequestException` if validation fails

- [ ] Create `FileValidationService`:
  - Method: `validateImageFile(MultipartFile file)`
  - Check file extension and MIME type
  - Check file size
  - Return validation errors

- [ ] Update `ProductController`:
  - Use `FileValidationService` before processing upload
  - Return proper error messages

- [ ] Frontend validation:
  - In `AddProduct.jsx` and `UpdateProduct.jsx`:
    - Validate file type before upload
    - Validate file size before upload
    - Show preview of selected image
    - Display validation errors

<!-- #### 6.3 Email/SMS Notification ❌ (RECOMMENDED)
- [ ] Add email dependency to `pom.xml`:
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-mail</artifactId>
  </dependency>
  ```

- [ ] Configure email in `application.properties`:
  ```properties
  spring.mail.host=smtp.gmail.com
  spring.mail.port=587
  spring.mail.username=${EMAIL_USERNAME}
  spring.mail.password=${EMAIL_PASSWORD}
  spring.mail.properties.mail.smtp.auth=true
  spring.mail.properties.mail.smtp.starttls.enable=true
  ```

- [ ] Create `EmailService` class:
  - Method: `sendWelcomeEmail(User user)` - send welcome email after registration
  - Method: `sendOrderConfirmationEmail(Order order)` - send order confirmation
  - Method: `sendOrderStatusUpdateEmail(Order order)` - notify order status changes
  - Method: `sendPasswordResetEmail(User user, String token)` - for password reset
  - Use HTML email templates

- [ ] Create email templates in `resources/templates`:
  - `welcome-email.html`
  - `order-confirmation-email.html`
  - `order-status-update-email.html`

- [ ] Integrate email sending:
  - Call `sendWelcomeEmail()` in `UserService.registerUser()` after successful registration
  - Call `sendOrderConfirmationEmail()` in `OrderService.createOrder()` after order creation
  - Call `sendOrderStatusUpdateEmail()` in `OrderService.updateOrderStatus()` when status changes -->

<!-- - [ ] **Optional**: Add email verification:
  - Add `boolean emailVerified` field to `User` entity
  - Add `String verificationToken` field to `User` entity
  - Generate verification token on registration
  - Send verification email with token link
  - Create endpoint `GET /api/auth/verify?token=xxx` to verify email
  - Prevent login if email not verified -->

#### 6.4 Soft Deletes / Audit Trail ❌ (RECOMMENDED)
- [ ] Add soft delete fields to entities:
  - Add `boolean deleted` field to `Product`, `User`, `Order`
  - Add `LocalDateTime deletedAt` field
  - Add `String deletedBy` field

- [ ] Create `SoftDeletable` interface:
  - Methods: `void delete()`, `boolean isDeleted()`, `void restore()`

- [ ] Update entities to implement `SoftDeletable`:
  - Override delete methods to set `deleted = true` instead of removing record
  - Set `deletedAt` and `deletedBy` on deletion

- [ ] Update repositories:
  - Add `@Where(clause = "deleted = false")` to entity classes (Hibernate specific)
  - Or add `deleted = false` condition to all queries

- [ ] Add audit fields (already mentioned in Product update):
  - `LocalDateTime createdAt` - auto-set on creation
  - `LocalDateTime updatedAt` - auto-set on update
  - `String createdBy` - username of creator
  - `String updatedBy` - username of updater

- [ ] Use JPA Auditing:
  - Add `@EntityListeners(AuditingEntityListener.class)` to entities
  - Add `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy` annotations
  - Implement `AuditorAware<String>` to return current username

<!-- #### 6.5 Caching ❌ (OPTIONAL BUT RECOMMENDED)
- [ ] Add cache dependency to `pom.xml`:
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-cache</artifactId>
  </dependency>
  ```

- [ ] Enable caching in main application class:
  - Add `@EnableCaching` annotation to `EcomProjApplication`

- [ ] Add caching annotations:
  - `ProductService.getAllProducts()` - `@Cacheable(value = "products")`
  - `ProductService.getProductById(int id)` - `@Cacheable(value = "product", key = "#id")`
  - `ProductService.addProduct()` - `@CacheEvict(value = "products", allEntries = true)`
  - `ProductService.updateProduct()` - `@CacheEvict(value = {"product", "products"}, allEntries = true)`
  - `ProductService.deleteProduct()` - `@CacheEvict(value = {"product", "products"}, allEntries = true)`

- [ ] Configure cache in `application.properties`:
  ```properties
  spring.cache.type=simple
  spring.cache.cache-names=products,product,users
  ```

- [ ] **Optional**: Use Redis for distributed caching in production -->

<!-- #### 6.6 External API Integration ❌ (OPTIONAL)
- [ ] **Payment Gateway Integration** (e.g., Stripe, Razorpay, PayPal):
  - Add payment gateway SDK dependency
  - Create `PaymentService` class
  - Method: `createPaymentIntent(Order order)`
  - Method: `confirmPayment(String paymentId)`
  - Method: `refundPayment(String paymentId)`
  - Webhook endpoint to handle payment status updates
  - Update order payment status based on payment gateway response

- [ ] **OR Shipping API Integration** (e.g., Shippo, EasyPost):
  - Get real-time shipping rates
  - Generate shipping labels
  - Track shipment status

- [ ] **OR SMS Notification** (e.g., Twilio):
  - Send order confirmation SMS
  - Send OTP for login verification -->

<!-- #### 6.7 Reporting/Export ❌ (OPTIONAL)
- [ ] Add PDF generation dependency:
  ```xml
  <dependency>
      <groupId>com.itextpdf</groupId>
      <artifactId>itext7-core</artifactId>
      <version>7.2.5</version>
  </dependency>
  ```

- [ ] Add CSV generation dependency:
  ```xml
  <dependency>
      <groupId>com.opencsv</groupId>
      <artifactId>opencsv</artifactId>
      <version>5.7.1</version>
  </dependency>
  ```

- [ ] Create `ReportService` class:
  - Method: `byte[] generateOrderInvoicePDF(Long orderId)`
  - Method: `byte[] generateProductListCSV()`
  - Method: `byte[] generateOrderReportPDF(LocalDate startDate, LocalDate endDate)`
  - Method: `byte[] generateSalesReportCSV(LocalDate startDate, LocalDate endDate)`

- [ ] Create `ReportController`:
  - `GET /api/reports/invoice/{orderId}` - download order invoice as PDF
  - `GET /api/reports/products/export` - export products as CSV
  - `GET /api/admin/reports/orders` - download orders report (admin only)
  - `GET /api/admin/reports/sales` - download sales report (admin only)

- [ ] Frontend:
  - Add "Download Invoice" button in `OrderDetails.jsx`
  - Add "Export Products" button in admin products page
  - Add "Generate Report" button in admin dashboard

--- -->

### 7. Testing ❌ (HIGH PRIORITY)

#### 7.1 Backend Unit Tests
- [ ] Add testing dependencies to `pom.xml` (already present):
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
  </dependency>
  <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-test</artifactId>
      <scope>test</scope>
  </dependency>
  ```

- [✓] Create `ProductServiceTest` in `test` folder:
  - Test `getAllProducts()` - verify returns list
  - Test `getProductById()` - verify returns correct product
  - Test `getProductById()` with invalid ID - verify throws exception
  - Test `addProduct()` - verify product is saved
  - Test `updateProduct()` - verify product is updated
  - Test `deleteProduct()` - verify product is deleted
  - Test `searchProducts()` - verify search works
  - Use `@MockBean` for repository
  - Use `Mockito` for mocking

- [✓] Create `ProductControllerTest`:
  - Test `GET /api/products` - verify returns 200 and product list
  - Test `GET /api/product/{id}` - verify returns 200 and product
  - Test `GET /api/product/{id}` with invalid ID - verify returns 404
  - Test `POST /api/product` - verify returns 201
  - Test `POST /api/product` with invalid data - verify returns 400 with validation errors
  - Test `PUT /api/product/{id}` - verify returns 200
  - Test `DELETE /api/product/{id}` - verify returns 200
  - Test `GET /api/products/search` - verify returns 200 and filtered results
  - Use `@WebMvcTest` and `MockMvc`

- [ ] Create `UserServiceTest`:
  - Test `registerUser()` - verify user is created with hashed password
  - Test `registerUser()` with duplicate username - verify throws exception
  - Test `getUserByUsername()` - verify returns correct user
  - Test password encoding

- [✓] Create `AuthControllerTest`:
  - Test `POST /api/auth/register` - verify returns 201
  - Test `POST /api/auth/register` with invalid data - verify returns 400
  - Test `POST /api/auth/login` - verify returns 200 with session cookie
  - Test `POST /api/auth/login` with invalid credentials - verify returns 401
  - Test `POST /api/auth/logout` - verify session is invalidated
  - Test `GET /api/auth/me` - verify returns current user
  - Use `@WithMockUser` for authentication

- [ ] Create `OrderServiceTest`:
  - Test `createOrder()` - verify order is created and stock is updated
  - Test `createOrder()` with insufficient stock - verify throws exception
  - Test `getUserOrders()` - verify returns user's orders
  - Test `updateOrderStatus()` - verify status is updated
  - Test `cancelOrder()` - verify order is cancelled and stock is restored

- [ ] Create `OrderControllerTest`:
  - Test all order endpoints with proper authentication
  - Test authorization (user can only access own orders)
  - Test admin-only endpoints

#### 7.2 Integration Tests
- [ ] Create `ProductIntegrationTest`:
  - Test full flow: create product → get product → update → delete
  - Use real database (H2 for tests)
  - Use `@SpringBootTest` and `TestRestTemplate`

- [ ] Create `OrderIntegrationTest`:
  - Test full order flow: register user → login → add to cart → checkout → get orders
  - Verify database state after each operation

- [ ] Create `SecurityIntegrationTest`:
  - Test authentication flow
  - Test authorization (access denied for unauthorized users)
  - Test CSRF protection

#### 7.3 Repository Tests
- [ ] Create `ProductRepositoryTest`:
  - Test custom query methods
  - Test `searchProducts()` method
  - Use `@DataJpaTest`

- [ ] Create `OrderRepositoryTest`:
  - Test `findByUserIdOrderByOrderDateDesc()`
  - Test `findByStatus()`

#### 7.4 Frontend Testing
- [ ] Install testing libraries:
  ```bash
  npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
  ```

- [ ] Configure Vitest in `vite.config.js`:
  ```javascript
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  }
  ```

- [ ] Create `src/test/setup.js`:
  - Import `@testing-library/jest-dom/extend-expect`

- [ ] Create component tests:
  - `Login.test.jsx` - test form rendering, validation, submission
  - `Register.test.jsx` - test form validation
  - `ProductCard.test.jsx` - test product display
  - `Cart.test.jsx` - test add/remove items
  - `Navbar.test.jsx` - test conditional rendering based on auth

- [ ] Create context tests:
  - `AuthContext.test.jsx` - test login, logout, register
  - `Context.test.jsx` - test cart operations

---

### 8. API Documentation ✅ (COMPLETED)

#### 8.1 Backend - Swagger/OpenAPI
- [✓] Add Swagger dependencies to `pom.xml`:
  ```xml
  <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>2.3.0</version>
  </dependency>
  ```

- [✓] Configure Swagger in `application.properties`:
  ```properties
  springdoc.api-docs.path=/api-docs
  springdoc.swagger-ui.path=/swagger-ui.html
  springdoc.swagger-ui.enabled=true
  ```

- [✓] Add Swagger annotations to controllers:
  - `@Tag(name = "Products", description = "Product management APIs")` on `ProductController`
  - `@Operation(summary = "Get all products", description = "Retrieve list of all products")` on methods
  - `@ApiResponse(responseCode = "200", description = "Successful")` on methods
  - `@ApiResponse(responseCode = "404", description = "Not found")` on methods
  - Add similar annotations to `AuthController`, `OrderController`

- [✓] Create `OpenApiConfig` class:
  - Configure API info (title, version, description, contact, license)
  - Configure security schemes (cookie-based session)

- [✓] Allow Swagger UI in `SecurityConfig`:
  - Add `/swagger-ui/**`, `/api-docs/**` to public endpoints

#### 8.2 Postman Collection
- [✓] Create Postman collection with all endpoints:
  - **Auth Endpoints**:
    - POST /api/auth/register
    - POST /api/auth/login
    - POST /api/auth/logout
    - GET /api/auth/me
    - PUT /api/auth/profile
  - **Product Endpoints**:
    - GET /api/products (with pagination params)
    - GET /api/product/{id}
    - POST /api/product (with auth)
    - PUT /api/product/{id} (with auth)
    - DELETE /api/product/{id} (with auth)
    - GET /api/products/search?keyword=xxx
    - GET /api/products/advanced-search (with filters)
    - GET /api/product/{id}/image
  - **Order Endpoints**:
    - POST /api/orders (with auth)
    - GET /api/orders (with auth, pagination)
    - GET /api/orders/{id} (with auth)
    - PUT /api/orders/{id}/cancel (with auth)
    - GET /api/admin/orders (admin, with pagination)
    - PUT /api/admin/orders/{id}/status (admin)
    - DELETE /api/admin/orders/{id} (admin)

- [✓] Add environment variables in Postman:
  - `baseUrl` = `http://localhost:8080/api`
  - `authToken` = (for session cookie)

- [✓] Add pre-request scripts for authentication
- [✓] Add tests for each endpoint to verify responses
- [✓] Export collection as JSON file: `postman_collection.json`

---

### 9. Database Migration ❌ (HIGH PRIORITY)

#### 9.1 Move from H2 to Persistent SQL Database
- [ ] **Option 1: MySQL**:
  - Add MySQL dependency to `pom.xml`:
    ```xml
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    ```
  - Update `application.properties`:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?createDatabaseIfNotExist=true
    spring.datasource.username=root
    spring.datasource.password=${DB_PASSWORD}
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
    ```
---

<!-- ### 10. Code Quality & Best Practices ❌ (MEDIUM PRIORITY)

#### 10.1 Backend Code Improvements
- [ ] Remove unused imports and code
- [ ] Fix typo in `Product.java`: `imageDate` → `imageData`
- [ ] Add JavaDoc comments to all public methods
- [ ] Use DTOs instead of entities in API responses:
  - Create `ProductDTO`, `UserDTO`, `OrderDTO`
  - Use `ModelMapper` or `MapStruct` for conversion
- [ ] Add proper logging:
  - Add `@Slf4j` annotation (Lombok)
  - Log important operations (create, update, delete)
  - Log errors with stack traces
- [ ] Use constructor injection instead of field injection:
  - Replace `@Autowired` with constructor injection
- [ ] Add constants for magic strings:
  - Create `Constants` class for API paths, messages, etc.
- [ ] Implement proper exception handling in services
- [ ] Add request/response logging interceptor

#### 10.2 Frontend Code Improvements
- [ ] Remove unused imports and variables
- [ ] Add PropTypes for component props:
  ```bash
  npm install prop-types
  ```
- [ ] Extract magic numbers and strings to constants
- [ ] Add loading states for async operations
- [ ] Add error boundaries
- [ ] Optimize images (lazy loading, compression)
- [ ] Use React.memo for performance optimization
- [ ] Add accessibility attributes (aria-labels, alt texts)
- [ ] Implement proper form validation
- [ ] Add ESLint rules and fix violations
- [ ] Add Prettier for code formatting

#### 10.3 Security Enhancements
- [ ] Add rate limiting to prevent brute force attacks:
  - Use Bucket4j or similar library
  - Limit login attempts per IP
- [ ] Add input sanitization to prevent XSS:
  - Use OWASP Java HTML Sanitizer
- [ ] Add SQL injection protection:
  - Use parameterized queries (already using JPA)
- [ ] Add Content Security Policy headers
- [ ] Add X-Frame-Options header
- [ ] Add X-Content-Type-Options header
- [ ] Store sensitive config in environment variables:
  - Database password
  - Email credentials
  - Secret keys

--- -->

### 11. Documentation ❌ (HIGH PRIORITY)

#### 11.1 Update README.md
- [ ] Add comprehensive project description
- [ ] Add technology stack section
- [ ] Add features list with checkboxes
- [ ] Add detailed setup instructions:
  - Prerequisites (Java 21, Node.js 18+, MySQL/PostgreSQL)
  - Backend setup steps
  - Frontend setup steps
  - Database setup
  - Environment variables
- [ ] Add API documentation link (Swagger)
- [ ] Add screenshots/GIFs of application:
  - Home page
  - Product listing with pagination
  - Product details
  - Shopping cart
  - Checkout
  - Login/Register
  - User orders
  - Admin dashboard
- [ ] Add project structure diagram
- [ ] Add database schema diagram
- [ ] Add team member information
- [ ] Add license information
- [ ] Add troubleshooting section

#### 11.2 Additional Documentation ✅ (COMPLETED)
- [✓] Create `CONTRIBUTING.md` with contribution guidelines
- [✓] Create `API.md` with detailed API documentation
- [✓] Create `DEPLOYMENT.md` with deployment instructions
- [✓] Add inline code comments for complex logic
- [✓] Create user manual with screenshots (screenshots to be added later)

---

<!-- ### 12. Deployment & Production Readiness ❌ (OPTIONAL BUT RECOMMENDED)

#### 12.1 Backend Production Configuration
- [ ] Create `application-prod.properties`:
  - Set secure cookie flags
  - Disable SQL logging
  - Configure production database
  - Set proper CORS origins

- [ ] Add production build profile in `pom.xml`
- [ ] Externalize configuration:
  - Use environment variables for sensitive data
  - Create `.env.example` file

- [ ] Add health check endpoint:
  - Add Spring Boot Actuator dependency
  - Configure `/actuator/health` endpoint

- [ ] Add monitoring:
  - Configure Spring Boot Actuator metrics
  - Add logging to file

#### 12.2 Frontend Production Build
- [ ] Optimize production build:
  - Run `npm run build`
  - Test production build locally: `npm run preview`

- [ ] Add environment variables:
  - Create `.env.production` for production API URL
  - Create `.env.example` file

- [ ] Optimize bundle size:
  - Use code splitting
  - Lazy load routes
  - Compress images

#### 12.3 Deployment Options
- [ ] **Backend Deployment** (choose one):
  - Deploy to Heroku
  - Deploy to AWS (Elastic Beanstalk/EC2)
  - Deploy to Railway
  - Deploy to Render

- [ ] **Frontend Deployment** (choose one):
  - Deploy to Vercel
  - Deploy to Netlify
  - Deploy to GitHub Pages (static)

- [ ] **Database Deployment**:
  - Use managed database service (AWS RDS, Railway, etc.)

--- -->

<!-- ### 13. Git & Version Control ✅ (PARTIAL)

- [x] GitHub repository exists
- [ ] Clean up commit history (if needed)
- [ ] Add meaningful commit messages
- [ ] Create branches for features:
  - `feature/authentication`
  - `feature/orders`
  - `feature/pagination`
  - `feature/email-notifications`
- [ ] Create pull requests for review
- [ ] Add `.gitignore` for:
  - `/Ecommerce-Backend/target/`
  - `/Ecommerce-Frontend/node_modules/`
  - `/Ecommerce-Frontend/dist/`
  - `.env` files
  - IDE files (.idea, .vscode)
- [ ] Remove `target/` and `node_modules/` from repository if committed

--- -->

## 📊 Priority Summary

### Must Have (Critical for Assignment)
1. ✅ Authentication & Authorization (Session-based with Spring Security)
2. ✅ Second Entity (Order) with relationships
3. ✅ Pagination for product listing
4. ✅ Bean Validation with error handling
5. ✅ CSRF protection
6. ✅ Role-based authorization
7. ✅ At least 2 "Beyond CRUD" features (File Upload ✓, Advanced Search ✓)
8. ✅ Testing (unit + integration)
9. ✅ API Documentation (Swagger + Postman)
10. ✅ Updated README with setup & screenshots
11. ✅ Database migration (H2 → MySQL/PostgreSQL)

### Should Have (Important for Quality)
1. Soft deletes & audit trail
2. Email notifications
3. Advanced search/filtering
4. Proper error handling on frontend
5. Code quality improvements
6. Security enhancements

### Nice to Have (Bonus Points)
1. Caching
2. External API integration
3. Reporting/Export
4. Deployment
5. Real-time updates

---

## 📝 Notes
- **Java Version**: Java 21 (Latest LTS)
- **Spring Boot Version**: 3.3.3
- **React Version**: 18.2.0
- **Database**: Currently H2 (in-memory), needs migration to MySQL/PostgreSQL
- **Current Features**: Basic CRUD, file upload, basic search
- **Missing Critical Features**: Authentication, Orders, Validation, Testing, Documentation

---

## 🎯 Recommended Implementation Order

1. **Week 1**: Authentication & Authorization
   - Backend: Spring Security, User entity, Auth APIs
   - Frontend: Login, Register, Auth context
   - Testing: Auth tests

2. **Week 2**: Order Management & Relationships
   - Backend: Order & OrderItem entities, Order APIs
   - Frontend: Checkout, Order history
   - Testing: Order tests

3. **Week 3**: Validation, Error Handling, Pagination
   - Backend: Bean validation, Global exception handler
   - Frontend: Form validation, Error messages, Pagination UI
   - Testing: Validation tests

4. **Week 4**: Beyond CRUD Features & Documentation
   - Implement 2 beyond CRUD features
   - API documentation (Swagger)
   - Update README
   - Testing
   - Final polish

---

**Created**: November 5, 2025  
**Last Updated**: November 9, 2025
