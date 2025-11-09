# Docker Setup Guide

## Prerequisites
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- That's it! No Java, Maven, Node.js, or MySQL needed.

## Installation on macOS
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Open the `.dmg` file and drag Docker to Applications
3. Open Docker from Applications
4. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

## Running the Full Application

### 1. Start Everything
From the project root directory, run:
```bash
docker-compose up --build
```

**First time**: This will take 8-15 minutes (downloading images and building the app)
**Subsequent times**: Just run `docker-compose up` (takes ~30 seconds)

### 2. Wait for Startup
Watch for these messages in the logs:
```
backend | ... Started EcomProjApplication ...
frontend | Listening on port 3000
```

### 3. Access the Application
- **Frontend**: http://localhost:3000 (React App)
- **Backend API**: http://localhost:8080/api
- **Swagger UI (API Docs)**: http://localhost:8080/swagger-ui.html
- **H2 Console (Database)**: http://localhost:8080/h2-console

### 4. Stop Everything
Press `Ctrl+C` in the terminal, or in another terminal:
```bash
docker-compose down
```

## Useful Commands

```bash
# Start in background
docker-compose up -d

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Build without starting
docker-compose build

# Rebuild specific service
docker-compose build frontend
```

## Troubleshooting

### Ports already in use
Edit `docker-compose.yml`:

**For Frontend** (change port 3000):
```yaml
frontend:
  ports:
    - "3001:3000"  # Use 3001 instead
```

**For Backend** (change port 8080):
```yaml
backend:
  ports:
    - "8081:8080"  # Use 8081 instead
```

Then update the frontend API URL in `docker-compose.yml` nginx config if backend port changes.

### Frontend doesn't connect to backend
This is automatically configured! The frontend connects to `http://backend:8080` (internal Docker network).

### Out of memory
Increase Docker memory:
1. Open Docker Desktop
2. Go to Settings → Resources → Memory
3. Increase to at least 4GB
4. Apply & Restart

### Build fails
Try:
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Frontend shows blank page
1. Check frontend logs: `docker-compose logs frontend`
2. Open browser dev tools (F12) and check console
3. Rebuild: `docker-compose build frontend`

## Service Details

### Backend Service
- **Framework**: Spring Boot 3.3.3
- **Java Version**: 21
- **Port**: 8080
- **Database**: H2 (in-memory)
- **Features**: REST API, JWT Auth, Swagger UI

### Frontend Service
- **Framework**: React 18 + Vite
- **Port**: 3000
- **Server**: Nginx
- **Features**: SPA routing, API proxy

## Development Workflow

### Making changes to code
1. **Backend changes**: 
   ```bash
   docker-compose up
   # Edit Java files
   # Docker will auto-rebuild on restart
   docker-compose restart backend
   ```

2. **Frontend changes**:
   ```bash
   # For development with hot reload, run locally instead:
   cd Ecommerce-Frontend
   npm install
   npm run dev
   ```

### Building for production
The Dockerfiles already create optimized production builds using multi-stage builds.

## Next Steps

1. **Test the API**:
   - Open http://localhost:8080/swagger-ui.html
   - Try the endpoints (Register, Login, Get Products, etc.)

2. **Explore the Frontend**:
   - Open http://localhost:3000
   - Create an account, browse products

3. **Database**:
   - H2 Console: http://localhost:8080/h2-console
   - Login with: sa / project1

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Connection refused` | Wait 30-40 seconds for backend to start |
| `Cannot GET /` on frontend | Check frontend logs, might be build error |
| `API calls failing` | Verify backend is healthy: `docker ps` |
| `Port already in use` | Change ports in docker-compose.yml |
| `Docker out of memory` | Increase memory in Docker Desktop settings |
