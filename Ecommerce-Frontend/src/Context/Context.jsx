import axios from "../axios";
import { useState, useEffect, createContext } from "react";

/**
 * React Context for managing global application state.
 * Provides centralized state management for products, cart, and error handling.
 * Uses localStorage for cart persistence across browser sessions.
 */
const AppContext = createContext({
  data: [],                                    // Product list from API
  isError: "",                                 // Error message state
  cart: [],                                    // Shopping cart items
  addToCart: (product) => {},                  // Function to add product to cart
  removeFromCart: (productId) => {},           // Function to remove product from cart
  refreshData: () => {},                       // Function to refresh product data
  updateStockQuantity: (productId, newQuantity) => {}, // Function to update stock (if implemented)
  clearCart: () => {}                          // Function to clear entire cart
});

/**
 * Context Provider component that wraps the application and provides global state.
 * Manages product data, shopping cart state, and localStorage synchronization.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render within the provider
 * @returns {JSX.Element} Provider component with global state
 */
export const AppProvider = ({ children }) => {
  // State for storing product data fetched from API
  const [data, setData] = useState([]);
  
  // State for storing error messages from API calls or other operations
  const [isError, setIsError] = useState("");
  
  // State for shopping cart - initialized from localStorage or empty array
  // This allows cart persistence across browser sessions and page refreshes
  const initialCart = JSON.parse(localStorage.getItem('cart')) || [];
  console.log("🛒 Context initialized with cart from localStorage:", initialCart);
  const [cart, setCart] = useState(initialCart);

  /**
   * Adds a product to the shopping cart or increments quantity if already present.
   * Implements smart cart logic to handle duplicate products by incrementing quantity.
   * Automatically syncs with localStorage for persistence.
   * 
   * @param {Object} product - Product object to add to cart
   * @param {number} product.id - Unique product identifier
   * @param {string} product.name - Product name
   * @param {number} product.price - Product price
   * @param {Object} ...otherProps - Other product properties
   */
  const addToCart = (product) => {
    console.log("🛒 addToCart called with product:", product);
    console.log("🛒 Current cart before adding:", cart);
    
    // Check if product already exists in cart by ID
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    
    if (existingProductIndex !== -1) {
      // Product exists: increment quantity by 1
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 } // Increment existing quantity
          : item // Keep other items unchanged
      );
      console.log("🛒 Product exists, updated cart:", updatedCart);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart)); // Persist to localStorage
    } else {
      // Product doesn't exist: add new item with quantity 1
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      console.log("🛒 New product added, updated cart:", updatedCart);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart)); // Persist to localStorage
    }
    
    console.log("🛒 localStorage after update:", localStorage.getItem('cart'));
  };

  /**
   * Removes a product completely from the shopping cart.
   * Note: This removes the entire item regardless of quantity.
   * For quantity decrement, a separate function would be needed.
   * 
   * @param {number} productId - ID of the product to remove from cart
   */
  const removeFromCart = (productId) => {
    console.log("productID", productId); // Debug log for development
    
    // Filter out the product with matching ID
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart)); // Persist changes
    
    console.log("CART", cart); // Debug log to verify cart state
  };

  /**
   * Fetches fresh product data from the API.
   * Used for initial data load and manual refresh operations.
   * Updates error state if the API call fails.
   */
  const refreshData = async () => {
    try {
      const response = await axios.get("/products?page=0&size=1000");
      // Handle paginated response - extract content array
      const products = response.data.content || response.data || [];
      setData(products);
      setIsError(""); // Clear any previous errors
    } catch (error) {
      setIsError(error.message); // Store error message for display
      console.error("Failed to fetch product data:", error);
    }
  };

  /**
   * Clears all items from the shopping cart.
   * Useful for post-checkout cleanup or manual cart reset.
   */
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart'); // Also remove from localStorage
  };
  
  /**
   * Effect hook to load initial product data when component mounts.
   * Runs once when the AppProvider is first rendered.
   */
  useEffect(() => {
    refreshData();
  }, []); // Empty dependency array = run once on mount

  /**
   * Effect hook to sync cart state with localStorage whenever cart changes.
   * Ensures cart persistence across browser sessions and page refreshes.
   * This provides a backup sync in addition to manual localStorage updates in cart functions.
   */
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]); // Runs whenever cart state changes
  
  return (
    <AppContext.Provider value={{ 
      data,           // Product list
      isError,        // Error state
      cart,           // Shopping cart items
      addToCart,      // Add to cart function
      removeFromCart, // Remove from cart function
      refreshData,    // Refresh products function
      clearCart       // Clear cart function
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;