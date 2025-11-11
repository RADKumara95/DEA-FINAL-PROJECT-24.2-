@echo off
REM Windows Docker Compose Helper Script
REM This script helps diagnose and fix common Windows Docker issues

echo ==========================================
echo Docker Compose Helper for Windows
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

:menu
echo Choose an option:
echo 1. Start services
echo 2. Stop services
echo 3. Restart services (clean restart)
echo 4. View backend logs
echo 5. View MySQL logs
echo 6. Check service health
echo 7. Complete reset (removes all data)
echo 8. Fix line endings in gradlew
echo 9. Check port conflicts
echo 0. Exit
echo.

set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto backend_logs
if "%choice%"=="5" goto mysql_logs
if "%choice%"=="6" goto health
if "%choice%"=="7" goto reset
if "%choice%"=="8" goto fix_lineendings
if "%choice%"=="9" goto check_ports
if "%choice%"=="0" exit /b 0
goto menu

:start
echo.
echo Starting services...
docker-compose up -d
echo.
echo Services started! Wait 30-60 seconds for initialization.
echo Check health status with option 6.
pause
goto menu

:stop
echo.
echo Stopping services...
docker-compose down
echo.
echo Services stopped.
pause
goto menu

:restart
echo.
echo Restarting services with clean state...
docker-compose down -v
echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul
docker-compose up -d
echo.
echo Services restarted! Wait 30-60 seconds for initialization.
pause
goto menu

:backend_logs
echo.
echo Backend logs (last 100 lines):
echo ==========================================
docker logs --tail 100 ecommerce-backend
echo ==========================================
echo.
pause
goto menu

:mysql_logs
echo.
echo MySQL logs (last 100 lines):
echo ==========================================
docker logs --tail 100 ecommerce-mysql
echo ==========================================
echo.
pause
goto menu

:health
echo.
echo Checking service health...
echo ==========================================
docker-compose ps
echo.
echo Testing backend health endpoint...
curl -s http://localhost:8080/actuator/health
echo.
echo ==========================================
echo.
pause
goto menu

:reset
echo.
echo [WARNING] This will delete ALL data including database!
set /p confirm="Are you sure? (yes/no): "
if not "%confirm%"=="yes" (
    echo Reset cancelled.
    pause
    goto menu
)
echo.
echo Performing complete reset...
docker-compose down -v
docker system prune -f
echo Rebuilding services...
docker-compose build --no-cache
echo Starting services...
docker-compose up -d
echo.
echo Complete reset done! Wait 30-60 seconds for initialization.
pause
goto menu

:fix_lineendings
echo.
echo Fixing line endings in gradlew...
cd Ecommerce-Backend
if exist gradlew (
    powershell -Command "(Get-Content gradlew -Raw) -replace \"`r`n\", \"`n\" | Set-Content gradlew -NoNewline"
    echo Line endings fixed!
) else (
    echo gradlew file not found!
)
cd ..
echo.
pause
goto menu

:check_ports
echo.
echo Checking port usage...
echo ==========================================
echo Port 8080 (Backend):
netstat -ano | findstr :8080
echo.
echo Port 3306 (MySQL):
netstat -ano | findstr :3306
echo.
echo Port 3000 (Frontend):
netstat -ano | findstr :3000
echo ==========================================
echo.
echo If ports are in use, you can:
echo 1. Stop the process using the PID shown above
echo 2. Change ports in docker-compose.yml
echo.
pause
goto menu
