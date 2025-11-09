# Deployment Guide

This guide provides step-by-step instructions for deploying the E-commerce Platform in various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development Deployment](#local-development-deployment)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Java**: JDK 17 or higher
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **MySQL**: Version 8.0 or higher
- **Git**: Latest version
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Hardware Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB free space
- **Network**: Stable internet connection

#### Recommended for Production
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Network**: High-speed internet with low latency

## Environment Setup

### Development Tools
1. **IDE/Editor**:
   - IntelliJ IDEA (recommended for backend)
   - VS Code (recommended for frontend)
   - Eclipse (alternative for backend)

2. **Database Management**:
   - MySQL Workbench
   - phpMyAdmin
   - DBeaver (cross-platform)

### Environment Variables
Create the following environment variables for different deployment environments:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USERNAME=root
DB_PASSWORD=your_password

# Application Configuration
APP_ENV=development
APP_PORT=8080
JWT_SECRET=your_jwt_secret_key
UPLOAD_DIR=./uploads

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

## Local Development Deployment

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/DEA-FINAL-PROJECT-24.2-.git
cd DEA-FINAL-PROJECT-24.2-
```

### Step 2: Database Setup
1. **Install MySQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server

   # macOS (using Homebrew)
   brew install mysql

   # Windows - Download from MySQL official website
   ```

2. **Create Database**:
   ```sql
   CREATE DATABASE ecommerce_db;
   CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Step 3: Backend Deployment
1. **Navigate to Backend Directory**:
   ```bash
   cd Ecommerce-Backend
   ```

2. **Configure Database Connection**:
   Edit `src/main/resources/application.properties`:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db
   spring.datasource.username=ecommerce_user
   spring.datasource.password=secure_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

   # Server Configuration
   server.port=8080
   server.servlet.context-path=/

   # File Upload Configuration
   spring.servlet.multipart.max-file-size=10MB
   spring.servlet.multipart.max-request-size=10MB

   # CORS Configuration
   app.cors.allowed-origins=http://localhost:5173
   ```

3. **Install Dependencies and Run**:
   ```bash
   # Using Maven Wrapper (recommended)
   ./mvnw clean install
   ./mvnw spring-boot:run

   # Or using system Maven
   mvn clean install
   mvn spring-boot:run
   ```

4. **Verify Backend**:
   Open http://localhost:8080/api/products in your browser

### Step 4: Frontend Deployment
1. **Navigate to Frontend Directory**:
   ```bash
   cd ../Ecommerce-Frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_ENV=development
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Verify Frontend**:
   Open http://localhost:5173 in your browser

### Step 5: Initial Data Setup
1. **Access the application** at http://localhost:5173
2. **Register an admin user** (first user gets admin privileges)
3. **Add sample products** through the admin interface

## Production Deployment

### Step 1: Server Preparation
1. **Update System**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Required Software**:
   ```bash
   # Java 17
   sudo apt install openjdk-17-jdk

   # Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # MySQL
   sudo apt install mysql-server

   # Nginx (for reverse proxy)
   sudo apt install nginx

   # PM2 (for process management)
   sudo npm install -g pm2
   ```

### Step 2: Database Configuration
1. **Secure MySQL Installation**:
   ```bash
   sudo mysql_secure_installation
   ```

2. **Create Production Database**:
   ```sql
   CREATE DATABASE ecommerce_prod;
   CREATE USER 'ecommerce_prod'@'localhost' IDENTIFIED BY 'very_secure_password';
   GRANT ALL PRIVILEGES ON ecommerce_prod.* TO 'ecommerce_prod'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Step 3: Backend Production Deployment
1. **Clone and Build**:
   ```bash
   git clone https://github.com/your-username/DEA-FINAL-PROJECT-24.2-.git
   cd DEA-FINAL-PROJECT-24.2-/Ecommerce-Backend
   ```

2. **Production Configuration**:
   Create `src/main/resources/application-prod.properties`:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_prod
   spring.datasource.username=ecommerce_prod
   spring.datasource.password=very_secure_password

   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=validate
   spring.jpa.show-sql=false

   # Server Configuration
   server.port=8080
   server.error.include-stacktrace=never

   # Security Configuration
   spring.security.require-ssl=true

   # Logging
   logging.level.root=WARN
   logging.level.com.cart.ecom_proj=INFO
   logging.file.name=/var/log/ecommerce/app.log
   ```

3. **Build and Run**:
   ```bash
   ./mvnw clean package -DskipTests
   java -jar -Dspring.profiles.active=prod target/Ecommerce-Backend-0.0.1-SNAPSHOT.jar
   ```

4. **Create Systemd Service**:
   ```bash
   sudo nano /etc/systemd/system/ecommerce-backend.service
   ```
   
   ```ini
   [Unit]
   Description=E-commerce Backend
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/DEA-FINAL-PROJECT-24.2-/Ecommerce-Backend
   ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod target/Ecommerce-Backend-0.0.1-SNAPSHOT.jar
   Restart=always
   RestartSec=10
   StandardOutput=syslog
   StandardError=syslog
   SyslogIdentifier=ecommerce-backend

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable ecommerce-backend
   sudo systemctl start ecommerce-backend
   ```

### Step 4: Frontend Production Deployment
1. **Build Frontend**:
   ```bash
   cd ../Ecommerce-Frontend
   npm install
   npm run build
   ```

2. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/ecommerce
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /home/ubuntu/DEA-FINAL-PROJECT-24.2-/Ecommerce-Frontend/dist;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # Static files
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 5: SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Docker Deployment

### Step 1: Create Dockerfiles

**Backend Dockerfile** (`Ecommerce-Backend/Dockerfile`):
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/Ecommerce-Backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile** (`Ecommerce-Frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: ecommerce-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ecommerce_db
      MYSQL_USER: ecommerce_user
      MYSQL_PASSWORD: userpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - ecommerce-network

  backend:
    build: ./Ecommerce-Backend
    container_name: ecommerce-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ecommerce_db
      SPRING_DATASOURCE_USERNAME: ecommerce_user
      SPRING_DATASOURCE_PASSWORD: userpassword
    depends_on:
      - mysql
    networks:
      - ecommerce-network

  frontend:
    build: ./Ecommerce-Frontend
    container_name: ecommerce-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - ecommerce-network

volumes:
  mysql_data:

networks:
  ecommerce-network:
    driver: bridge
```

### Step 3: Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Cloud Deployment

### AWS Deployment

#### Step 1: EC2 Instance Setup
1. **Launch EC2 Instance**:
   - Instance Type: t3.medium or larger
   - Operating System: Ubuntu 20.04 LTS
   - Security Groups: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

#### Step 2: RDS Database Setup
1. **Create RDS MySQL Instance**:
   - Engine: MySQL 8.0
   - Instance Class: db.t3.micro (for testing)
   - Security Groups: Allow MySQL (3306) from EC2

2. **Update Backend Configuration**:
   ```properties
   spring.datasource.url=jdbc:mysql://your-rds-endpoint:3306/ecommerce_db
   ```

#### Step 3: S3 for Static Assets (Optional)
1. **Create S3 Bucket** for product images
2. **Configure Backend** to use S3 for file storage

### Google Cloud Platform Deployment

#### Step 1: Compute Engine
1. **Create VM Instance**:
   ```bash
   gcloud compute instances create ecommerce-server \
     --machine-type=e2-medium \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud
   ```

#### Step 2: Cloud SQL
1. **Create MySQL Instance**:
   ```bash
   gcloud sql instances create ecommerce-db \
     --database-version=MYSQL_8_0 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

### Heroku Deployment

#### Step 1: Prepare Backend for Heroku
1. **Create Procfile**:
   ```
   web: java -Dserver.port=$PORT -jar target/Ecommerce-Backend-0.0.1-SNAPSHOT.jar
   ```

2. **Add Heroku Profile** (`application-heroku.properties`):
   ```properties
   spring.datasource.url=${DATABASE_URL}
   server.port=${PORT:8080}
   ```

#### Step 2: Deploy
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-ecommerce-app

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Deploy
git push heroku main
```

## Database Setup

### Development Database
```sql
-- Create database and user
CREATE DATABASE ecommerce_dev;
CREATE USER 'dev_user'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON ecommerce_dev.* TO 'dev_user'@'localhost';

-- Sample data (optional)
INSERT INTO roles (name) VALUES ('ADMIN'), ('SELLER'), ('CUSTOMER');
```

### Production Database
```sql
-- Create database and user with strong password
CREATE DATABASE ecommerce_prod;
CREATE USER 'prod_user'@'localhost' IDENTIFIED BY 'very_strong_production_password';
GRANT ALL PRIVILEGES ON ecommerce_prod.* TO 'prod_user'@'localhost';

-- Create indexes for performance
ALTER TABLE products ADD INDEX idx_category (category);
ALTER TABLE products ADD INDEX idx_brand (brand);
ALTER TABLE products ADD INDEX idx_price (price);
ALTER TABLE orders ADD INDEX idx_user_id (user_id);
ALTER TABLE orders ADD INDEX idx_order_date (order_date);
```

### Database Backup
```bash
# Backup
mysqldump -u username -p ecommerce_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u username -p ecommerce_prod < backup_file.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u prod_user -p ecommerce_prod > $BACKUP_DIR/ecommerce_backup_$TIMESTAMP.sql
find $BACKUP_DIR -name "ecommerce_backup_*.sql" -mtime +7 -delete
```

## Configuration

### Security Configuration
1. **Change Default Passwords**
2. **Configure Firewall**:
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

3. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

### Performance Optimization
1. **JVM Tuning**:
   ```bash
   java -Xms512m -Xmx2g -XX:+UseG1GC -jar app.jar
   ```

2. **Database Optimization**:
   ```sql
   -- MySQL configuration in /etc/mysql/mysql.conf.d/mysqld.cnf
   innodb_buffer_pool_size = 1G
   innodb_log_file_size = 256M
   max_connections = 100
   ```

3. **Nginx Optimization**:
   ```nginx
   worker_processes auto;
   worker_connections 1024;
   
   gzip on;
   gzip_vary on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

## Monitoring and Logging

### Application Monitoring
1. **Health Check Endpoint**:
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Log Monitoring**:
   ```bash
   tail -f /var/log/ecommerce/app.log
   ```

3. **System Monitoring**:
   ```bash
   # Install monitoring tools
   sudo apt install htop iotop nethogs
   
   # Check system resources
   htop
   df -h
   free -m
   ```

### Log Configuration
Add to `application-prod.properties`:
```properties
# Logging Configuration
logging.level.root=WARN
logging.level.com.cart.ecom_proj=INFO
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.file.name=/var/log/ecommerce/app.log
logging.file.max-size=10MB
logging.file.max-history=30
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Check connection
mysql -u username -p -h localhost

# Check firewall
sudo ufw status
```

#### 2. Port Already in Use
```bash
# Find process using port
sudo lsof -i :8080

# Kill process
sudo kill -9 PID
```

#### 3. Memory Issues
```bash
# Check memory usage
free -m

# Adjust JVM heap size
java -Xms256m -Xmx1g -jar app.jar
```

#### 4. File Upload Issues
```bash
# Check disk space
df -h

# Check upload directory permissions
ls -la uploads/
sudo chown -R ubuntu:ubuntu uploads/
```

### Debugging Steps
1. **Check Logs**:
   ```bash
   tail -f /var/log/ecommerce/app.log
   journalctl -u ecommerce-backend -f
   ```

2. **Verify Configuration**:
   ```bash
   # Check Java version
   java -version

   # Check application properties
   cat src/main/resources/application.properties
   ```

3. **Network Debugging**:
   ```bash
   # Check port listening
   netstat -tlnp | grep 8080

   # Test API endpoint
   curl -v http://localhost:8080/api/products
   ```

### Performance Issues
1. **Database Performance**:
   ```sql
   SHOW PROCESSLIST;
   EXPLAIN SELECT * FROM products WHERE category = 'Electronics';
   ```

2. **Application Performance**:
   ```bash
   # Monitor JVM
   jps -v
   jstat -gc PID 5s
   ```

### Recovery Procedures
1. **Service Recovery**:
   ```bash
   sudo systemctl restart ecommerce-backend
   sudo systemctl restart nginx
   ```

2. **Database Recovery**:
   ```bash
   mysql -u username -p ecommerce_prod < latest_backup.sql
   ```

## Maintenance

### Regular Maintenance Tasks
1. **Weekly**:
   - Check application logs
   - Monitor disk space
   - Review security logs

2. **Monthly**:
   - Update system packages
   - Review performance metrics
   - Database optimization

3. **Quarterly**:
   - Security audit
   - Backup verification
   - Disaster recovery testing

### Update Procedures
1. **Application Updates**:
   ```bash
   # Backup current version
   cp app.jar app.jar.backup
   
   # Deploy new version
   wget new-version.jar
   sudo systemctl stop ecommerce-backend
   cp new-version.jar app.jar
   sudo systemctl start ecommerce-backend
   ```

2. **Database Migrations**:
   ```bash
   # Backup before migration
   mysqldump -u username -p ecommerce_prod > pre_migration_backup.sql
   
   # Run migration
   java -Dspring.profiles.active=prod -jar app.jar --spring.jpa.hibernate.ddl-auto=update
   ```

---

For additional support, please refer to:
- [Contributing Guidelines](CONTRIBUTING.md)
- [API Documentation](API.md)
- [Project README](README.md)

**Support Contact**: For deployment issues, please create an issue in the GitHub repository.