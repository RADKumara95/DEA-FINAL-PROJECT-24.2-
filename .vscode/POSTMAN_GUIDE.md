# Postman Collection Usage Guide

## Overview
The updated `Postman_Collection.json` now includes preconfigured credentials and is organized into user and admin sections for easier testing.

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select the `Postman_Collection.json` file
4. The collection will be imported with all variables preconfigured

### 2. Collection Variables
The collection includes the following variables (automatically configured):
- `baseUrl`: `http://localhost:8080`
- `adminUsername`: `admin`
- `adminPassword`: `password123`
- `testUsername`: `testuser`
- `testPassword`: `password123`

## Authentication Flow

### For Regular User Endpoints:
1. **Register a new user** (if needed):
   - Run: `Authentication > Register User`
   - This uses `{{testUsername}}` and `{{testPassword}}`
   
2. **Login**:
   - Run: `Authentication > Login User`
   - Postman will automatically store the session cookie
   
3. **Make authenticated requests**:
   - All subsequent requests will use the stored cookie automatically

### For Admin Endpoints:
1. **Login as Admin**:
   - Run: `Authentication > Login Admin`
   - Uses credentials: `admin` / `password123`
   - Session cookie is automatically stored
   
2. **Access Admin Features**:
   - Navigate to `Admin - Products` or `Admin - Orders` folders
   - All requests will use the admin session cookie

## Collection Structure

### 📁 Authentication
- **Register User** - Create a new user account
- **Login User** - Login with regular user credentials
- **Login Admin** - Login with admin credentials  
- **Get Current User** - Get authenticated user info
- **Update Profile** - Update user profile (requires auth)
- **Logout User** - Logout and clear session

### 📁 Products (Public/User Access)
- **Get All Products** - Browse all products (paginated)
- **Get Product by ID** - View specific product details
- **Get Product Image** - Retrieve product image
- **Search Products** - Keyword search
- **Advanced Search Products** - Multi-criteria search
- **Filter Products** - Filter by category, brand, price

### 📁 Admin - Products (Admin Only)
- **Create Product** - Add new product to catalog
- **Update Product** - Modify existing product
- **Delete Product** - Remove product from catalog

### 📁 Orders (User Access)
- **Create Order** - Place a new order
- **Get User Orders** - View your order history
- **Get Order by ID** - View specific order details
- **Cancel Order** - Cancel your pending order

### 📁 Admin - Orders (Admin Only)
- **Get All Orders** - View all orders in system
- **Update Order Status** - Change order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- **Delete Order** - Remove an order

## Testing Workflow

### Testing User Flow:
```
1. Register User (or skip if already registered)
2. Login User
3. Get All Products
4. Search/Filter Products
5. Create Order
6. Get User Orders
7. View Order Details
8. Cancel Order (if needed)
9. Update Profile
10. Logout
```

### Testing Admin Flow:
```
1. Login Admin
2. Get All Orders (Admin)
3. Update Order Status
4. Create Product
5. Update Product
6. View Products
7. Delete Product
8. Logout
```

## Troubleshooting

### Issue: 403 Forbidden on Admin Endpoints
**Solution**: Make sure you've logged in using "Login Admin" first. The session cookie must be from an admin account.

### Issue: 401 Unauthorized
**Solution**: Login again. Your session may have expired.

### Issue: Admin login fails
**Problem**: If the database was initialized with data.sql before DataInitializer ran, the admin user might not have roles assigned.

**Solutions**:
1. **Restart the backend** (recommended):
   ```bash
   cd Ecommerce-Backend
   docker-compose restart backend
   ```
   
2. **Or manually assign admin role in database**:
   ```sql
   -- Connect to MySQL
   INSERT INTO user_roles (user_id, role_id) 
   SELECT u.id, r.id FROM users u, role r 
   WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
   AND NOT EXISTS (
     SELECT 1 FROM user_roles ur 
     WHERE ur.user_id = u.id AND ur.role_id = r.id
   );
   ```

### Issue: Variables not showing up
**Solution**: 
1. Click the collection name
2. Go to **Variables** tab
3. Verify all variables are present
4. Click **Save**

## Default Credentials

### Admin Account:
- **Username**: `admin`
- **Email**: `admin@ecommerce.com`
- **Password**: `password123`
- **Roles**: ROLE_ADMIN, ROLE_USER

### Sample User Accounts:
- **john_doe** / password123
- **jane_smith** / password123
- **seller1** / password123 (has ROLE_SELLER)

## Query Parameters

Many endpoints support query parameters for pagination and filtering:

### Pagination:
- `page` - Page number (0-based)
- `size` - Items per page
- `sortBy` - Field to sort by (e.g., "price", "name")
- `sortDir` - Sort direction ("asc" or "desc")

### Filtering:
- `category` - Filter by product category
- `brand` - Filter by brand name
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `keyword` - Search keyword
- `status` - Order status filter

### Example:
```
GET {{baseUrl}}/api/products?page=0&size=20&sortBy=price&sortDir=asc&category=Smartphones
```

## Notes

- Session cookies are managed automatically by Postman
- All passwords in the test environment are `password123`
- The backend must be running on `http://localhost:8080`
- For production, update the `baseUrl` variable accordingly
