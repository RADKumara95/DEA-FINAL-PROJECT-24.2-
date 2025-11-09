# MySQL Database Migration Guide

## Overview
The application has been successfully migrated from H2 in-memory database to MySQL 8.0 running in Docker.

## What Changed

### 1. Docker Compose Configuration
- Added MySQL 8.0 service with persistent volume
- Backend now depends on MySQL service with health check
- Added environment variables for database connection

### 2. Database Configuration
- **Database**: `ecommerce`
- **Host**: `mysql` (container name) or `localhost:3306` (from host)
- **Username**: `ecomuser`
- **Password**: `ecompassword`
- **Root Password**: `rootpassword`

### 3. Application Properties
Updated `application.properties` to use MySQL:
- Driver: `com.mysql.cj.jdbc.Driver`
- Dialect: `org.hibernate.dialect.MySQLDialect`
- Connection URL: `jdbc:mysql://localhost:3306/ecommerce?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`

## Data Migration

All data is automatically migrated through the `DataInitializer` class:

### Pre-loaded Data:
- **3 Roles**: ROLE_USER, ROLE_ADMIN, ROLE_SELLER
- **4 Users**:
  - admin@ecommerce.com (Admin) - password123
  - john@example.com (User) - password123
  - jane@example.com (User) - password123
  - seller@ecommerce.com (Seller) - password123
- **15 Products** across multiple categories:
  - Smartphones (iPhone 14 Pro, Samsung Galaxy S23, Google Pixel 8 Pro)
  - Laptops (MacBook Pro 14", Dell XPS 13, Microsoft Surface Pro 9)
  - Audio (Sony WH-1000XM5, AirPods Pro 2)
  - Tablets (iPad Air 5, Samsung Galaxy Tab S9)
  - Accessories (Logitech MX Master 3S)
  - Wearables (Apple Watch Series 9)

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# MySQL only
docker-compose logs -f mysql
```

### Check Container Status
```bash
docker-compose ps
```

### Connect to MySQL
```bash
# Using docker exec
docker exec -it ecommerce-mysql mysql -uecomuser -pecompassword ecommerce

# From host (if you have mysql client installed)
mysql -h localhost -P 3306 -u ecomuser -pecompassword ecommerce
```

## Database Verification

### Check Data Counts
```sql
USE ecommerce;
SELECT COUNT(*) FROM products;  -- Should return 15
SELECT COUNT(*) FROM users;     -- Should return 4
SELECT COUNT(*) FROM role;      -- Should return 3
```

### View Tables
```sql
SHOW TABLES;
```

Expected tables:
- `products`
- `users`
- `user_roles`
- `role`
- `orders`
- `order_items`
- `payments`

### View Products
```sql
SELECT id, name, brand, price, category, stock_quantity FROM products;
```

### View Users
```sql
SELECT id, username, email, first_name, last_name FROM users;
```

## Persistent Storage

MySQL data is stored in a Docker volume named `dea-final-project-242-_mysql-data`. This ensures data persists across container restarts.

### View Volume
```bash
docker volume ls | grep mysql-data
```

### Remove Volume (WARNING: Deletes all data)
```bash
docker-compose down -v
```

## API Endpoints

All API endpoints remain the same and work with MySQL:

### Test Product API
```bash
curl "http://localhost:8080/api/products?page=0&size=5"
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

## Troubleshooting

### Backend Can't Connect to MySQL
1. Check if MySQL is healthy:
   ```bash
   docker-compose ps
   ```
   MySQL status should show "healthy"

2. View MySQL logs:
   ```bash
   docker-compose logs mysql
   ```

3. Restart services:
   ```bash
   docker-compose restart
   ```

### Data Not Showing
1. Check DataInitializer logs:
   ```bash
   docker-compose logs backend | grep "Created"
   ```
   You should see:
   - ✓ Created roles
   - ✓ Created sample users
   - ✓ Created 15 sample products

2. Verify data in MySQL:
   ```bash
   docker exec -it ecommerce-mysql mysql -uecomuser -pecompassword -e "SELECT COUNT(*) FROM ecommerce.products"
   ```

### Reset Database
To start with fresh data:
```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start services (will recreate database and data)
docker-compose up -d
```

## Performance Considerations

- MySQL connection pool is managed by HikariCP (default with Spring Boot)
- Database indexes are automatically created by Hibernate
- Consider adding custom indexes for frequently queried columns in production

## Security Notes

**⚠️ IMPORTANT for Production:**
1. Change default passwords
2. Use environment variables or secrets management
3. Enable SSL for database connections
4. Restrict database port exposure
5. Implement proper backup strategy

## Backup & Restore

### Create Backup
```bash
docker exec ecommerce-mysql mysqldump -uecomuser -pecompassword ecommerce > backup.sql
```

### Restore Backup
```bash
docker exec -i ecommerce-mysql mysql -uecomuser -pecompassword ecommerce < backup.sql
```

## Migration Complete ✓

The application is now running with MySQL database. All features should work as before with the added benefit of:
- Persistent data storage
- Better production readiness
- Improved query performance for larger datasets
- Standard SQL database for easier management
