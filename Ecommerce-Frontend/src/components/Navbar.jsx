import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";
import { Menu, X } from 'lucide-react';
import { cn } from "../lib/utils";

const Navbar = ({ onSelectCategory, onSearch, selectedCategory: selectedCategoryProp }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [menuState, setMenuState] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const categories = [
    "Smartphones", "Laptops", "Audio", "Tablets",
    "Accessories", "Wearables", "Monitors"
  ];

  function getInitialTheme() {
    if (typeof window === "undefined") return "light";
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    document.body.dataset.theme = theme;
  }, [theme]);

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
        const response = await API.get(`/products/search?keyword=${value}`);
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
      setMenuState(false);
      if (window.location.pathname !== "/") navigate("/");
    }
  };

  const handleSearchResultClick = (productId) => {
    setShowSearchResults(false);
    setInput("");
    setMenuState(false);
    navigate(`/product/${productId}`);
  };

  const handleCategorySelect = (category) => {
    if (onSelectCategory) onSelectCategory(category);
    if (window.location.pathname !== "/") navigate("/");
    setMenuState(false);
    setOpenDropdown(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMenuState(false);
    setUserDropdownOpen(false);
  };

  const isAdminOrSeller = user?.roles?.some(role => 
    role === "ROLE_ADMIN" || role === "ROLE_SELLER"
  );

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className={cn(
          'fixed z-50 w-full border-b transition-colors duration-150',
          scrolled && 'bg-background/50 backdrop-blur-3xl'
        )}>
        <div className="mx-auto max-w-7xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            
            {/* Left Section - Logo and Desktop Menu */}
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                to="/"
                className="text-xl font-semibold tracking-tight text-current flex items-center space-x-2">
                SlateSupply
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                <Menu className={cn(
                  "m-auto size-6 duration-200 transition-all",
                  menuState && "rotate-180 scale-0 opacity-0"
                )} />
                <X className={cn(
                  "absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 transition-all",
                  menuState && "rotate-0 scale-100 opacity-100"
                )} />
              </button>

              {/* Desktop Navigation */}
              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm items-center">
                  <li>
                    <Link to="/" className="text-muted-foreground hover:text-accent-foreground duration-150">
                      Home
                    </Link>
                  </li>
                  
                  {/* Categories Dropdown */}
                  <li className="relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
                      className="text-muted-foreground hover:text-accent-foreground duration-150 flex items-center">
                      Categories
                      <svg className={cn(
                        "w-4 h-4 ml-1 transition-transform duration-200",
                        openDropdown === 'categories' && "rotate-180"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === 'categories' && (
                      <ul className="absolute left-0 mt-2 w-52 opacity-100 visible z-50 bg-background border rounded-lg shadow-lg">
                        <li>
                          <button
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm rounded-t-lg hover:bg-muted",
                              selectedCategoryProp === "" && "font-bold"
                            )}
                            onClick={() => handleCategorySelect("")}>
                            All Categories
                          </button>
                        </li>
                        <li><hr className="border-gray-200 dark:border-gray-600" /></li>
                        {categories.map((category) => (
                          <li key={category}>
                            <button
                              className={cn(
                                "w-full text-left px-4 py-2 text-sm hover:bg-muted",
                                selectedCategoryProp === category && "font-bold"
                              )}
                              onClick={() => handleCategorySelect(category)}>
                              {category}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Section - Search, Theme, Cart, Auth */}
            <div className={cn(
              'bg-background lg:bg-transparent mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent',
              menuState && 'block'
            )}>
              
              {/* Mobile Navigation Menu */}
              <div className="lg:hidden w-full">
                <ul className="space-y-6 text-base">
                  <li>
                    <Link to="/" className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      onClick={() => setMenuState(false)}>
                      Home
                    </Link>
                  </li>
                  {isAuthenticated && isAdminOrSeller && (
                    <li>
                      <Link to="/add_product" className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        onClick={() => setMenuState(false)}>
                        Add Product
                      </Link>
                    </li>
                  )}
                  {isAuthenticated && (
                    <li>
                      <Link to="/orders" className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        onClick={() => setMenuState(false)}>
                        My Orders
                      </Link>
                    </li>
                  )}
                  {isAuthenticated && isAdminOrSeller && (
                    <li>
                      <Link to="/admin/orders" className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        onClick={() => setMenuState(false)}>
                        Manage Orders
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="text-muted-foreground hover:text-accent-foreground block duration-150 w-full text-left"
                      onClick={() => setOpenDropdown(openDropdown === 'mobile-categories' ? null : 'mobile-categories')}>
                      Categories
                      <svg className={cn(
                        "w-4 h-4 inline ml-2 transition-transform duration-200",
                        openDropdown === 'mobile-categories' && "rotate-180"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === 'mobile-categories' && (
                      <ul className="mt-3 space-y-2 pl-4 border-l border-gray-300 dark:border-gray-600">
                        <li>
                          <button
                            className={cn(
                              "text-sm text-muted-foreground hover:text-accent-foreground",
                              selectedCategoryProp === "" && "font-bold"
                            )}
                            onClick={() => handleCategorySelect("")}>
                            All Categories
                          </button>
                        </li>
                        {categories.map((category) => (
                          <li key={category}>
                            <button
                              className={cn(
                                "text-sm text-muted-foreground hover:text-accent-foreground",
                                selectedCategoryProp === category && "font-bold"
                              )}
                              onClick={() => handleCategorySelect(category)}>
                              {category}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <form onSubmit={handleSearchSubmit} className="flex">
                  <input
                    className="w-full px-4 py-2 text-sm rounded-lg border bg-background"
                    type="search"
                    placeholder="Search products..."
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  />
                  <button className="ml-2 px-4 py-2 text-sm" type="submit">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
                
                {/* Search Results Dropdown */}
                {showSearchResults && (searchFocused || showSearchResults) && (
                  <ul className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto z-50 bg-background border rounded-lg shadow-lg">
                    {searchResults.length > 0 ? (
                      <>
                        <li className="px-4 py-2 text-xs text-muted">
                          Click a product to view details, or press Enter to search all
                        </li>
                        {searchResults.slice(0, 5).map((result) => (
                          <li key={result.id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <button
                              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
                              onClick={() => handleSearchResultClick(result.id)}>
                              <div className="font-medium text-sm">{result.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{result.brand}</div>
                            </button>
                          </li>
                        ))}
                        {searchResults.length > 5 && (
                          <li className="px-4 py-2 text-xs text-muted">
                            {searchResults.length - 5} more results... Press Enter to see all
                          </li>
                        )}
                      </>
                    ) : (
                      noResults && (
                        <li className="px-4 py-3">
                          <p className="text-red-500 text-center text-sm">No Product with such Name</p>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit items-start lg:items-center">
                
                {/* Theme Toggle */}
                <button className="p-2 hover:bg-muted rounded-lg transition-colors"
                  onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.64,13a1,1,0,0,0-1.05-.14,8,8,0,0,1-3.52.92,8.07,8.07,0,0,1-8-8,8.3,8.3,0,0,1,.54-2A1,1,0,0,0,8,2.36a10,10,0,0,0,14,9.88A1,1,0,0,0,21.64,13Z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,18A6,6,0,1,1,18,12,6,6,0,0,1,12,18Zm0-10A4,4,0,1,0,16,12,4,4,0,0,0,12,8Zm5-3h0a1,1,0,0,0-1-1H15a1,1,0,0,0,0,2h1A1,1,0,0,0,17,5Zm4,7H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM4,12a1,1,0,0,0-1-1H2a1,1,0,0,0,0,2H3A1,1,0,0,0,4,12ZM7,5A1,1,0,0,0,8,4H9A1,1,0,0,0,9,2H8A1,1,0,0,0,7,5Zm0,14a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0v-1A1,1,0,0,0,7,19ZM5.64,7.05a1,1,0,0,0,.7.3,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12.72,12.72a1,1,0,0,0-.71.29,1,1,0,0,0,0,1.41l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41Z" />
                    </svg>
                  )}
                </button>

                {/* Cart */}
                <Link to="/cart" className="text-sm font-medium hover:text-accent-foreground duration-150 flex items-center"
                  onClick={() => setMenuState(false)}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart
                </Link>

                {/* Auth Section */}
                {isAuthenticated ? (
                  <div className="relative w-full sm:w-auto">
                    <button 
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="w-full sm:w-auto border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center sm:justify-start transition-colors">
                      {user?.username || "User"}
                      <svg className={cn(
                        "w-4 h-4 ml-1 transition-transform duration-200",
                        userDropdownOpen && "rotate-180"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {userDropdownOpen && (
                      <ul className="absolute right-0 mt-2 w-52 z-50 bg-background border rounded-lg shadow-lg">
                        <li>
                          <Link to="/profile" className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-t-lg"
                            onClick={() => {
                              setMenuState(false);
                              setUserDropdownOpen(false);
                            }}>
                            Profile
                          </Link>
                        </li>
                        <li><hr className="border-gray-200 dark:border-gray-600" /></li>
                        <li>
                          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-b-lg"
                            onClick={handleLogout}>
                            Logout
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="flex w-full sm:w-auto gap-3">
                    <Link to="/login" className="flex-1 sm:flex-none border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                      onClick={() => setMenuState(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="flex-1 sm:flex-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                      onClick={() => setMenuState(false)}>
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
  );
};

export default Navbar;
