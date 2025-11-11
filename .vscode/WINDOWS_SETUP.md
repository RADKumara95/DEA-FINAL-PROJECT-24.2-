# 🪟 Windows Setup Guide

This guide provides detailed instructions for setting up and running the E-Commerce application on Windows.

## Prerequisites for Windows

### Required Software

1. **Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Version: 4.x or higher
   - Enable WSL 2 backend (recommended for better performance)
   - Ensure Docker Desktop is running before proceeding

2. **Git for Windows**
   - Download from: https://git-scm.com/download/win
   - Install with default settings
   - Or use GitHub Desktop

3. **Java 21 (Optional - only if running without Docker)**
   - Download from: https://adoptium.net/
   - Set `JAVA_HOME` environment variable
   - Add Java to PATH

4. **Node.js 18+ (Optional - only if running without Docker)**
   - Download from: https://nodejs.org/
   - LTS version recommended

## 🚀 Quick Start with Docker (Recommended for Windows)

### Step 1: Clone the Repository

Open PowerShell or Command Prompt:

```powershell
# Using PowerShell
git clone https://github.com/RADKumara95/DEA-FINAL-PROJECT-24.2-.git
cd DEA-FINAL-PROJECT-24.2-
```

### Step 2: Verify Docker is Running

```powershell
docker --version
docker-compose --version
```

Expected output:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### Step 3: Build and Run with Docker Compose

```powershell
# Build and start all services
docker-compose up -d

# View logs to monitor startup
docker-compose logs -f
```

**Important for Windows Users:**
- The first build may take 10-15 minutes
- Docker Desktop must be running
- Ensure you have at least 4GB of RAM allocated to Docker
- If you see line ending warnings, they're handled by the `.gitattributes` file

### Step 4: Wait for Services to Initialize

The MySQL database needs time to initialize (30-60 seconds). You can monitor the progress:

```powershell
# Check MySQL initialization
docker-compose logs mysql | Select-String "ready for connections"

# Check backend startup
docker-compose logs backend | Select-String "Started EcomProjApplication"

# Check all services status
docker-compose ps
```

### Step 5: Access the Application

Once all services are running:

- **Frontend (React App)**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation (Swagger)**: http://localhost:8080/swagger-ui.html
- **MySQL Database**: localhost:3306

## 🎭 Dummy Data Access

### Pre-loaded Users

The application automatically loads dummy data on first startup via the `DataInitializer` class.

**Test Accounts:**

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@ecommerce.com | password123 | Admin | Full access to all features |
| john@example.com | password123 | User | Regular customer account |
| jane@example.com | password123 | User | Regular customer account |
| seller@ecommerce.com | password123 | Seller | Seller account |

### Pre-loaded Products

15 sample products are automatically created:
- Smartphones (iPhone 14 Pro, Samsung Galaxy S23, Google Pixel 8 Pro)
- Laptops (MacBook Pro, Dell XPS 13, Surface Pro 9)
- Audio (AirPods, Sony WH-1000XM5, Bose QC45)
- Tablets, Accessories, Wearables, and more

### Verifying Dummy Data

**Method 1: Via Frontend**
1. Open http://localhost:3000
2. Click "Login"
3. Use any test account credentials above
4. Browse products on the home page

**Method 2: Via Swagger UI**
1. Open http://localhost:8080/swagger-ui.html
2. Login with admin credentials
3. Try GET `/api/products` to see all products
4. Try GET `/api/auth/profile` to see user details

**Method 3: Direct Database Access**
```powershell
# Connect to MySQL container
docker exec -it ecommerce-mysql mysql -uecomuser -pecompassword ecommerce

# Run queries
mysql> SELECT COUNT(*) FROM users;
mysql> SELECT email, username FROM users;
mysql> SELECT COUNT(*) FROM products;
mysql> SELECT name, brand, price FROM products LIMIT 5;
mysql> exit
```

Expected results:
- 4 users (admin, john_doe, jane_smith, seller1)
- 15 products across various categories
- 3 roles (ROLE_USER, ROLE_ADMIN, ROLE_SELLER)

## 🔧 Windows-Specific Troubleshooting

### Issue 1: Line Ending Problems

**Symptom:** Errors like `'\r': command not found` when building Docker images

**Solution:** The `.gitattributes` file now handles this automatically. If you cloned before this fix:

```powershell
# Re-clone the repository OR
git rm --cached -r .
git reset --hard
```

### Issue 2: Docker Desktop Not Running

**Symptom:** `error during connect: This error may indicate that the docker daemon is not running`

**Solution:**
1. Open Docker Desktop from Start Menu
2. Wait for Docker to fully start (whale icon in system tray)
3. Try the docker-compose command again

### Issue 3: Port Already in Use

**Symptom:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```powershell
# Find and stop the process using the port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in docker-compose.yml
# Change "3000:3000" to "3001:3000" for frontend
```

### Issue 4: MySQL Connection Failed

**Symptom:** Backend fails to connect to MySQL

**Solution:**
```powershell
# Wait longer for MySQL to initialize
Start-Sleep -Seconds 30

# Check MySQL logs
docker-compose logs mysql

# Restart backend service
docker-compose restart backend
```

### Issue 5: Out of Disk Space

**Symptom:** Build fails with disk space errors

**Solution:**
```powershell
# Clean up Docker
docker system prune -a --volumes

# This removes:
# - All stopped containers
# - All networks not used by at least one container
# - All volumes not used by at least one container
# - All images without at least one container
```

### Issue 6: WSL 2 Not Enabled

**Symptom:** Docker Desktop requires WSL 2

**Solution:**
1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart computer
4. Open Docker Desktop and enable WSL 2 backend in Settings

### Issue 7: Gradle Build Issues (if building without Docker)

**Symptom:** `./gradlew: Permission denied` or similar

**Solution:** Use the Windows batch file:
```powershell
cd Ecommerce-Backend
.\gradlew.bat clean build
.\gradlew.bat bootRun
```

## 📊 Monitoring and Logs

### View All Logs
```powershell
docker-compose logs -f
```

### View Specific Service Logs
```powershell
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# MySQL logs
docker-compose logs -f mysql
```

### Check Container Status
```powershell
docker-compose ps
```

### Check Resource Usage
```powershell
docker stats
```

## 🛑 Stopping the Application

### Stop all services (keeps data)
```powershell
docker-compose stop
```

### Stop and remove containers (keeps data)
```powershell
docker-compose down
```

### Stop and remove everything including data
```powershell
docker-compose down -v
```

### Restart with fresh database
```powershell
docker-compose down -v
docker-compose up -d
```

## 🧪 Testing the Application

### 1. Test Frontend
```powershell
# Open browser and navigate to
Start-Process "http://localhost:3000"
```

### 2. Test Backend API
```powershell
# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Get

# Or use curl (if installed)
curl http://localhost:8080/api/products
```

### 3. Test Login
```powershell
# Using PowerShell
$body = @{
    email = "admin@ecommerce.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $body -ContentType "application/json" -SessionVariable session
```

## 🔄 Rebuilding After Code Changes

```powershell
# Rebuild and restart services
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 💡 Performance Tips for Windows

1. **Allocate More Resources to Docker**
   - Open Docker Desktop → Settings → Resources
   - Increase CPUs to 4 (if available)
   - Increase Memory to 4GB or more

2. **Use WSL 2 Backend**
   - Better performance than Hyper-V
   - Enable in Docker Desktop Settings

3. **Place Project in WSL Filesystem**
   - For better I/O performance
   - Clone into `\\wsl$\Ubuntu\home\<username>\projects`

4. **Disable Antivirus Scanning for Docker Folders**
   - Add Docker Desktop installation folder to exclusions
   - Add project folder to exclusions

## ✅ Verification Checklist

After setup, verify:

- [ ] Docker Desktop is running
- [ ] All 3 containers are running: `docker-compose ps`
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:8080/api
- [ ] Swagger UI accessible at http://localhost:8080/swagger-ui.html
- [ ] Can login with admin@ecommerce.com / password123
- [ ] Can see 15 products on home page
- [ ] Database contains dummy data (4 users, 15 products)
- [ ] No errors in logs: `docker-compose logs`

## 📞 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are healthy: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. Check the main README.md for general troubleshooting
5. Ensure you're using the latest version: `git pull origin main`

## 🎯 Quick Command Reference

```powershell
# Start application
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Rebuild everything
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d

# Clean Docker
docker system prune -a --volumes

# Access MySQL
docker exec -it ecommerce-mysql mysql -uecomuser -pecompassword ecommerce
```

---

**Note:** This project is fully compatible with Windows when using Docker. All line ending issues are handled automatically via `.gitattributes`, and the `DataInitializer` class ensures dummy data is loaded on first startup.
