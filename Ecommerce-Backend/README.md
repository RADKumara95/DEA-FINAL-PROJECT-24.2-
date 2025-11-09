# E-Commerce Application Backend

This is the backend service for the E-commerce application built with Spring Boot.

## Prerequisites

- Java JDK 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- IDE (IntelliJ IDEA or Eclipse recommended)

## Setup and Installation

1. **Database Setup**
   ```sql
   CREATE DATABASE ecommerce;
   ```

2. **Configure Application Properties**
   - Open `src/main/resources/application.properties`
   - Update the following properties with your MySQL credentials:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. **Build the Project**
   ```bash
   # Navigate to the backend directory
   cd Ecommerce-Backend

   # Clean and install dependencies
   mvn clean install
   ```

4. **Run the Application**
   ```bash
   # Using Maven
   mvn spring-boot:run

   # Or run the JAR file
   java -jar target/ecom_proj-0.0.1-SNAPSHOT.jar
   ```

## Available Endpoints

The backend server will start on `http://localhost:8080`

- Authentication
  - POST `/api/auth/register` - Register a new user
  - POST `/api/auth/login` - Login user

- Products
  - GET `/api/products` - Get all products
  - GET `/api/products/{id}` - Get product by ID
  - POST `/api/products` - Create new product (Admin only)
  - PUT `/api/products/{id}` - Update product (Admin only)
  - DELETE `/api/products/{id}` - Delete product (Admin only)

- Orders
  - GET `/api/orders` - Get user orders
  - POST `/api/orders` - Create new order
  - PUT `/api/orders/{id}` - Update order status (Admin only)

## API Documentation

Once the application is running, you can access the Swagger UI documentation at:
```
http://localhost:8080/swagger-ui/index.html
```

## Testing

To run the tests:
```bash
mvn test
```

## Troubleshooting

1. **Database Connection Issues**
   - Verify MySQL is running
   - Check database credentials in application.properties
   - Ensure database exists and is accessible

2. **Port Conflicts**
   - If port 8080 is in use, modify the port in application.properties:
     ```properties
     server.port=8081
     ```

3. **Build Errors**
   - Clean Maven cache: `mvn clean`
   - Update Maven dependencies: `mvn dependency:resolve`
