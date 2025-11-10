# E-commerce Platform API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
- [Product Endpoints](#product-endpoints)
- [Order Endpoints](#order-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Data Models](#data-models)
- [Status Codes](#status-codes)
- [Examples](#examples)

## Overview

This API provides endpoints for managing an e-commerce platform with user authentication, product management, order processing, and user management capabilities. The API follows RESTful principles and uses JSON for data exchange.

### API Features
- **User Authentication**: Registration, login, logout, and profile management
- **Product Management**: CRUD operations, search, filtering, and image handling
- **Order Management**: Order creation, tracking, and status updates
- **User Management**: User profile updates, account management
- **Role-based Access Control**: Admin, Seller, and Customer roles
- **Pagination**: Support for paginated responses
- **File Upload**: Product image upload and retrieval
- **Comprehensive Documentation**: Swagger/OpenAPI integration

## Base URL

```
http://localhost:8080/api
```

## Authentication

The API uses session-based authentication with Spring Security. All authenticated endpoints require a valid session.

### Security Headers
```http
Content-Type: application/json
Accept: application/json
```

### CORS Configuration
- **Allowed Origins**: `http://localhost:5173`
- **Credentials**: Supported
- **Methods**: GET, POST, PUT, DELETE, OPTIONS

## Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success message",
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": "error",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Paginated Response
```json
{
  "content": [],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 12
  },
  "totalElements": 100,
  "totalPages": 9,
  "last": false,
  "first": true
}
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["CUSTOMER"],
  "message": "User registered successfully"
}
```

**Validation Rules:**
- Username: Required, unique
- Email: Required, valid format, unique
- Password: Required, minimum 8 characters
- firstName/lastName: Required

---

### Login
Authenticate user and create session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["CUSTOMER"],
  "message": "Login successful"
}
```

**Error Response:**
```json
{
  "error": "Invalid username or password",
  "status": 401
}
```

---

### Logout
End user session.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

### Get Current User
Get information about the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Response:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["CUSTOMER"]
}
```

---

### Update Profile
Update user profile information.

**Endpoint:** `PUT /api/auth/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "johnsmith@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "johnsmith@example.com",
  "firstName": "John",
  "lastName": "Smith"
}
```

---

## Product Endpoints

### Get All Products
Retrieve all products with optional pagination and sorting.

**Endpoint:** `GET /api/products`

**Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 12)
- `sortBy` (optional): Sort field (default: id)
- `sortDir` (optional): Sort direction - asc/desc (default: asc)

**Example Request:**
```
GET /api/products?page=0&size=12&sortBy=name&sortDir=asc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop",
      "brand": "TechBrand",
      "price": 999.99,
      "category": "Electronics",
      "quantity": 50,
      "available": true,
      "imageData": null,
      "imageType": "image/jpeg",
      "imageName": "laptop.jpg",
      "createdDate": "2024-01-01T12:00:00",
      "modifiedDate": "2024-01-01T12:00:00"
    }
  ],
  "pageable": {...},
  "totalElements": 100,
  "totalPages": 9
}
```

---

### Get Product by ID
Retrieve a specific product by its ID.

**Endpoint:** `GET /api/product/{id}`

**Path Parameters:**
- `id`: Product ID (integer)

**Example Request:**
```
GET /api/product/1
```

**Response:**
```json
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop",
  "brand": "TechBrand",
  "price": 999.99,
  "category": "Electronics",
  "quantity": 50,
  "available": true,
  "imageData": null,
  "imageType": "image/jpeg",
  "imageName": "laptop.jpg"
}
```

---

### Create Product
Add a new product to the catalog.

**Endpoint:** `POST /api/product`

**Authentication:** Required (ADMIN or SELLER role)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `product`: JSON product data
- `imageFile`: Product image file (optional)

**Product JSON:**
```json
{
  "name": "Smartphone",
  "description": "Latest smartphone with advanced features",
  "brand": "TechBrand",
  "price": 699.99,
  "category": "Electronics",
  "quantity": 100
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Smartphone",
  "description": "Latest smartphone with advanced features",
  "brand": "TechBrand",
  "price": 699.99,
  "category": "Electronics",
  "quantity": 100,
  "available": true,
  "imageData": "base64encodedimage...",
  "imageType": "image/jpeg",
  "imageName": "smartphone.jpg"
}
```

**Validation Rules:**
- name: Required, not blank
- description: 10-500 characters
- brand: Required, not blank
- price: Required, greater than 0
- category: Required, not blank
- quantity: Non-negative integer

---

### Update Product
Update an existing product.

**Endpoint:** `PUT /api/product/{id}`

**Authentication:** Required (ADMIN or SELLER role)

**Path Parameters:**
- `id`: Product ID

**Content-Type:** `multipart/form-data`

**Form Data:**
- `product`: JSON product data
- `imageFile`: New product image file (optional)

**Response:** Updated product object

---

### Delete Product
Remove a product from the catalog.

**Endpoint:** `DELETE /api/product/{id}`

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `id`: Product ID

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

### Get Product Image
Retrieve product image by product ID.

**Endpoint:** `GET /api/product/{productId}/image`

**Path Parameters:**
- `productId`: Product ID

**Response:** Binary image data with appropriate Content-Type header

---

### Search Products
Search products by keyword with pagination.

**Endpoint:** `GET /api/products/search`

**Parameters:**
- `keyword`: Search term (required)
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 12)
- `sortBy` (optional): Sort field (default: id)

**Example Request:**
```
GET /api/products/search?keyword=laptop&page=0&size=12
```

**Response:** Paginated list of products matching the keyword

---

### Advanced Product Search
Search products with multiple filters.

**Endpoint:** `GET /api/products/advanced-search`

**Parameters:**
- `keyword` (optional): Search term
- `category` (optional): Product category
- `brand` (optional): Product brand
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `available` (optional): Availability status (true/false)
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 12)
- `sortBy` (optional): Sort field (default: id)

**Example Request:**
```
GET /api/products/advanced-search?category=Electronics&minPrice=100&maxPrice=1000&available=true
```

**Response:** Paginated list of filtered products

---

### Filter Products
Filter products by specific criteria.

**Endpoint:** `GET /api/products/filter`

**Parameters:**
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 12)

**Example Request:**
```
GET /api/products/filter?category=Electronics&page=0&size=12
```

**Response:** Paginated list of filtered products

---

## Order Endpoints

### Create Order
Place a new order.

**Endpoint:** `POST /api/orders`

**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "123 Main St, City, State 12345",
  "phoneNumber": "+1234567890",
  "paymentMethod": "CREDIT_CARD",
  "notes": "Please deliver after 5 PM"
}
```

**Response:**
```json
{
  "id": 1,
  "orderDate": "2024-01-01T12:00:00",
  "status": "PENDING",
  "totalAmount": 1699.97,
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "123 Main St, City, State 12345",
  "phoneNumber": "+1234567890",
  "notes": "Please deliver after 5 PM",
  "paymentStatus": "PENDING",
  "username": "johndoe",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Laptop",
      "quantity": 2,
      "priceAtOrder": 999.99,
      "subtotal": 1999.98
    }
  ]
}
```

---

### Get User Orders
Retrieve orders for the current user with pagination.

**Endpoint:** `GET /api/orders`

**Authentication:** Required

**Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)
- `sortBy` (optional): Sort field (default: orderDate)

**Response:** Paginated list of user orders

---

### Get Order by ID
Retrieve a specific order by ID (user can only access their own orders).

**Endpoint:** `GET /api/orders/{id}`

**Authentication:** Required

**Path Parameters:**
- `id`: Order ID

**Response:** Order details object

---

### Cancel Order
Cancel an existing order.

**Endpoint:** `PUT /api/orders/{id}/cancel`

**Authentication:** Required

**Path Parameters:**
- `id`: Order ID

**Response:** Updated order object with CANCELLED status

**Error Response:**
- `404 Not Found` - Order not found
- `400 Bad Request` - Cannot cancel order (already shipped/delivered)

---

## User Management Endpoints

### Get User Profile
Get detailed user profile information.

**Endpoint:** `GET /api/users/profile`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "roles": ["CUSTOMER"],
  "createdDate": "2024-01-01T12:00:00"
}
```

---

### Update User Profile
Update user profile information.

**Endpoint:** `PUT /api/users/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890"
}
```

**Response:** `200 OK` - Updated user object

---

## Admin Endpoints

### Get All Orders (Admin)
Retrieve all orders in the system.

**Endpoint:** `GET /api/admin/orders`

**Authentication:** Required (ADMIN or SELLER role)

**Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)
- `status` (optional): Filter by order status

**Response:** `200 OK` - Paginated list of all orders

---

### Update Order Status (Admin)
Update the status of an order.

**Endpoint:** `PUT /api/admin/orders/{id}/status`

**Authentication:** Required (ADMIN or SELLER role)

**Path Parameters:**
- `id`: Order ID

**Request Body:**
```json
{
  "status": "SHIPPED",
  "deliveryDate": "2024-01-05T14:00:00"
}
```

**Response:** `200 OK` - Updated order object

**Validation Rules:**
- status: Must be valid OrderStatus enum value
- Allowed statuses: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

---

### Delete Order (Admin)
Delete an order from the system.

**Endpoint:** `DELETE /api/admin/orders/{id}`

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `id`: Order ID

**Response:** `200 OK`
```json
{
  "message": "Order deleted successfully"
}
```

---

## Data Models

### User Model
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["CUSTOMER"],
  "createdDate": "2024-01-01T12:00:00",
  "modifiedDate": "2024-01-01T12:00:00"
}
```

### Product Model
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "brand": "Brand Name",
  "price": 99.99,
  "category": "Category",
  "quantity": 100,
  "available": true,
  "imageData": "base64string...",
  "imageType": "image/jpeg",
  "imageName": "image.jpg",
  "createdDate": "2024-01-01T12:00:00",
  "modifiedDate": "2024-01-01T12:00:00"
}
```

### Order Model
```json
{
  "id": 1,
  "orderDate": "2024-01-01T12:00:00",
  "status": "PENDING",
  "totalAmount": 199.98,
  "shippingAddress": "123 Main St",
  "billingAddress": "123 Main St",
  "phoneNumber": "+1234567890",
  "notes": "Special instructions",
  "deliveryDate": "2024-01-05T14:00:00",
  "paymentStatus": "PAID",
  "username": "johndoe",
  "items": []
}
```

### Order Item Model
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Product Name",
  "quantity": 2,
  "priceAtOrder": 99.99,
  "subtotal": 199.98
}
```

## Enums

### Order Status
- `PENDING`: Order placed, awaiting processing
- `CONFIRMED`: Order confirmed and being prepared
- `SHIPPED`: Order has been shipped
- `DELIVERED`: Order has been delivered
- `CANCELLED`: Order has been cancelled

### Payment Status
- `PENDING`: Payment is pending
- `PAID`: Payment completed successfully
- `FAILED`: Payment failed
- `REFUNDED`: Payment has been refunded

### Payment Method
- `CREDIT_CARD`: Credit card payment
- `DEBIT_CARD`: Debit card payment
- `PAYPAL`: PayPal payment
- `BANK_TRANSFER`: Bank transfer
- `CASH_ON_DELIVERY`: Cash on delivery

### User Roles
- `CUSTOMER`: Regular customer
- `SELLER`: Product seller
- `ADMIN`: System administrator

## Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (username, email) |
| 422 | Unprocessable Entity | Validation error with details |
| 500 | Internal Server Error | Server-side errors |

## Examples

### Complete User Registration and Order Flow

1. **Register a new user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "New",
    "lastName": "User"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "newuser",
    "password": "SecurePass123"
  }'
```

3. **Get products:**
```bash
curl -X GET http://localhost:8080/api/products?page=0&size=10 \
  -b cookies.txt
```

4. **Create an order:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 1
      }
    ],
    "shippingAddress": "123 Main St, City, State 12345",
    "billingAddress": "123 Main St, City, State 12345",
    "phoneNumber": "+1234567890",
    "paymentMethod": "CREDIT_CARD"
  }'
```

### Product Management (Admin)

1. **Create a product with image:**
```bash
curl -X POST http://localhost:8080/api/product \
  -b cookies.txt \
  -F 'product={
    "name": "New Product",
    "description": "Product description here",
    "brand": "Brand Name",
    "price": 29.99,
    "category": "Electronics",
    "quantity": 50
  };type=application/json' \
  -F 'imageFile=@product-image.jpg'
```

2. **Search products:**
```bash
curl -X GET "http://localhost:8080/api/products/advanced-search?keyword=laptop&category=Electronics&minPrice=500&maxPrice=2000" \
  -b cookies.txt
```

3. **Update order status (Admin):**
```bash
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "SHIPPED",
    "deliveryDate": "2024-01-05T14:00:00"
  }'
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

## Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (0-based)
- `size`: Number of items per page
- `sortBy`: Field to sort by
- `sortDir`: Sort direction (asc/desc)

## Image Handling

- **Supported formats**: JPEG, PNG, GIF
- **Maximum file size**: 5MB (configurable)
- **Storage**: Database BLOB storage
- **Retrieval**: Via dedicated image endpoint

## Security Considerations

- All sensitive operations require authentication
- Role-based access control for admin operations
- Input validation on all endpoints
- CORS configured for frontend integration
- Session-based authentication with secure cookies
- CSRF protection enabled
- Password hashing with BCrypt

## Development Notes

- **Base URL**: `http://localhost:8080/api`
- **Frontend CORS**: `http://localhost:5173`
- **Database**: MySQL with JPA/Hibernate (H2 for development)
- **Framework**: Spring Boot 3.x with Spring Security
- **File Upload**: Multipart form data support
- **Build Tools**: Maven or Gradle

For more information about setup and installation, see the [README.md](./README.md).

## Development Notes

- **Base URL**: `http://localhost:8080/api`
- **Frontend CORS**: `http://localhost:5173`
- **Database**: MySQL with JPA/Hibernate
- **Framework**: Spring Boot 3.x with Spring Security
- **File Upload**: Multipart form data support

For more information about implementation details, see the [Contributing Guidelines](CONTRIBUTING.md) and [Deployment Guide](DEPLOYMENT.md).