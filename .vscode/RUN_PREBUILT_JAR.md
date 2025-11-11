# Running Pre-built JAR on Windows

## Prerequisites on Windows Machine:
1. **Java 21 JRE** installed
2. **MySQL 8.0** running locally or via Docker
3. The pre-built JAR file: `ecom-proj-0.0.1-SNAPSHOT.jar`

## Steps:

### 1. Transfer the JAR file
Copy this file from your Mac to Windows:
```
Ecommerce-Backend/build/libs/ecom-proj-0.0.1-SNAPSHOT.jar
```

### 2. Setup MySQL on Windows

**Option A: Using Docker (Recommended)**
```bash
docker run -d \
  --name ecommerce-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=ecommerce \
  -e MYSQL_USER=ecomuser \
  -e MYSQL_PASSWORD=ecompassword \
  -p 3306:3306 \
  mysql:8.0
```

**Option B: Local MySQL Installation**
- Install MySQL 8.0
- Create database: `CREATE DATABASE ecommerce;`
- Create user: 
  ```sql
  CREATE USER 'ecomuser'@'localhost' IDENTIFIED BY 'ecompassword';
  GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecomuser'@'localhost';
  FLUSH PRIVILEGES;
  ```

### 3. Run the JAR

**Windows Command Prompt:**
```cmd
java -jar ecom-proj-0.0.1-SNAPSHOT.jar
```

**With custom settings:**
```cmd
java -jar ecom-proj-0.0.1-SNAPSHOT.jar ^
  --spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce?useSSL=false^&allowPublicKeyRetrieval=true^&serverTimezone=UTC ^
  --spring.datasource.username=ecomuser ^
  --spring.datasource.password=ecompassword
```

**PowerShell:**
```powershell
java -jar ecom-proj-0.0.1-SNAPSHOT.jar `
  --spring.datasource.url="jdbc:mysql://localhost:3306/ecommerce?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" `
  --spring.datasource.username=ecomuser `
  --spring.datasource.password=ecompassword
```

### 4. Verify
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health check: http://localhost:8080/actuator/health

---

## Option 2: Use Pre-built JAR in Docker (Faster Build)

This avoids building in Docker and just runs the pre-built JAR.

### Create a simplified Dockerfile:

**File: `Ecommerce-Backend/Dockerfile.prebuilt`**
```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the pre-built JAR
COPY build/libs/ecom-proj-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
```

### Update docker-compose.yml to use it:

**File: `docker-compose-prebuilt.yml`**
```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: ecommerce-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ecommerce
      MYSQL_USER: ecomuser
      MYSQL_PASSWORD: ecompassword
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - ecommerce-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: ./Ecommerce-Backend
      dockerfile: Dockerfile.prebuilt
    container_name: ecommerce-backend
    ports:
      - "8080:8080"
    environment:
      - JAVA_OPTS=-Xmx512m -Xms256m
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/ecommerce?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=ecomuser
      - SPRING_DATASOURCE_PASSWORD=ecompassword
    depends_on:
      mysql:
        condition: service_healthy
    restart: on-failure
    networks:
      - ecommerce-network

  frontend:
    build:
      context: ./Ecommerce-Frontend
      dockerfile: Dockerfile
    container_name: ecommerce-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - ecommerce-network

networks:
  ecommerce-network:
    driver: bridge

volumes:
  mysql-data:
```

### Run on Windows:
```bash
# Make sure the build/ folder with JAR exists
docker-compose -f docker-compose-prebuilt.yml up -d
```

**Build time:** ~10 seconds (just copying the JAR, no compilation!)

---

## ⚠️ Important Notes:

### What to Transfer:
```
✅ Ecommerce-Backend/build/libs/ecom-proj-0.0.1-SNAPSHOT.jar
✅ Ecommerce-Backend/src/main/resources/ (if running outside Docker)
```

### What NOT to Transfer:
```
❌ Ecommerce-Backend/build/classes/ (not needed)
❌ Ecommerce-Backend/build/tmp/ (not needed)
❌ Ecommerce-Backend/.gradle/ (build cache, not needed)
```

### Git Ignore Note:
The `build/` directory is typically in `.gitignore`, so:
- **Transfer via USB, network share, or cloud storage**
- **Or** commit just the JAR temporarily:
  ```bash
  git add -f Ecommerce-Backend/build/libs/ecom-proj-0.0.1-SNAPSHOT.jar
  git commit -m "Add pre-built JAR for Windows"
  ```

### Configuration Requirements:
If running the JAR directly (not in Docker), ensure:
1. MySQL is accessible at `localhost:3306`
2. Database `ecommerce` exists
3. User `ecomuser` with password `ecompassword` has access
4. Or override with command-line arguments as shown above

---

## 🚀 Recommended Approach for Windows:

**Fastest Method:**
1. Build JAR on Mac: `./gradlew bootJar`
2. Transfer JAR to Windows
3. Use `Dockerfile.prebuilt` approach
4. Run with `docker-compose-prebuilt.yml`

**Benefits:**
- ⚡ 10x faster "build" on Windows
- 🎯 No Gradle/build issues on Windows
- ✅ Same runtime behavior
- 🔄 Can rebuild JAR on Mac when code changes

**When to rebuild:**
- Only when you change Java/backend code
- Frontend changes don't require JAR rebuild
