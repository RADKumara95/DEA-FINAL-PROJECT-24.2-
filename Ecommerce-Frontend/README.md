# E-Commerce Application Frontend

This is the frontend application for the E-commerce platform built with React and Vite.

## Prerequisites

- Node.js 16.0 or higher
- npm 7.0 or higher
- Backend server running (see Backend README)

## Setup and Installation

1. **Install Dependencies**
   ```bash
   # Navigate to the frontend directory
   cd Ecommerce-Frontend

   # Install packages
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```

## Available Features

- User Authentication
  - Login
  - Registration
  - Profile Management

- Product Management
  - View Products
  - Product Details
  - Add/Edit Products (Admin)
  - Delete Products (Admin)

- Shopping Cart
  - Add to Cart
  - Update Quantities
  - Remove Items
  - Checkout Process

- Order Management
  - Order History
  - Order Details
  - Order Status Updates (Admin)

## Project Structure

```
src/
├── assets/        # Images and static assets
├── components/    # React components
├── Context/       # Context providers
├── App.jsx        # Main application component
├── main.jsx      # Application entry point
└── axios.jsx     # API configuration
```

## Development

- Start development server:
  ```bash
  npm run dev
  ```

- Run linter:
  ```bash
  npm run lint
  ```

- Format code:
  ```bash
  npm run format
  ```

## Troubleshooting

1. **API Connection Issues**
   - Verify backend server is running
   - Check VITE_API_URL in .env file
   - Ensure CORS is properly configured on backend

2. **Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules`
   - Reinstall dependencies: `npm install`

3. **Development Server Issues**
   - Check for port conflicts
   - Verify Node.js version
   - Clear browser cache

## Browser Support

The application is tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
