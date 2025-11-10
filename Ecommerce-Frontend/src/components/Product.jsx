import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useState } from "react";
import AppContext from "../Context/Context";
import axios from "../axios";
import UpdateProduct from "./UpdateProduct";

const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, cart, refreshData } =
    useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/product/${id}`
        );
        setProduct(response.data);
        if (response.data.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchImage = async () => {
      const response = await axios.get(
        `http://localhost:8080/api/product/${id}/image`,
        { responseType: "blob" }
      );
      setImageUrl(URL.createObjectURL(response.data));
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/product/${id}`);
      removeFromCart(id);
      console.log("Product deleted successfully");
      alert("Product deleted successfully");
      refreshData();
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handlAddToCart = () => {
    addToCart(product);
    alert("Product added to cart!");
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Getting product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Image Section */}
            <div className="aspect-w-1 aspect-h-1 bg-gray-100 overflow-hidden lg:aspect-w-3 lg:aspect-h-4">
              <img
                className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                src={imageUrl}
                alt={product.imageName}
              />
            </div>

            {/* Product Details Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              {/* Header Info */}
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {product.category}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">Listed</p>
                  <p className="text-sm text-gray-700 italic">
                    {new Date(product.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Product Title and Brand */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 capitalize tracking-wide">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 italic font-medium">
                  {product.brand}
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Product Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.description}
                </p>
              </div>

              {/* Price and Add to Cart */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Stock Available</p>
                    <p className="text-lg font-bold text-green-600">
                      {product.stockQuantity} units
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlAddToCart}
                  disabled={!product.productAvailable}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] ${
                    product.productAvailable
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {product.productAvailable ? (
                      <>
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m1.5 6h10m-10 0v6a1 1 0 001 1h8a1 1 0 001-1v-6" />
                        </svg>
                        Add to Cart
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Out of Stock
                      </>
                    )}
                  </span>
                </button>

                {/* Admin Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleEditClick}
                    className="flex items-center justify-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Product
                  </button>

                  <button
                    onClick={deleteProduct}
                    className="flex items-center justify-center py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;