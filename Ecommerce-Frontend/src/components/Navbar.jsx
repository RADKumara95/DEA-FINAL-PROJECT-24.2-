import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

const Navbar = ({ onSelectCategory, onSearch, selectedCategory: selectedCategoryProp }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const getInitialTheme = () => {
    if (typeof window === "undefined") {
      return "light";
    }
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  };
  const [theme, setTheme] = useState(getInitialTheme);
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await API.get("/products");
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await API.get(
          `/products/search?keyword=${value}`
        );
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && onSearch) {
      onSearch(input.trim());
      setShowSearchResults(false);
      setIsMenuOpen(false);
      // Navigate to home page if not already there
      if (window.location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  const handleSearchResultClick = (productId) => {
    setShowSearchResults(false);
    setInput("");
    setIsMenuOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleCategorySelect = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    
    // Navigate to home page if not already there
    if (window.location.pathname !== "/") {
      navigate("/");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const isAdminOrSeller = user?.roles?.some(role => 
    role === "ROLE_ADMIN" || role === "ROLE_SELLER"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    document.body.dataset.theme = theme;
  }, [theme]);

  // Categories must match the actual categories in the database
  const categories = [
    "Smartphones",
    "Laptops",
    "Audio",
    "Tablets",
    "Accessories",
    "Wearables",
    "Monitors"
  ];

  return (
    <>
      <header>
        <nav className="app-navbar fixed top-0 left-0 w-full z-50 py-3 px-4">
          <div className="container mx-auto flex flex-wrap items-center justify-between">
            {/* Brand */}
            <Link 
              className="text-xl font-semibold tracking-tight text-current"
              to="/"
            >
              HiTeckKart
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden icon-button"
              type="button"
              aria-controls="navbarContent"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Navigation content */}
            <div
              id="navbarContent"
              className={`w-full lg:w-auto ${
                isMenuOpen ? "mt-4 flex flex-col gap-4" : "hidden"
              } lg:flex lg:flex-row lg:items-center lg:gap-0`}
            >
              {/* Left navigation */}
              <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-2 mt-4 lg:mt-0 gap-1 lg:gap-0">
                <li>
                  <Link 
                    className="nav-link"
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                {isAuthenticated && isAdminOrSeller && (
                  <li>
                    <Link 
                      className="nav-link"
                      to="/add_product"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Product
                    </Link>
                  </li>
                )}
                {isAuthenticated && (
                  <li>
                    <Link 
                      className="nav-link flex items-center"
                      to="/orders"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="bi bi-bag-check mr-2"></i>
                      My Orders
                    </Link>
                  </li>
                )}
                {isAuthenticated && isAdminOrSeller && (
                  <li>
                    <Link 
                      className="nav-link flex items-center"
                      to="/admin/orders"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="bi bi-clipboard-data mr-2"></i>
                      Manage Orders
                    </Link>
                  </li>
                )}

                {/* Categories dropdown */}
                <li className="relative group">
                  <button
                    className="nav-link flex items-center"
                    type="button"
                  >
                    Categories
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <ul className="dropdown-panel absolute left-0 mt-1 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <li>
                      <button
                        className={`nav-link w-full justify-start rounded-t-md ${
                          selectedCategoryProp === "" ? "font-bold" : "font-normal"
                        }`}
                        onClick={() => {
                          handleCategorySelect("");
                          setIsMenuOpen(false);
                        }}
                      >
                        All Categories
                      </button>
                    </li>
                    <li><hr className="border-gray-200 dark:border-gray-600" /></li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          className={`nav-link w-full justify-start ${
                            selectedCategoryProp === category ? "font-bold" : "font-normal"
                          }`}
                          onClick={() => {
                            handleCategorySelect(category);
                            setIsMenuOpen(false);
                          }}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>

              {/* Right side content */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:ml-auto space-y-4 lg:space-y-0 lg:space-x-4 mt-4 lg:mt-0">
                {/* Theme toggle */}
                <button 
                  className="icon-button self-end lg:self-auto"
                  onClick={() => toggleTheme()}
                >
                  {theme === "dark" ? (
                    <i className="bi bi-moon-fill text-lg"></i>
                  ) : (
                    <i className="bi bi-sun-fill text-lg"></i>
                  )}
                </button>

                {/* Search */}
                <div className="relative min-w-72">
                  <form onSubmit={handleSearchSubmit} className="flex">
                    <input
                      className="search-input"
                      type="search"
                      placeholder="Search products..."
                      value={input}
                      onChange={(e) => handleChange(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setSearchFocused(false), 200);
                      }}
                    />
                    <button 
                      className="search-button"
                      type="submit"
                    >
                      <i className="bi bi-search"></i>
                    </button>
                  </form>
                  
                  {/* Search results dropdown */}
                  {showSearchResults && (searchFocused || showSearchResults) && (
                    <ul className="dropdown-panel absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto z-50">
                      {searchResults.length > 0 ? (
                        <>
                          <li className="px-4 py-2 text-sm text-muted">
                            Click a product to view details, or press Enter to search all products
                          </li>
                          {searchResults.slice(0, 5).map((result) => (
                            <li key={result.id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                              <button
                                className="nav-link w-full justify-start py-3"
                                onClick={() => handleSearchResultClick(result.id)}
                              >
                                <div className="font-medium">{result.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{result.brand}</div>
                              </button>
                            </li>
                          ))}
                          {searchResults.length > 5 && (
                            <li className="px-4 py-2 text-sm text-muted">
                              {searchResults.length - 5} more results... Press Enter to see all
                            </li>
                          )}
                        </>
                      ) : (
                        noResults && (
                          <li className="px-4 py-3">
                            <p className="text-red-500 text-center mb-0">
                              No Product with such Name
                            </p>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/cart" 
                    className="nav-link flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bi bi-cart mr-2"></i>
                    Cart
                  </Link>

                  {/* Auth section */}
                  {isAuthenticated ? (
                    <div className="relative group">
                      <button
                        className="nav-link border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center"
                        type="button"
                      >
                        {user?.username || "User"}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <ul className="dropdown-panel absolute right-0 mt-1 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <li>
                          <Link 
                            className="nav-link w-full justify-start rounded-t-md" 
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Profile
                          </Link>
                        </li>
                        <li><hr className="border-gray-200 dark:border-gray-600" /></li>
                        <li>
                          <button
                            className="nav-link w-full justify-start rounded-b-md"
                            onClick={handleLogout}
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Link 
                        to="/login" 
                        className="nav-link border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        className="nav-link bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
