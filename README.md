# 🛒 Full-Stack E-Commerce Application

A comprehensive, modern e-commerce platform built with Spring Boot and React.js, featuring secure user authentication, product management, shopping cart functionality, and order processing with role-based access control.

> **🪟 Windows Users:** See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for detailed Windows-specific setup instructions and troubleshooting.

## 📋 Project Overview

This is a full-featured e-commerce web application that provides a seamless shopping experience for customers and comprehensive management tools for administrators. The application follows modern software architecture principles with a clean separation between frontend and backend, comprehensive security implementation, and scalable design patterns.

### Key Highlights
- **Full-Stack Architecture**: Separate React frontend and Spring Boot backend
- **Secure Authentication**: Session-based authentication with Spring Security
- **Role-Based Access**: User, Admin, and Seller role management
- **Comprehensive CRUD**: Complete product and order management
- **Modern UI/UX**: Responsive design with Bootstrap 5
- **RESTful APIs**: Well-documented APIs with Swagger integration
- **Docker Support**: Containerized deployment with Docker & Docker Compose
- **Production Ready**: Comprehensive validation, error handling, and testing

## 🛠 Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21 (LTS) | Core programming language |
| **Spring Boot** | 3.3.3 | Application framework |
| **Spring Security** | 3.x | Authentication & authorization |
| **Spring Data JPA** | 3.x | Data persistence layer |
| **Spring Validation** | 3.x | Input validation |
| **Spring Mail** | 3.x | Email notifications |
| **MySQL** | 8.0+ | Primary database |
| **H2** | 2.x | Development/Testing database |
| **OpenAPI/Swagger** | 2.3.0 | API documentation |
| **Lombok** | Latest | Code generation |
| **Maven** | 3.x | Build tool (primary) |
| **Gradle** | 8.x | Build tool (alternative) |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 5.2.8 | Build tool & dev server |
| **React Router** | 6.22.3 | Client-side routing |
| **Axios** | 1.6.8 | HTTP client |
| **Bootstrap** | 5.3.3 | CSS framework |
| **React Bootstrap** | 2.10.2 | Bootstrap components for React |
| **React Icons** | 5.2.0 | Icon library |
| **ESLint** | 8.57.0 | Code linting |

### DevOps
| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24.x | Container platform |
| **Docker Compose** | 2.x | Multi-container orchestration |

## ✨ Features

### 🔐 Authentication & Authorization
- [x] **User Registration** - Secure user account creation with validation
- [x] **Login/Logout** - Session-based authentication
- [x] **Role-Based Access** - User, Admin, Seller role management
- [x] **Profile Management** - Update user information
- [x] **Protected Routes** - Frontend route protection
- [x] **CSRF Protection** - Cross-site request forgery protection
- [x] **Password Security** - BCrypt password hashing

### 🛍 Product Management
- [x] **Product CRUD** - Complete product lifecycle management
- [x] **Image Upload** - Product image handling with validation
- [x] **Category Management** - Product categorization
- [x] **Advanced Search** - Multi-criteria product search
- [x] **Filtering** - Filter by category, price, brand, availability
- [x] **Pagination** - Efficient data loading with pagination
- [x] **Sorting** - Sort by price, name, date, popularity

### 🛒 Shopping Experience
- [x] **Shopping Cart** - Add/remove products, quantity management
- [x] **Cart Persistence** - localStorage-based cart storage
- [x] **Checkout Process** - Comprehensive order placement
- [x] **Order History** - View past orders and status
- [x] **Order Tracking** - Real-time order status updates
- [x] **Order Management** - Cancel orders, update status

### 👥 User Management
- [x] **User Profiles** - Personal information management
- [x] **Address Management** - Shipping and billing addresses
- [x] **Order History** - Complete order tracking
- [x] **Account Security** - Password management and security

### 🔧 Admin Features
- [x] **Product Management** - Add, edit, delete products
- [x] **Order Management** - View and manage all orders
- [x] **User Management** - Manage user accounts and roles
- [x] **Status Updates** - Order status management
- [x] **Inventory Control** - Stock quantity management

### 🎨 User Interface
- [x] **Responsive Design** - Mobile-first responsive layout
- [x] **Modern UI** - Clean, intuitive user interface
- [x] **Error Handling** - Comprehensive error messages
- [x] **Loading States** - User feedback during operations
- [x] **Form Validation** - Client and server-side validation
- [x] **Toast Notifications** - User action feedback

### 🔍 Advanced Features
- [x] **File Upload** - Secure image upload with validation
- [x] **Email Integration** - Order confirmation emails
- [x] **Audit Trail** - Creation and modification tracking
- [x] **Soft Deletes** - Data preservation with soft deletion
- [x] **Global Exception Handling** - Centralized error management
- [x] **API Documentation** - Swagger/OpenAPI integration

## 📁 Project Structure

```
DEA-FINAL-PROJECT-24.2-/
├── Ecommerce-Backend/
│   ├── src/main/java/com/cart/ecom_proj/
│   │   ├── config/           # Configuration classes
│   │   │   ├── DataInitializer.java
│   │   │   ├── JpaConfig.java
│   │   │   ├── OpenApiConfig.java
│   │   │   └── SecurityConfig.java
│   │   ├── controller/       # REST Controllers
│   │   │   ├── AuthController.java
│   │   │   ├── OrderController.java
│   │   │   └── ProductController.java
│   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── ErrorResponse.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── CreateOrderRequest.java
│   │   │   └── OrderResponse.java
│   │   ├── exception/       # Exception Handling
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   └── BadRequestException.java
│   │   ├── model/           # JPA Entities
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   ├── Product.java
│   │   │   ├── Order.java
│   │   │   └── OrderItem.java
│   │   ├── repo/            # JPA Repositories
│   │   │   ├── UserRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   ├── ProductRepo.java
│   │   │   └── OrderRepository.java
│   │   ├── security/        # Security Configuration
│   │   │   └── CustomUserDetailsService.java
│   │   ├── service/         # Business Logic
│   │   │   ├── UserService.java
│   │   │   ├── ProductService.java
│   │   │   ├── OrderService.java
│   │   │   ├── EmailService.java
│   │   │   └── FileValidationService.java
│   │   └── EcomProjApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-prod.properties
│   │   └── data.sql
│   └── pom.xml
├── Ecommerce-Frontend/
│   ├── src/
│   │   ├── components/      # React Components
│   │   │   ├── Home.jsx
│   │   │   ├── Product.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── OrderList.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchFilters.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── Context/         # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── Context.jsx
│   │   │   └── OrderContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── axios.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
├── ASSIGNMENT_TODO.md
└── GIT_WORKFLOW.md
```

## 🗄 Database Schema

### Core Entities

#### Users Table
```sql
- id (BIGINT, Primary Key, Auto-increment)
- username (VARCHAR, Unique, Not Null)
- email (VARCHAR, Unique, Not Null)  
- password (VARCHAR, Not Null, BCrypt hashed)
- first_name (VARCHAR)
- last_name (VARCHAR)
- phone_number (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Products Table
```sql
- id (INT, Primary Key, Auto-increment)
- name (VARCHAR, Not Null)
- description (TEXT)
- brand (VARCHAR)
- price (DECIMAL, Not Null)
- category (VARCHAR)
- release_date (DATE)
- stock_quantity (INT, Default 0)
- available (BOOLEAN, Default true)
- image_name (VARCHAR)
- image_type (VARCHAR)
- image_data (LONGBLOB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (VARCHAR)
```

#### Orders Table
```sql
- id (BIGINT, Primary Key, Auto-increment)
- user_id (BIGINT, Foreign Key -> users.id)
- order_date (TIMESTAMP)
- status (ENUM: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- total_amount (DECIMAL)
- shipping_address (TEXT)
- billing_address (TEXT)
- phone_number (VARCHAR)
- payment_method (ENUM)
- payment_status (ENUM)
- notes (TEXT)
```

#### Order Items Table
```sql
- id (BIGINT, Primary Key, Auto-increment)
- order_id (BIGINT, Foreign Key -> orders.id)
- product_id (INT, Foreign Key -> products.id)
- quantity (INT)
- price_at_order (DECIMAL)
- subtotal (DECIMAL)
```

#### Roles Table
```sql
- id (BIGINT, Primary Key, Auto-increment)
- name (VARCHAR, Unique)
```

### Entity Relationships
- **User ↔ Role**: Many-to-Many relationship
- **User ↔ Order**: One-to-Many relationship  
- **Order ↔ OrderItem**: One-to-Many relationship
- **Product ↔ OrderItem**: One-to-Many relationship

## 🚀 Setup and Installation

### Prerequisites
- **Java 21** or higher (LTS version recommended)
- **Node.js 18+** and npm
- **MySQL 8.0+** (for production)
- **Maven 3.6+** OR **Gradle 8.x** (or use included wrappers)
- **Git** for version control
- **Docker 24+** and **Docker Compose 2.x** (optional, for containerized deployment)

### Quick Start with Docker (Recommended)

This is the easiest way to get the entire application running with a single command.

#### Prerequisites for Docker Setup
- Docker Desktop installed and running
- Docker Compose v2.x

#### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/RADKumara95/DEA-FINAL-PROJECT-24.2-.git
   cd DEA-FINAL-PROJECT-24.2-
   ```

2. **Create Environment File**
   ```bash
   cat > .env << EOF
   # Database Configuration
   MYSQL_ROOT_PASSWORD=root123
   MYSQL_DATABASE=ecommerce_db
   MYSQL_USER=ecommerce_user
   MYSQL_PASSWORD=ecommerce_pass
   
   # Backend Configuration
   SPRING_PROFILES_ACTIVE=docker
   DB_HOST=mysql
   DB_PORT=3306
   DB_NAME=ecommerce_db
   DB_USER=ecommerce_user
   DB_PASSWORD=ecommerce_pass
   EOF
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Verify Services**
   ```bash
   # Check all containers are running
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   
   # Backend logs only
   docker-compose logs -f backend
   
   # Frontend logs only
   docker-compose logs -f frontend
   ```

5. **Access the Application**
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8080/api`
   - **Swagger UI**: `http://localhost:8080/swagger-ui.html`
   - **MySQL Database**: `localhost:3306` (user: `ecomuser`, password: `ecompassword`)

6. **Verify Dummy Data is Loaded**
   
   The application automatically loads dummy data on first startup. You can verify:
   
   ```bash
   # Check backend logs for data initialization
   docker-compose logs backend | grep "Database initialization completed"
   ```
   
   **Test Accounts (all use password: `password123`):**
   - `admin@ecommerce.com` - Admin account with full access
   - `john@example.com` - Regular user account
   - `jane@example.com` - Regular user account  
   - `seller@ecommerce.com` - Seller account
   
   **Sample Products:** 15 products are pre-loaded across categories (Smartphones, Laptops, Audio, etc.)
   
   Login at `http://localhost:3000` with any account to see the products!

7. **Stop the Application**
   ```bash
   docker-compose down
   
   # Remove volumes to reset database and reload dummy data
   docker-compose down -v
   ```

#### Docker Compose Services

The `docker-compose.yml` includes:
- **MySQL 8.0**: Database service on port 3306
- **Backend (Spring Boot)**: API service on port 8080
- **Frontend (React + Vite)**: UI service on port 5173

All services communicate through an internal Docker network.

#### Troubleshooting Docker Setup

**🪟 Windows Users:** If experiencing backend 500 errors, see [WINDOWS_TROUBLESHOOTING.md](./WINDOWS_TROUBLESHOOTING.md) for comprehensive Windows-specific troubleshooting.

**Windows Quick Fix:**
```bash
# Use the Windows helper script
docker-helper.bat

# Or manually:
# 1. Stop and clean everything
docker-compose down -v

# 2. Fix line endings (if needed)
cd Ecommerce-Backend
dos2unix gradlew
# OR using PowerShell:
# (Get-Content gradlew -Raw) -replace "`r`n", "`n" | Set-Content gradlew -NoNewline

# 3. Rebuild and restart
cd ..
docker-compose build --no-cache
docker-compose up -d

# 4. Check health
curl http://localhost:8080/actuator/health
```

**1. Port Already in Use**
```bash
# If ports are already in use, modify docker-compose.yml
# Change port mappings before running
# e.g., 8081:8080 for backend (external:internal)
docker-compose down
docker-compose up -d
```

**2. Database Connection Failed**
```bash
# Wait for MySQL to initialize (usually 15-30 seconds)
docker-compose logs mysql
# Look for "MySQL init process done"

# Restart services if connection fails
docker-compose restart backend
```

**3. Image Build Issues**
```bash
# Rebuild images without cache
docker-compose build --no-cache
docker-compose up -d
```

**4. Backend Health Check**
```bash
# Check if backend is healthy
curl http://localhost:8080/actuator/health

# View detailed backend logs
docker logs ecommerce-backend

# Check for specific errors
docker logs ecommerce-backend 2>&1 | grep -i error
```

**4. View Database Contents**
```bash
# Connect to MySQL container
docker exec -it ecom_mysql mysql -u ecommerce_user -p ecommerce_db
# Enter password: ecommerce_pass
```

---

### Local Development Setup (Without Docker)

If you prefer to run services locally without Docker:

#### Backend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/RADKumara95/DEA-FINAL-PROJECT-24.2-.git
   cd DEA-FINAL-PROJECT-24.2-
   ```

2. **Navigate to Backend Directory**
   ```bash
   cd Ecommerce-Backend
   ```

3. **Configure Database**
   
   **For Development (H2 - default):**
   ```properties
   # application.properties (already configured)
   spring.datasource.url=jdbc:h2:mem:testdb
   spring.h2.console.enabled=true
   ```
   
   **For Production (MySQL):**
   ```properties
   # application-prod.properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?createDatabaseIfNotExist=true
   spring.datasource.username=ecommerce_user
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
   ```

4. **Set Environment Variables**
   ```bash
   export DB_PASSWORD=your_database_password
   export EMAIL_USERNAME=your_email@gmail.com
   export EMAIL_PASSWORD=your_app_password
   ```

5. **Build and Run with Maven**
   ```bash
   # Using Maven wrapper (recommended)
   ./mvnw clean install
   ./mvnw spring-boot:run
   
   # Or using Maven directly
   mvn clean install
   mvn spring-boot:run
   
   # For production profile
   ./mvnw spring-boot:run -Dspring.profiles.active=prod
   ```

   **OR Build and Run with Gradle**
   ```bash
   # Using Gradle wrapper
   ./gradlew clean build
   ./gradlew bootRun
   
   # Or using Gradle directly
   gradle clean build
   gradle bootRun
   
   # For production profile
   ./gradlew bootRun --args='--spring.profiles.active=prod'
   ```

6. **Verify Backend**
   - API Base URL: `http://localhost:8080/api`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`
   - H2 Console: `http://localhost:8080/h2-console` (development only)

#### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd ../Ecommerce-Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Create .env file (optional - using default Vite configuration)
   echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Frontend**
   - Application URL: `http://localhost:5173`
   - Hot reload enabled for development

### Production Build (Docker)

**Build Custom Docker Images:**
```bash
# Build backend image
docker build -t ecommerce-backend:latest ./Ecommerce-Backend

# Build frontend image
docker build -t ecommerce-frontend:latest ./Ecommerce-Frontend

# Run with custom images
docker-compose -f docker-compose.prod.yml up -d
```

**Local Production Build:**

Backend:
```bash
cd Ecommerce-Backend
./mvnw clean package -Pprod
# or with Gradle
./gradlew clean build -Pprod
java -jar build/libs/ecom-proj-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Frontend:
```bash
cd Ecommerce-Frontend
npm run build
npm run preview  # Test production build locally
```

## 📚 API Documentation

Comprehensive API documentation is available in the [API.md](./API.md) file.

### Quick API Access

When the backend is running, you can access:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api-docs`
- **API Documentation**: [API.md](./API.md)

## 🐛 Troubleshooting

## 👥 Team Members

| Name | Student ID | Role | GitHub |
|------|------------|------|--------|
| **R.A.D Kumara** | 34725 | Project Lead & Backend Developer | [@RADKumara95](https://github.com/RADKumara95) |
| **R.A.R.J Ranasinghe** | 35098 | Frontend Developer & UI/UX | [@ravindiranasinghe](https://github.com/ravindiranasinghe) |
| **H.C.S Dilruk** | 35408 | Backend Developer & Database | [@hcsdilruk](https://github.com/hcsdilruk) |
| **Adikari A.M.D** | 35341 | Frontend Developer & Testing | [@AdikariAMD](https://github.com/AdikariAMD) |

## 📄 License

This project is developed as part of an academic assignment for Distributed Enterprise Applications course at NSBM Green University.

**Academic License - All Rights Reserved**

This software is developed for educational purposes. Redistribution or commercial use is not permitted without explicit authorization from the development team and academic institution.

## 🔧 Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@ecommerce.com`
- **Role**: ADMIN

### Test User Account  
- **Username**: `user`
- **Password**: `user123`
- **Email**: `user@ecommerce.com`
- **Role**: USER

### Test Seller Account
- **Username**: `seller`
- **Password**: `seller123`
- **Email**: `seller@ecommerce.com`
- **Role**: SELLER

> **Note**: Change these default credentials in production environment!

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Docker Issues

**1. Containers Fail to Start**
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Rebuild and restart
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**2. Database Connection Timeout**
```bash
# MySQL may need more time to initialize
# Wait 30 seconds and restart backend
docker-compose restart backend

# Verify MySQL is healthy
docker ps
# Check STATUS should show (healthy)
```

**3. Frontend Can't Reach Backend**
```bash
# Ensure backend container is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Verify networking
docker network ls
docker network inspect <network_name>
```

#### Backend Issues

**1. Database Connection Error**
```bash
# Error: Cannot create connection to database
# Solution: Check database credentials and ensure MySQL is running
systemctl start mysql  # Linux
brew services start mysql  # macOS
```

**2. Port Already in Use (8080)**
```bash
# Error: Port 8080 is already in use
# Solution: Change port in application.properties or docker-compose.yml
server.port=8081
```

**3. Build Failure - Java Version**
```bash
# Error: Unsupported Java version
# Solution: Verify Java 21 is installed and set as default
java --version
export JAVA_HOME=/path/to/java21
```

**4. Maven vs Gradle Confusion**
```bash
# If build fails with Maven, try Gradle wrapper
./gradlew clean build

# Ensure only one build tool is used
# Remove pom.xml or build.gradle if switching build systems
```

**5. Email Service Error**
```bash
# Error: Mail server connection failed  
# Solution: Configure Gmail app password
# Enable 2FA and generate app password for EMAIL_PASSWORD
```

#### Frontend Issues

**1. API Connection Error**
```bash
# Error: Network Error / CORS
# Solution: Ensure backend is running on port 8080
# Check CORS configuration in SecurityConfig.java
```

**2. Build Error - Node Version**
```bash
# Error: Unsupported Node.js version
# Solution: Use Node.js 18+ 
nvm install 18
nvm use 18
```

**3. Module Not Found Error**
```bash
# Error: Module not found
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. Hot Reload Not Working**
```bash
# Error: Changes not reflecting
# Solution: Restart dev server
npm run dev
```

#### Database Issues

**1. H2 Console Access**
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (leave empty)

**2. MySQL Connection**
```sql
-- Create database and user
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

**3. Data Not Persisting**
```bash
# Issue: Using H2 in-memory database
# Solution: Switch to MySQL for persistence
# Update application.properties with persistent database configuration
```

### Performance Optimization

**1. Slow API Response**
- Enable database indexing for frequently queried fields
- Implement pagination for large datasets
- Consider caching frequently accessed data

**2. Large Bundle Size**
- Use code splitting in React
- Optimize images and assets
- Remove unused dependencies

**3. Docker Performance**
```bash
# Limit resource usage
docker-compose down

# Update docker-compose.yml with resource limits
# Then restart
docker-compose up -d
```

### Getting Help

1. **Check Logs**: Always check console logs for detailed error messages
2. **API Testing**: Use Swagger UI to test API endpoints independently
3. **Database State**: Verify data integrity using H2 console or MySQL Workbench
4. **Network Issues**: Use browser dev tools to inspect HTTP requests/responses
5. **Clear Browser Cache**: Try incognito mode for frontend issues
6. **Docker Debugging**: Use `docker exec` to inspect containers

**Contact Information:**
- **Project Repository**: [GitHub Issues](https://github.com/RADKumara95/DEA-FINAL-PROJECT-24.2-/issues)
- **Academic Contact**: Course Instructor - Distributed Enterprise Applications
- **Development Team**: See team member information above

---

**Last Updated**: November 2024 | **Version**: 1.0.0 | **Status**: Active Development
