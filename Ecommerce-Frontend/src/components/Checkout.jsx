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
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Checkout</h2>
      {errors.general && (
        <div className="alert alert-danger" role="alert">
          {errors.general}
        </div>
      )}
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">Shipping & Payment Information</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="shippingAddress" className="form-label">
                    Shipping Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${
                      errors.shippingAddress ? "is-invalid" : ""
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
                    <div className="invalid-feedback">
                      {errors.shippingAddress}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="billingAddress" className="form-label">
                    Billing Address
                    <small className="text-muted"> (Leave blank to use shipping address)</small>
                  </label>
                  <textarea
                    className={`form-control ${
                      errors.billingAddress ? "is-invalid" : ""
                    }`}
                    id="billingAddress"
                    name="billingAddress"
                    rows="4"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    placeholder="Enter your billing address (optional)"
                  />
                  {errors.billingAddress && (
                    <div className="invalid-feedback">
                      {errors.billingAddress}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${
                      errors.phoneNumber ? "is-invalid" : ""
                    }`}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                  {errors.phoneNumber && (
                    <div className="invalid-feedback">{errors.phoneNumber}</div>
                  )}
                  <small className="form-text text-muted">
                    Enter a valid phone number (10-15 digits)
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="paymentMethod" className="form-label">
                    Payment Method <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${
                      errors.paymentMethod ? "is-invalid" : ""
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
                    <div className="invalid-feedback">
                      {errors.paymentMethod}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">
                    Order Notes <small className="text-muted">(Optional)</small>
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions or notes for your order"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={loading || cart.length === 0}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card sticky-top" style={{ top: "20px" }}>
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              {cartItems.length === 0 && cart.length > 0 ? (
                <div className="text-muted">Loading cart items...</div>
              ) : (
                <>
                  <div className="mb-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex align-items-center mb-3 pb-3 border-bottom"
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="me-3"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{item.name}</div>
                          <small className="text-muted">
                            Quantity: {item.quantity}
                          </small>
                          <div className="mt-1">
                            <strong>
                              $
                              {(
                                parseFloat(item.price || 0) *
                                (item.quantity || 0)
                              ).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Shipping:</span>
                    <span className="text-success">Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="fs-5">Total:</strong>
                    <strong className="fs-5 text-primary">
                      ${totalAmount.toFixed(2)}
                    </strong>
                  </div>
                  <div className="mt-3">
                    <small className="text-muted">
                      {cart.length} item{cart.length !== 1 ? "s" : ""} in your
                      order
                    </small>
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

