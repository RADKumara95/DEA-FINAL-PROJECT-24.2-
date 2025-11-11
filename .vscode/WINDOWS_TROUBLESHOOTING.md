# Windows Troubleshooting Guide

## Backend 500 Error - Common Issues and Solutions

### 1. Database Connection Issues

**Symptoms:**
- Backend container starts but returns 500 errors
- Logs show database connection failures
- MySQL not ready when backend starts

**Solutions:**

#### Check MySQL is running:
```bash
docker ps
```
Verify the `ecommerce-mysql` container is healthy.

#### Check backend logs:
```bash
docker logs ecommerce-backend
```
Look for errors like:
- `Communications link failure`
- `Connection refused`
- `Unknown database`

#### Restart the services:
```bash
docker-compose down -v
docker-compose up -d
```

The `-v` flag removes volumes, ensuring a clean database start.

### 2. Line Ending Issues (CRLF vs LF)

**Symptoms:**
- Build fails in Docker
- `./gradlew: not found` or similar errors
- Script execution errors

**Solutions:**

The Dockerfile now includes `dos2unix` to automatically convert line endings. If you still have issues:

#### Configure Git to use LF line endings:
```bash
git config --global core.autocrlf input
```

#### Fix existing files:
```bash
# In the Ecommerce-Backend directory
dos2unix gradlew
```

Or if you don't have dos2unix installed:
```bash
# Convert CRLF to LF using PowerShell
(Get-Content gradlew) -replace "`r`n", "`n" | Set-Content gradlew -NoNewline
```

### 3. Port Conflicts

**Symptoms:**
- Container fails to start
- "Port is already allocated" error

**Solutions:**

#### Check what's using the ports:
```bash
# Check port 8080 (Backend)
netstat -ano | findstr :8080

# Check port 3306 (MySQL)
netstat -ano | findstr :3306

# Check port 3000 (Frontend)
netstat -ano | findstr :3000
```

#### Kill the process or change ports in docker-compose.yml:
```yaml
ports:
  - "8081:8080"  # Change 8080 to 8081 externally
```

### 4. Memory Issues

**Symptoms:**
- Container crashes or restarts
- Out of memory errors
- Slow performance

**Solutions:**

#### Increase Docker memory in Docker Desktop:
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to at least 4GB
4. Apply & Restart

#### Adjust JVM heap size in docker-compose.yml:
```yaml
environment:
  - JAVA_OPTS=-Xmx1024m -Xms512m  # Increase from 512m/256m
```

### 5. Windows Firewall/Antivirus

**Symptoms:**
- Containers can't communicate
- Random connection timeouts
- Intermittent 500 errors

**Solutions:**

#### Add Docker to Windows Firewall exceptions:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Docker Desktop and all its components

#### Temporarily disable antivirus to test:
If the issue resolves, add Docker directories to antivirus exclusions.

### 6. Docker Network Issues

**Symptoms:**
- Services can't reach each other
- DNS resolution failures

**Solutions:**

#### Recreate the Docker network:
```bash
docker-compose down
docker network prune
docker-compose up -d
```

#### Check network connectivity:
```bash
# Get into the backend container
docker exec -it ecommerce-backend /bin/bash

# Try to ping MySQL
ping mysql

# Check if MySQL port is accessible
curl mysql:3306
```

### 7. Database Initialization Errors

**Symptoms:**
- Backend starts but 500 errors on all endpoints
- Logs show table doesn't exist or SQL errors

**Solutions:**

#### Reset the database:
```bash
docker-compose down -v
docker-compose up -d mysql
# Wait for MySQL to be healthy (check with docker ps)
docker-compose up -d backend
```

#### Check database was created:
```bash
docker exec -it ecommerce-mysql mysql -uecomuser -pecompassword -e "SHOW DATABASES;"
docker exec -it ecommerce-mysql mysql -uecomuser -pecompassword -D ecommerce -e "SHOW TABLES;"
```

### 8. Build Cache Issues

**Symptoms:**
- Changes don't appear
- Old code running

**Solutions:**

#### Rebuild without cache:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### 9. Check Backend Health

After starting, verify the backend is healthy:

```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP","components":{"db":{"status":"UP"},...}}
```

### 10. View Detailed Logs

**For real-time logs:**
```bash
docker-compose logs -f backend
```

**For specific errors:**
```bash
docker-compose logs backend | findstr "ERROR"
docker-compose logs backend | findstr "Exception"
```

## Quick Fix Commands

### Complete Reset:
```bash
# Stop everything
docker-compose down -v

# Remove all containers and images
docker system prune -a

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

### Check Service Status:
```bash
# All services
docker-compose ps

# Specific service
docker-compose ps backend
```

### Access Container Shell:
```bash
# Backend
docker exec -it ecommerce-backend /bin/bash

# MySQL
docker exec -it ecommerce-mysql mysql -uecomuser -pecompassword
```

## WSL2 Specific Issues

If using WSL2:

### Performance:
Keep project files in the Linux filesystem (~/projects) not Windows (/mnt/c/...) for better performance.

### File Permissions:
```bash
# Fix permissions if needed
chmod +x Ecommerce-Backend/gradlew
```

### Network:
WSL2 uses a virtual network. If you can't access from Windows:
```bash
# Get WSL2 IP
ip addr show eth0
# Access using WSL2 IP instead of localhost
```

## Prevention Tips

1. **Always use Docker Compose** - Don't start services individually
2. **Wait for health checks** - Backend depends on MySQL being healthy
3. **Check logs first** - Most issues are clearly logged
4. **Use clean builds** - When in doubt, rebuild without cache
5. **Keep Docker updated** - Update Docker Desktop regularly

## Still Having Issues?

1. Check the complete backend logs: `docker logs ecommerce-backend > backend.log`
2. Check MySQL logs: `docker logs ecommerce-mysql > mysql.log`
3. Include these logs when asking for help
4. Note your Windows version and Docker version: `docker --version`
