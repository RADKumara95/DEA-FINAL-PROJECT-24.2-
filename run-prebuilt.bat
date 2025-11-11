@echo off
REM Quick setup script for running pre-built JAR on Windows

echo ==========================================
echo Pre-built JAR Setup for Windows
echo ==========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if JAR exists
if not exist "Ecommerce-Backend\build\libs\ecom-proj-0.0.1-SNAPSHOT.jar" (
    echo [ERROR] Pre-built JAR not found!
    echo.
    echo Expected location: Ecommerce-Backend\build\libs\ecom-proj-0.0.1-SNAPSHOT.jar
    echo.
    echo Please transfer the JAR file from your Mac or build it:
    echo   1. On Mac: cd Ecommerce-Backend ^&^& ./gradlew bootJar
    echo   2. Transfer the JAR file to Windows
    echo   3. Place it in: Ecommerce-Backend\build\libs\
    echo.
    pause
    exit /b 1
)

echo [OK] Pre-built JAR found
echo.

echo Starting services with pre-built JAR...
echo This will be much faster than building from source!
echo.

docker-compose -f docker-compose-prebuilt.yml up -d

echo.
echo ==========================================
echo Services are starting...
echo ==========================================
echo.
echo Wait 30-60 seconds for initialization, then access:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8080/api
echo   Swagger:   http://localhost:8080/swagger-ui.html
echo.
echo Check status with: docker-compose -f docker-compose-prebuilt.yml ps
echo View logs with:    docker-compose -f docker-compose-prebuilt.yml logs -f
echo.
pause
