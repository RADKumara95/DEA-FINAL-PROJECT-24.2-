import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import API from "../axios";
import AppContext from "../Context/Context";
import Pagination from "./Pagination";
import unplugged from "../assets/unplugged.png"

const Home = ({ selectedCategory, onClearCategory, searchKeyword, onClearSearch }) => {
  const { addToCart } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Read pagination params from URL
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "12");
    const sort = searchParams.get("sortBy") || "id";
    const dir = searchParams.get("sortDir") || "asc";
    
    setCurrentPage(page);
    setPageSize(size);
    setSortBy(sort);
    setSortDir(dir);
  }, [searchParams]);

  // Main effect to fetch products
  useEffect(() => {
    // Reset to page 0 when filters change
    if (currentPage !== 0) {
      setCurrentPage(0);
      updateURLParams({ page: "0" });
    } else {
      fetchProducts();
    }
  }, [selectedCategory, searchKeyword]);

  // Fetch products when pagination changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, sortBy, sortDir]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    
    try {
      let url = "/products";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: sortBy,
        sortDir: sortDir
      });

      // Add category filter if selected
      if (selectedCategory) {
        url = "/products/filter";
        params.append("category", selectedCategory);
        console.log("🔍 Category filter applied:", selectedCategory);
      }
      
      // Add search keyword if provided
      if (searchKeyword && searchKeyword.trim()) {
        url = "/products/search";
        params.append("keyword", searchKeyword.trim());
        console.log("🔍 Search keyword applied:", searchKeyword.trim());
      }

      const fullUrl = `${url}?${params.toString()}`;
      console.log("🔍 Fetching products from:", fullUrl);
      const response = await API.get(fullUrl);
      console.log("🔍 API Response:", response.data);
      
      // Handle paginated response
      if (response.data.content) {
        const productsWithImages = await fetchProductImages(response.data.content);
        setProducts(productsWithImages);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        // Handle non-paginated response (fallback)
        const productsArray = Array.isArray(response.data) ? response.data : [];
        const productsWithImages = await fetchProductImages(productsArray);
        setProducts(productsWithImages);
        setTotalPages(1);
        setTotalElements(productsArray.length);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productsData) => {
    console.log("Fetching images for products:", productsData);
    return Promise.all(
      productsData.map(async (product) => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/product/${product.id}/image`,
            { responseType: "blob" }
          );
          const imageUrl = URL.createObjectURL(response.data);
          return { ...product, imageUrl };
        } catch (error) {
          console.error("Error fetching image for product ID:", product.id, error);
          // Use fallback image from assets
          return { ...product, imageUrl: unplugged };
        }
      })
    );
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateURLParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    updateURLParams({ size: newSize.toString(), page: "0" });
  };

  const handleSortChange = (newSortBy, newSortDir) => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setCurrentPage(0);
    updateURLParams({ sortBy: newSortBy, sortDir: newSortDir, page: "0" });
  };

  const updateURLParams = (params) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      newSearchParams.set(key, value);
    });
    setSearchParams(newSearchParams);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen pt-20 text-center">
        <img src={unplugged} alt="Error" className="w-24 h-24 mb-4"/>
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-20 p-5">
        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="pageSize" className="font-medium text-gray-700 dark:text-gray-300">
              Items per page:
            </label>
            <select
              id="pageSize"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <label htmlFor="sortBy" className="font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              id="sortBy"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [newSortBy, newSortDir] = e.target.value.split("-");
                handleSortChange(newSortBy, newSortDir);
              }}
            >
              <option value="id-asc">Newest</option>
              <option value="id-desc">Oldest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter badges */}
        <div className="mb-4">
          {(selectedCategory || searchKeyword) && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Category: {selectedCategory}
                  <button 
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    onClick={() => {
                      onClearCategory && onClearCategory();
                    }}
                    aria-label="Clear category filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchKeyword && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Search: "{searchKeyword}"
                  <button 
                    className="ml-2 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200"
                    onClick={() => {
                      onClearSearch && onClearSearch();
                    }}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Showing {products.length} of {totalElements} products
            {currentPage > 0 && ` (Page ${currentPage + 1} of ${totalPages})`}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
          {products.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <h2 className="text-xl text-gray-600 dark:text-gray-400 text-center">
                {selectedCategory 
                  ? `No Products Available in "${selectedCategory}" Category` 
                  : "No Products Available"}
              </h2>
            </div>
          ) : (
            products.map((product) => {
              const { id, brand, name, price, productAvailable, imageUrl } = product;
              return (
                <div
                  className={`card-shell overflow-hidden flex flex-col h-96 transition-transform duration-300 ${
                    productAvailable
                      ? ''
                      : 'opacity-75 border-dashed'
                  }`}
                  key={id}
                >
                  <Link
                    to={`/product/${id}`}
                    className="flex-1 flex flex-col group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={imageUrl || unplugged}
                        alt={name}
                        className="w-full h-44 object-cover p-2 rounded-xl transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {name.toUpperCase()}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">
                          ~ {brand}
                        </p>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex items-center text-lg font-bold text-green-600 dark:text-green-400">
                          <i className="bi bi-currency-rupee"></i>
                          {price}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 pt-0">
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                        productAvailable
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product);
                        alert("Product added to cart!");
                      }}
                      disabled={!productAvailable}
                    >
                      {productAvailable ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
};

export default Home;
