import "./App.css";
import React, { useState } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Checkout from "./components/Checkout";
import OrderList from "./components/OrderList";
import OrderDetails from "./components/OrderDetails";
import AdminOrders from "./components/AdminOrders";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/Context";
import { AuthProvider } from "./Context/AuthContext";
import { OrderProvider } from "./Context/OrderContext";
import UpdateProduct from "./components/UpdateProduct";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
  };

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <AuthProvider>
      <AppProvider>
        <OrderProvider>
          <BrowserRouter>
          <Navbar onSelectCategory={handleCategorySelect} />
          <Routes>
            <Route
              path="/"
              element={
                <Home addToCart={addToCart} selectedCategory={selectedCategory} />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/add_product"
              element={
                <PrivateRoute requiredRoles={["ROLE_ADMIN", "ROLE_SELLER"]}>
                  <AddProduct />
                </PrivateRoute>
              }
            />
            <Route path="/product" element={<Product />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/product/update/:id"
              element={
                <PrivateRoute requiredRoles={["ROLE_ADMIN", "ROLE_SELLER"]}>
                  <UpdateProduct />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrderList />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute>
                  <OrderDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute requiredRoles={["ROLE_ADMIN", "ROLE_SELLER"]}>
                  <AdminOrders />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        </OrderProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
