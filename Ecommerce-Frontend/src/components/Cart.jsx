// import React, { useContext, useState, useEffect } from "react";
// // import axios from '../axios';
// import AppContext from "../Context/Context";
// import axios from "axios";
// import CheckoutPopup from "./CheckoutPopup";
// import { Button } from "react-bootstrap";
// const Cart = () => {
//   const { cart, removeFromCart } = useContext(AppContext);
//   const [cartItems, setCartItems] = useState([]);
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [cartImage, setCartImage] =useState([])
//   const [showModal, setShowModal] = useState(false);
  
//   // useEffect(() => {
//   //   const fetchImagesAndUpdateCart = async () => {
//   //     console.log("Cart", cart);
//   //     const updatedCartItems = await Promise.all(
//   //       cart.map(async (item) => {
//   //         console.log("ITEM",item)
//   //         try {
//   //           const response = await axios.get(
//   //             `http://localhost:8080/api/product/${item.id}/image`,
//   //             { responseType: "blob" }
//   //           );
//             // const imageFile = await converUrlToFile(response.data,response.data.imageName)
//   //           setCartImage(imageFile);
//   //           const imageUrl = URL.createObjectURL(response.data);
//   //           return { ...item, imageUrl, available: true };
//   //         } catch (error) {
//   //           console.error("Error fetching image:", error);
//   //           return { ...item, imageUrl: "placeholder-image-url", available: false };
//   //         }
//   //       })
//   //     );
//   //     const filteredCartItems = updatedCartItems.filter((item) => item.available);
//   //     setCartItems(updatedCartItems);
     
//   //   };

//   //   if (cart.length) {
//   //     fetchImagesAndUpdateCart();
//   //   }
//   // }, [cart]);

//   useEffect(() => {
//     const fetchImagesAndUpdateCart = async () => {
//       try {
    
//         const response = await axios.get("http://localhost:8080/api/products");
//         const backendProductIds = response.data.map((product) => product.id);

//         const updatedCartItems = cart.filter((item) => backendProductIds.includes(item.id));
//         const cartItemsWithImages = await Promise.all(
//           updatedCartItems.map(async (item) => {
//             try {
//               const response = await axios.get(
//                 `http://localhost:8080/api/product/${item.id}/image`,
//                 { responseType: "blob" }
//               );
//               const imageFile = await converUrlToFile(response.data, response.data.imageName);
//               setCartImage(imageFile)
//               const imageUrl = URL.createObjectURL(response.data);
//               return { ...item, imageUrl };
//             } catch (error) {
//               console.error("Error fetching image:", error);
//               return { ...item, imageUrl: "placeholder-image-url" };
//             }
//           })
//         );

//         setCartItems(cartItemsWithImages);
//       } catch (error) {
//         console.error("Error fetching product data:", error);
    
//       }
//     };

//     if (cart.length) {
//       fetchImagesAndUpdateCart();
//     }
//   }, [cart]);
  


//   useEffect(() => {
//     console.log("CartItems", cartItems);
//   }, [cartItems]);
//   const converUrlToFile = async(blobData, fileName) => {
//     const file = new File([blobData], fileName, { type: blobData.type });
//     return file;
//   }
//   useEffect(() => {
//     const total = cartItems.reduce(
//       (acc, item) => acc + item.price * item.quantity,
//       0
//     );
//     setTotalPrice(total);
//   }, [cartItems]);

 
//   const handleIncreaseQuantity = (itemId) => {
//     const newCartItems = cartItems.map((item) =>
//       item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
//     );
//     setCartItems(newCartItems);
//   };
//   const handleDecreaseQuantity = (itemId) => {
//     const newCartItems = cartItems.map((item) =>
//       item.id === itemId
//         ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
//         : item
//     );
//     setCartItems(newCartItems);
//   };

//   const handleRemoveFromCart = (itemId) => {
//     removeFromCart(itemId);
//     const newCartItems = cartItems.filter((item) => item.id !== itemId);
//     setCartItems(newCartItems);
//   };

//   const handleCheckout = async () => {
//     try {
//       for (const item of cartItems) {
//         const { imageUrl, imageName, imageData, imageType, quantity, ...rest } = item;
//         const updatedStockQuantity = item.stockQuantity - item.quantity;
  
//         const updatedProductData = { ...rest, stockQuantity: updatedStockQuantity };
//         console.log("updated product data", updatedProductData)
  
//         const cartProduct = new FormData();
//         cartProduct.append("imageFile", cartImage);
//         cartProduct.append(
//           "product",
//           new Blob([JSON.stringify(updatedProductData)], { type: "application/json" })
//         );
  
//         await axios
//           .put(`http://localhost:8080/api/product/${item.id}`, cartProduct, {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           })
//           .then((response) => {
//             console.log("Product updated successfully:", (cartProduct));
            
//           })
//           .catch((error) => {
//             console.error("Error updating product:", error);
//           });
//       }
//       setCartItems([]);
//       setShowModal(false);
//     } catch (error) {
//       console.log("error during checkout", error);
//     }
//   };
  
//   return (
//     <div className="cart-container">
//       <div className="shopping-cart">
//         <div className="title">Shopping Bag</div>
//         {cartItems.length === 0 ? (
//           <div className="empty" style={{ textAlign: "left", padding: "2rem" }}>
//             <h4>Your cart is empty</h4>
//           </div>
//         ) : (
//           <>
//             {cartItems.map((item) => (
//               <li key={item.id} className="cart-item">
//                 <div
//                   className="item"
//                   style={{ display: "flex", alignContent: "center" }}
//                   key={item.id}
//                 >
//                   <div className="buttons">
//                     <div className="buttons-liked">
//                       <i className="bi bi-heart"></i>
//                     </div>
//                   </div>
//                   <div>
//                     <img
//                       // src={cartImage ? URL.createObjectURL(cartImage) : "Image unavailable"}
//                       src={item.imageUrl}
//                       alt={item.name}
//                       className="cart-item-image"
//                     />
//                   </div>
//                   <div className="description">
//                     <span>{item.brand}</span>
//                     <span>{item.name}</span>
//                   </div>

//                   <div className="quantity">
//                     <button
//                       className="plus-btn"
//                       type="button"
//                       name="button"
//                       onClick={() => handleIncreaseQuantity(item.id)}
//                     >
//                       <i className="bi bi-plus-square-fill"></i>
//                     </button>
//                     <input
//                       type="button"
//                       name="name"
//                       value={item.quantity}
//                       readOnly
//                     />
//                     <button
//                       className="minus-btn"
//                       type="button"
//                       name="button"
//                       // style={{ backgroundColor: "white" }}
//                       onClick={() => handleDecreaseQuantity(item.id)}
//                     >
//                       <i className="bi bi-dash-square-fill"></i>
//                     </button>
//                   </div>

//                   <div className="total-price " style={{ textAlign: "center" }}>
//                     ${item.price * item.quantity}
//                   </div>
//                   <button
//                     className="remove-btn"
//                     onClick={() => handleRemoveFromCart(item.id)}
//                   >
//                     <i className="bi bi-trash3-fill"></i>
//                   </button>
//                 </div>
//               </li>
//             ))}
//             <div className="total">Total: ${totalPrice}</div>
//             <button
//               className="btn btn-primary"
//               style={{ width: "100%" }}
//               onClick={handleCheckout}
//             >
//               Checkout
//             </button>
//           </>
//         )}
//       </div>
//       <CheckoutPopup
//         show={showModal}
//         handleClose={() => setShowModal(false)}
//         cartItems={cartItems}
//         totalPrice={totalPrice}
//         handleCheckout={handleCheckout}
//       />
//     </div>

//   );
// };

// export default Cart;





import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import AppContext from "../Context/Context";
import API from "../axios";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  console.log("🛒 Cart component - cart from context:", cart);
  console.log("🛒 Cart component - localStorage cart:", localStorage.getItem('cart'));
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartImage, setCartImage] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const [validatingStock, setValidatingStock] = useState(false);

  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      console.log("🛒 Cart useEffect - cart length:", cart.length);
      console.log("🛒 Cart useEffect - cart items:", cart);
      
      if (cart.length === 0) {
        setCartItems([]);
        setStockErrors([]);
        return;
      }

      try {
        // Fetch product data for validation (using pagination to get all products)
        const response = await API.get("/products?page=0&size=1000");
        const backendProducts = response.data.content || response.data || [];
        const backendProductIds = backendProducts.map((product) => product.id);

        const updatedCartItems = cart.filter((item) => backendProductIds.includes(item.id));
        
        console.log("🛒 Filtered cart items:", updatedCartItems.length);
        
        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            try {
              // Get latest product data including stock
              const productData = backendProducts.find((p) => p.id === item.id);
              const response = await API.get(
                `/product/${item.id}/image`,
                { responseType: "blob" }
              );
              const imageFile = await converUrlToFile(response.data, response.data.imageName);
              setCartImage(imageFile);
              const imageUrl = URL.createObjectURL(response.data);
              return {
                ...item,
                imageUrl,
                stockQuantity: productData?.stockQuantity || item.stockQuantity || 0,
                productAvailable: productData?.productAvailable !== undefined
                  ? productData.productAvailable
                  : item.productAvailable !== undefined
                  ? item.productAvailable
                  : true,
              };
            } catch (error) {
              console.error("🛒 Error fetching image for product:", item.id, error);
              return {
                ...item,
                imageUrl: "placeholder-image-url",
                stockQuantity: item.stockQuantity || 0,
              };
            }
          })
        );
        
        console.log("🛒 Cart items with images:", cartItemsWithImages.length);
        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("🛒 Error fetching product data:", error);
      }
    };

    fetchImagesAndUpdateCart();
  }, [cart]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const converUrlToFile = async (blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  }

  const handleIncreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        if (item.quantity < item.stockQuantity) {
          const updatedItem = { ...item, quantity: item.quantity + 1 };
          // Update cart context
          const updatedCart = cart.map((cartItem) =>
            cartItem.id === itemId
              ? { ...cartItem, quantity: updatedItem.quantity }
              : cartItem
          );
          localStorage.setItem("cart", JSON.stringify(updatedCart));
          return updatedItem;
        } else {
          alert("Cannot add more than available stock");
        }
      }
      return item;
    });
    setCartItems(newCartItems);
    setStockErrors([]); // Clear errors when quantity changes
  };

  const handleDecreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        const newQuantity = Math.max(item.quantity - 1, 1);
        const updatedItem = { ...item, quantity: newQuantity };
        // Update cart context
        const updatedCart = cart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedItem;
      }
      return item;
    });
    setCartItems(newCartItems);
    setStockErrors([]); // Clear errors when quantity changes
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newCartItems);
    setStockErrors([]);
  };

  const validateStockAvailability = async () => {
    setValidatingStock(true);
    setStockErrors([]);
    const errors = [];

    try {
      // Fetch latest product data to ensure we have current stock (get all products)
      const response = await API.get("/products?page=0&size=1000");
      const backendProducts = response.data.content || response.data || [];
      console.log("🔍 Validating stock for cart items:", cartItems.length);
      console.log("🔍 Backend products fetched:", backendProducts.length);

      for (const cartItem of cartItems) {
        const product = backendProducts.find((p) => p.id === cartItem.id);
        
        if (!product) {
          errors.push({
            productId: cartItem.id,
            productName: cartItem.name,
            message: "Product no longer available",
          });
          continue;
        }

        if (!product.productAvailable) {
          errors.push({
            productId: cartItem.id,
            productName: cartItem.name,
            message: "Product is currently unavailable",
          });
          continue;
        }

        if (product.stockQuantity < cartItem.quantity) {
          errors.push({
            productId: cartItem.id,
            productName: cartItem.name,
            message: `Insufficient stock. Available: ${product.stockQuantity}, Requested: ${cartItem.quantity}`,
            availableStock: product.stockQuantity,
            requestedQuantity: cartItem.quantity,
          });
        }
      }

      if (errors.length > 0) {
        setStockErrors(errors);
        setValidatingStock(false);
        return false;
      }

      setValidatingStock(false);
      return true;
    } catch (error) {
      console.error("Error validating stock:", error);
      setStockErrors([
        {
          message: "Failed to validate stock availability. Please try again.",
        },
      ]);
      setValidatingStock(false);
      return false;
    }
  };

  const handleProceedToCheckout = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const isValid = await validateStockAvailability();
    if (isValid) {
      navigate("/checkout");
    }
  };

  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const { imageUrl, imageName, imageData, imageType, quantity, ...rest } = item;
        const updatedStockQuantity = item.stockQuantity - item.quantity;
  
        const updatedProductData = { ...rest, stockQuantity: updatedStockQuantity };
        console.log("updated product data", updatedProductData)
  
        const cartProduct = new FormData();
        cartProduct.append("imageFile", cartImage);
        cartProduct.append(
          "product",
          new Blob([JSON.stringify(updatedProductData)], { type: "application/json" })
        );
  
        await axios
          .put(`http://localhost:8080/api/product/${item.id}`, cartProduct, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            console.log("Product updated successfully:", (cartProduct));
          })
          .catch((error) => {
            console.error("Error updating product:", error);
          });
      }
      clearCart();
      setCartItems([]);
      setShowModal(false);
    } catch (error) {
      console.log("error during checkout", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
              Shopping Cart
              <span className="ml-3 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>

          <div className="p-8">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h3>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link 
                  to="/" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-6 mb-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center space-x-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg shadow-sm"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600 italic">{item.brand}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Stock: <span className="font-medium text-green-600">{item.stockQuantity} available</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                ${item.price} each
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleDecreaseQuantity(item.id)}
                            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 min-w-[60px] text-center">
                            <span className="font-semibold text-gray-900">{item.quantity}</span>
                          </div>
                          <button
                            onClick={() => handleIncreaseQuantity(item.id)}
                            disabled={item.quantity >= item.stockQuantity}
                            className="w-10 h-10 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5 text-blue-600 disabled:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Section */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-bold text-gray-900">Total:</span>
                    <span className="text-3xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Stock Validation Errors */}
                  {stockErrors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-red-800 font-semibold mb-2">Stock Availability Issues:</h4>
                          <ul className="space-y-2">
                            {stockErrors.map((error, index) => (
                              <li key={index} className="text-red-700">
                                {error.productName && (
                                  <span className="font-medium">{error.productName}:</span>
                                )}{" "}
                                {error.message}
                                {error.availableStock !== undefined && (
                                  <button
                                    className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors duration-200"
                                    onClick={() => {
                                      const item = cartItems.find(
                                        (i) => i.id === error.productId
                                      );
                                      if (item) {
                                        const newCartItems = cartItems.map((cartItem) =>
                                          cartItem.id === error.productId
                                            ? {
                                                ...cartItem,
                                                quantity: error.availableStock,
                                              }
                                            : cartItem
                                        );
                                        setCartItems(newCartItems);
                                        // Update cart context
                                        const updatedCart = cart.map((cartItem) =>
                                          cartItem.id === error.productId
                                            ? { ...cartItem, quantity: error.availableStock }
                                            : cartItem
                                        );
                                        localStorage.setItem(
                                          "cart",
                                          JSON.stringify(updatedCart)
                                        );
                                        setStockErrors([]);
                                      }
                                    }}
                                  >
                                    Update to {error.availableStock}
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stock Warnings */}
                  {cartItems.some(
                    (item) => item.stockQuantity <= item.quantity && item.stockQuantity > 0
                  ) && stockErrors.length === 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-amber-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-amber-800 font-semibold">⚠️ Low Stock Warning</h4>
                          <p className="text-amber-700 text-sm">Some items in your cart have limited availability. Please proceed to checkout soon.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={validatingStock || cartItems.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-md"
                  >
                    <span className="flex items-center justify-center">
                      {validatingStock ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Validating Stock...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Proceed to Checkout
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
