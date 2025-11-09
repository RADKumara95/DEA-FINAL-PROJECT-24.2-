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
      console.log("Cart", cart);
      try {
        const response = await API.get("/products");
        const backendProducts = response.data;
        const backendProductIds = backendProducts.map((product) => product.id);

        const updatedCartItems = cart.filter((item) => backendProductIds.includes(item.id));
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
              console.error("Error fetching image:", error);
              return {
                ...item,
                imageUrl: "placeholder-image-url",
                stockQuantity: item.stockQuantity || 0,
              };
            }
          })
        );
        console.log("cart", cart);
        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (cart.length) {
      fetchImagesAndUpdateCart();
    } else {
      setCartItems([]);
      setStockErrors([]);
    }
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
      // Fetch latest product data to ensure we have current stock
      const response = await API.get("/products");
      const backendProducts = response.data;

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
    <div className="cart-container">
      <div className="shopping-cart">
        <div className="title">Shopping Bag</div>
        {cartItems.length === 0 ? (
          <div className="empty" style={{ textAlign: "left", padding: "2rem" }}>
            <h4>Your cart is empty</h4>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div
                  className="item"
                  style={{ display: "flex", alignContent: "center" }}
                  key={item.id}
                >
                 
                  <div>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </div>
                  <div className="description">
                    <span>{item.brand}</span>
                    <span>{item.name}</span>
                  </div>

                  <div className="quantity">
                    <button
                      className="plus-btn"
                      type="button"
                      name="button"
                      onClick={() => handleIncreaseQuantity(item.id)}
                    >
                      <i className="bi bi-plus-square-fill"></i>
                    </button>
                    <input
                      type="button"
                      name="name"
                      value={item.quantity}
                      readOnly
                    />
                    <button
                      className="minus-btn"
                      type="button"
                      name="button"
                      onClick={() => handleDecreaseQuantity(item.id)}
                    >
                      <i className="bi bi-dash-square-fill"></i>
                    </button>
                  </div>

                  <div className="total-price " style={{ textAlign: "center" }}>
                    ${item.price * item.quantity}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </div>
              </li>
            ))}
            <div className="total">Total: ${totalPrice.toFixed(2)}</div>
            
            {/* Stock Validation Errors */}
            {stockErrors.length > 0 && (
              <div className="alert alert-danger mt-3" role="alert">
                <strong>Stock Availability Issues:</strong>
                <ul className="mb-0 mt-2">
                  {stockErrors.map((error, index) => (
                    <li key={index}>
                      {error.productName && (
                        <strong>{error.productName}:</strong>
                      )}{" "}
                      {error.message}
                      {error.availableStock !== undefined && (
                        <button
                          className="btn btn-sm btn-outline-primary ms-2"
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
            )}

            {/* Stock Warnings */}
            {cartItems.some(
              (item) => item.stockQuantity <= item.quantity && item.stockQuantity > 0
            ) && stockErrors.length === 0 && (
              <div className="alert alert-warning mt-3" role="alert">
                <strong>⚠️ Low Stock Warning:</strong> Some items in your cart
                have limited availability. Please proceed to checkout soon.
              </div>
            )}

            {/* Proceed to Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              className="btn btn-primary"
              style={{ width: "100%", display: "block", textAlign: "center" }}
              disabled={validatingStock || cartItems.length === 0}
            >
              {validatingStock ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Validating Stock...
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
