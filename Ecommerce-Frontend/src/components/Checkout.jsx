import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import AppContext from "../Context/Context";
import { useOrder } from "../Context/OrderContext";
import API from "../axios";

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useContext(AppContext);
  const { createOrder } = useOrder();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shippingAddress: "",
    billingAddress: "",
    phoneNumber: "",
    notes: "",
    paymentMethod: "CASH_ON_DELIVERY",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      navigate("/cart");
      return;
    }

    // Fetch cart items with images
    const fetchCartItems = async () => {
      try {
        const response = await API.get("/products");
        const backendProductIds = response.data.map((product) => product.id);
        const updatedCartItems = cart.filter((item) =>
          backendProductIds.includes(item.id)
        );
        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            try {
              const imageResponse = await API.get(`/product/${item.id}/image`, {
                responseType: "blob",
              });
              const imageUrl = URL.createObjectURL(imageResponse.data);
              return { ...item, imageUrl };
            } catch (error) {
              console.error("Error fetching image:", error);
              return { ...item, imageUrl: null };
            }
          })
        );
        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("Error fetching product data:", error);
        setCartItems(cart);
      }
    };

    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, cart.length]);

  if (!isAuthenticated || cart.length === 0) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate shipping address
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
    } else if (formData.shippingAddress.trim().length < 10) {
      newErrors.shippingAddress =
        "Shipping address must be at least 10 characters";
    }

    // Validate billing address (optional, but if provided, must be valid)
    if (
      formData.billingAddress.trim() &&
      formData.billingAddress.trim().length < 10
    ) {
      newErrors.billingAddress =
        "Billing address must be at least 10 characters if provided";
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      // Allow various phone number formats
      const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
      const digitsOnly = formData.phoneNumber.replace(/\D/g, "");
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      } else if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        newErrors.phoneNumber =
          "Phone number must be between 10 and 15 digits";
      }
    }

    // Validate payment method
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: formData.shippingAddress.trim(),
        billingAddress:
          formData.billingAddress.trim() || formData.shippingAddress.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        notes: formData.notes.trim() || null,
        paymentMethod: formData.paymentMethod,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        clearCart();
        navigate(`/orders/${result.data.id}`);
      } else {
        setErrors({
          general: result.error || "Failed to create order",
        });
      }
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.message ||
          error.message ||
          "Failed to create order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/cart")}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cart
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order information to proceed</p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm font-medium">{errors.general}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping & Payment Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Address */}
                <div>
                  <label htmlFor="shippingAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                    Shipping Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 placeholder-gray-400 text-gray-900 resize-none ${
                      errors.shippingAddress 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    id="shippingAddress"
                    name="shippingAddress"
                    rows="4"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    placeholder="Enter your complete shipping address"
                    required
                  />
                  {errors.shippingAddress && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.shippingAddress}
                    </p>
                  )}
                </div>

                {/* Billing Address */}
                <div>
                  <label htmlFor="billingAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                    Billing Address
                    <span className="text-gray-500 font-normal ml-2">(Leave blank to use shipping address)</span>
                  </label>
                  <textarea
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 placeholder-gray-400 text-gray-900 resize-none ${
                      errors.billingAddress 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    id="billingAddress"
                    name="billingAddress"
                    rows="4"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    placeholder="Enter your billing address (optional)"
                  />
                  {errors.billingAddress && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.billingAddress}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 placeholder-gray-400 text-gray-900 ${
                      errors.phoneNumber 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phoneNumber}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a valid phone number (10-15 digits)
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-gray-900 ${
                      errors.paymentMethod 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* Order Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Notes 
                    <span className="text-gray-500 font-normal ml-2">(Optional)</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 resize-none"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions or notes for your order"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-md text-lg"
                >
                  <span className="flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Place Order
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h3>

              {cartItems.length === 0 && cart.length > 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-500">Loading cart items...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg shadow-sm"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-blue-600">
                            ${(parseFloat(item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total:</span>
                        <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        {cart.length} item{cart.length !== 1 ? "s" : ""} in your order
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

