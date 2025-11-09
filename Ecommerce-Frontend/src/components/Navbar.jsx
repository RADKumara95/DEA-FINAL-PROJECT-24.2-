import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

const Navbar = ({ onSelectCategory, onSearch, selectedCategory: selectedCategoryProp }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (value) => {
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
      // Navigate to home page if not already there
      if (window.location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  const handleSearchResultClick = (productId) => {
    setShowSearchResults(false);
    setInput("");
    navigate(`/product/${productId}`);
  };

  const handleCategorySelect = (category) => {
    console.log("📁 Category selected:", category);
    console.log("📁 Current onSelectCategory function:", onSelectCategory);
    setSelectedCategory(category);
    
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      console.error("📁 onSelectCategory prop is not provided!");
    }
    
    // Navigate to home page if not already there
    if (window.location.pathname !== "/") {
      console.log("📁 Navigating to home page from:", window.location.pathname);
      navigate("/");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isAdminOrSeller = user?.roles?.some(role => 
    role === "ROLE_ADMIN" || role === "ROLE_SELLER"
  );

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = [
    "Laptop",
    "Headphone",
    "Mobile",
    "Electronics",
    "Toys",
    "Fashion",
  ];

  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg fixed-top">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              HiTeckKart
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/">
                    Home
                  </Link>
                </li>
                {isAuthenticated && isAdminOrSeller && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/add_product">
                      Add Product
                    </Link>
                  </li>
                )}
                {isAuthenticated && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/orders">
                      <i className="bi bi-bag-check me-1"></i>
                      My Orders
                    </Link>
                  </li>
                )}
                {isAuthenticated && isAdminOrSeller && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/orders">
                      <i className="bi bi-clipboard-data me-1"></i>
                      Manage Orders
                    </Link>
                  </li>
                )}

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="/"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Categories
                  </a>

                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleCategorySelect("")}
                        style={{ fontWeight: selectedCategoryProp === "" ? "bold" : "normal" }}
                      >
                        All Categories
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCategorySelect(category)}
                          style={{ fontWeight: selectedCategoryProp === category ? "bold" : "normal" }}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
              <div className="navbar-right">
                <button className="theme-btn" onClick={() => toggleTheme()}>
                  {theme === "dark-theme" ? (
                    <i className="bi bi-moon-fill"></i>
                  ) : (
                    <i className="bi bi-sun-fill"></i>
                  )}
                </button>

                <div className="navbar-search">
                  <form onSubmit={handleSearchSubmit} className="d-flex">
                    <input
                      className="form-control"
                      type="search"
                      placeholder="Search products..."
                      aria-label="Search"
                      value={input}
                      onChange={(e) => handleChange(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => {
                        // Delay hiding results to allow clicking
                        setTimeout(() => setSearchFocused(false), 200);
                      }}
                    />
                    <button 
                      className="btn btn-outline-primary ms-1" 
                      type="submit"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <i className="bi bi-search"></i>
                    </button>
                  </form>
                  {showSearchResults && (searchFocused || showSearchResults) && (
                    <ul className="list-group position-absolute" style={{ 
                      top: "100%", 
                      left: 0, 
                      right: 0, 
                      zIndex: 1000,
                      maxHeight: "300px",
                      overflowY: "auto"
                    }}>
                      {searchResults.length > 0 ? (
                        <>
                          <li className="list-group-item bg-light">
                            <small className="text-muted">
                              Click a product to view details, or press Enter to search all products
                            </small>
                          </li>
                          {searchResults.slice(0, 5).map((result) => (
                            <li key={result.id} className="list-group-item list-group-item-action">
                              <button
                                className="btn btn-link text-start p-0 w-100"
                                style={{ textDecoration: "none" }}
                                onClick={() => handleSearchResultClick(result.id)}
                              >
                                <span>{result.name}</span>
                                <small className="text-muted d-block">{result.brand}</small>
                              </button>
                            </li>
                          ))}
                          {searchResults.length > 5 && (
                            <li className="list-group-item bg-light">
                              <small className="text-muted">
                                {searchResults.length - 5} more results... Press Enter to see all
                              </small>
                            </li>
                          )}
                        </>
                      ) : (
                        noResults && (
                          <li className="list-group-item">
                            <p className="no-results-message mb-0">
                              No Product with such Name
                            </p>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>

                <div className="navbar-actions">
                  <Link to="/cart" className="cart-link">
                    <i className="bi bi-cart"></i>
                    Cart
                  </Link>

                  <div className="auth-section">
                    {isAuthenticated ? (
                      <div className="user-dropdown">
                        <div className="dropdown">
                          <button
                            className="btn btn-outline-primary dropdown-toggle"
                            type="button"
                            id="userMenu"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {user?.username || "User"}
                          </button>
                          <ul className="dropdown-menu" aria-labelledby="userMenu">
                            <li>
                              <Link className="dropdown-item" to="/profile">
                                Profile
                              </Link>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={handleLogout}
                              >
                                Logout
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="auth-buttons">
                        <Link to="/login" className="btn btn-outline-primary">
                          Login
                        </Link>
                        <Link to="/register" className="btn btn-primary">
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
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
