# Database Setup - H2 In-Memory Database

## ✅ What's Configured

Your application now uses **H2 Database** - a fast, in-memory SQL database perfect for development and testing.

### Features:
- ✅ Full SQL database functionality
- ✅ User registration and login work perfectly
- ✅ Pre-loaded with dummy data
- ✅ No external database server needed
- ✅ Fast startup and testing
- ✅ Works seamlessly with Docker

## 🚀 Quick Start

### Option 1: Run with Docker (Recommended)
```bash
docker-compose up --build
```

### Option 2: Run Locally
```bash
cd Ecommerce-Backend
./gradlew bootRun
```

## 👥 Test Accounts

The database comes pre-loaded with these users (password for all: **password123**):

| Email | Role | Username |
|-------|------|----------|
| admin@ecommerce.com | Admin | admin |
| john@example.com | User | john_doe |
| jane@example.com | User | jane_smith |
| seller@ecommerce.com | Seller | seller1 |

## 📦 Sample Data Included

- **4 Users** (Admin, 2 regular users, 1 seller)
- **15 Products** across multiple categories:
  - Smartphones (iPhone, Samsung, Google Pixel)
  - Laptops (MacBook Pro, Dell XPS, Surface Pro)
  - Audio (AirPods, Sony, Bose headphones)
  - Tablets (iPad Air, Galaxy Tab)
  - Accessories & Wearables

## 🔧 Access H2 Console (Development Only)

When running locally (not in Docker):
1. Visit: http://localhost:8080/h2-console
2. JDBC URL: `jdbc:h2:mem:Ecommerce`
3. Username: `sa`
4. Password: `project1`

## ✨ How It Works

1. **DataInitializer** runs first and creates the 3 roles (USER, ADMIN, SELLER)
2. **data.sql** executes next and inserts:
   - 4 sample users with encrypted passwords
   - Role assignments for users
   - 15 sample products
3. Database is recreated fresh on each startup

## 🔐 User Registration & Login

### Registration
New users can register through your frontend/API:
- They'll automatically get the **ROLE_USER** role
- Passwords are encrypted with BCrypt
- All validations work normally

### Login
Users can log in with:
- Username OR email
- Password is verified against BCrypt hash

## 🛒 Testing the Full Flow

1. **Start the application**
   ```bash
   docker-compose up --build
   ```

2. **Test login with existing user:**
   - Email: `john@example.com`
   - Password: `password123`

3. **Browse products:** 15 products are ready to view

4. **Register a new user:** Works perfectly!

5. **Create orders:** Users can add to cart and checkout

## 📝 Data Persistence

**Important:** H2 is an in-memory database, so:
- ✅ Data persists during the application session
- ❌ Data is **cleared when you restart** the application
- ✅ Sample data is reloaded on each startup

This is **perfect for development and testing** where you want a clean state each time!

## 🔄 Need Persistent Data?

If you later need data to persist between restarts (for production), you can switch to MySQL. But for development, H2 is faster and easier!

## 🎯 API Endpoints

Your application should have endpoints like:
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/products` - Browse products
- `GET /api/users/profile` - Get user profile
- `POST /api/orders` - Create order

All will work with the H2 database!

## 🐛 Troubleshooting

### "Role not found" error
- The DataInitializer creates roles automatically
- Check logs for "✓ Created ROLE_USER" messages

### No products showing
- Check application logs for SQL execution
- Verify `spring.sql.init.mode=always` in application.properties

### Login not working
- Verify password: `password123` (for all sample users)
- Check that BCrypt is configured in SecurityConfig

## ✅ What You Can Do Now

- ✅ Register new users
- ✅ Login with existing users
- ✅ Browse 15 sample products
- ✅ Add products to cart
- ✅ Create orders
- ✅ Test all CRUD operations
- ✅ Test role-based access (Admin/User/Seller)

Enjoy your fully working e-commerce application! 🎉
