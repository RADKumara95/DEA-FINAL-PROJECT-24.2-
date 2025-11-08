import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import API from "../axios";
import AppContext from "../Context/Context";
import Pagination from "./Pagination";
import unplugged from "../assets/unplugged.png"

const Home = ({ selectedCategory }) => {
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

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, sortBy, sortDir, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/products?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
      
      const response = await API.get(url);
      
      if (response.data.content) {
        // Paginated response
        const productsData = response.data.content;
        const updatedProducts = await fetchProductImages(productsData);
        setProducts(updatedProducts);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else if (Array.isArray(response.data)) {
        // Non-paginated response (fallback)
        const updatedProducts = await fetchProductImages(response.data);
        const filtered = selectedCategory
          ? updatedProducts.filter((p) => p.category === selectedCategory)
          : updatedProducts;
        setProducts(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productsData) => {
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
          return { ...product, imageUrl: null };
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

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="text-center" style={{ padding: "18rem" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <h2 className="text-center" style={{ padding: "18rem" }}>
        <img src={unplugged} alt="Error" style={{ width: '100px', height: '100px' }}/>
        <p>{error}</p>
      </h2>
    );
  }

  return (
    <>
      <div style={{ marginTop: "80px", padding: "20px" }}>
        {/* Filters and Sorting */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div className="d-flex align-items-center gap-3">
            <label htmlFor="pageSize" className="form-label mb-0">
              Items per page:
            </label>
            <select
              id="pageSize"
              className="form-select"
              style={{ width: "auto" }}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <label htmlFor="sortBy" className="form-label mb-0">
              Sort by:
            </label>
            <select
              id="sortBy"
              className="form-select"
              style={{ width: "auto" }}
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

        <div className="mb-3">
          <p className="text-muted">
            Showing {filteredProducts.length} of {totalElements} products
            {currentPage > 0 && ` (Page ${currentPage + 1} of ${totalPages})`}
          </p>
        </div>

        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {filteredProducts.length === 0 ? (
            <h2
              className="text-center"
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              No Products Available
            </h2>
          ) : (
            filteredProducts.map((product) => {
            const { id, brand, name, price, productAvailable, imageUrl } =
              product;
            const cardStyle = {
              width: "18rem",
              height: "12rem",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 2px 3px",
              backgroundColor: productAvailable ? "#fff" : "#ccc",
            };
            return (
              <div
                className="card mb-3"
                style={{
                  width: "250px",
                  height: "360px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  overflow: "hidden", 
                  backgroundColor: productAvailable ? "#fff" : "#ccc",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent:'flex-start',
                  alignItems:'stretch'
                }}
                key={id}
              >
                <Link
                  to={`/product/${id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "150px", 
                      objectFit: "cover",  
                      padding: "5px",
                      margin: "0",
                      borderRadius: "10px 10px 10px 10px", 
                    }}
                  />
                  <div
                    className="card-body"
                    style={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "10px",
                    }}
                  >
                    <div>
                      <h5
                        className="card-title"
                        style={{ margin: "0 0 10px 0", fontSize: "1.2rem" }}
                      >
                        {name.toUpperCase()}
                      </h5>
                      <i
                        className="card-brand"
                        style={{ fontStyle: "italic", fontSize: "0.8rem" }}
                      >
                        {"~ " + brand}
                      </i>
                    </div>
                    <hr className="hr-line" style={{ margin: "10px 0" }} />
                    <div className="home-cart-price">
                      <h5
                        className="card-text"
                        style={{ fontWeight: "600", fontSize: "1.1rem",marginBottom:'5px' }}
                      >
                        <i class="bi bi-currency-rupee"></i>
                        {price}
                      </h5>
                    </div>
                    <button
                      className="btn-hover color-9"
                      style={{margin:'10px 25px 0px '  }}
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      disabled={!productAvailable}
                    >
                      {productAvailable ? "Add to Cart" : "Out of Stock"}
                    </button> 
                  </div>
                </Link>
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
