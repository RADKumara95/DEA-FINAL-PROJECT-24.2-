import { createContext, useState, useEffect, useContext } from "react";
import API from "../axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount - load from localStorage first
  useEffect(() => {
    console.log("🔐 AuthContext initializing...");
    
    // Try to load user from localStorage first
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log("🔐 Found saved user in localStorage:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        
        // Verify with backend in background
        checkAuth().catch(() => {
          console.log("🔐 Session expired, clearing local data");
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        });
      } catch (error) {
        console.error("🔐 Error parsing saved user:", error);
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      // No saved user, check with backend
      console.log("🔐 No saved user, checking with backend...");
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await API.get("/auth/me");
      console.log("🔐 Auth check successful:", response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.log("🔐 Auth check failed:", error.response?.status);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await API.post("/auth/login", { username, password });
      console.log("🔐 Login successful:", response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, data: response.data };
    } catch (error) {
      console.error("🔐 Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await API.post("/auth/register", userData);
      console.log("🔐 Registration successful");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("🔐 Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
      console.log("🔐 Logout successful");
    } catch (error) {
      console.error("🔐 Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Clear localStorage
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

