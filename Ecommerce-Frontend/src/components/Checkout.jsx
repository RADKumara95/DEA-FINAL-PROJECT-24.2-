import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import AppContext from "../Context/Context";
import API from "../axios";

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useContext(AppContext);
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

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress || formData.shippingAddress,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
      };

      const response = await API.post("/orders", orderData);
      clearCart();
      navigate(`/orders/${response.data.id}`);
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Failed to create order",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">Checkout</h2>
              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="shippingAddress" className="form-label">
                    Shipping Address *
                  </label>
                  <textarea
                    className={`form-control ${errors.shippingAddress ? "is-invalid" : ""}`}
                    id="shippingAddress"
                    name="shippingAddress"
                    rows="3"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                  />
                  {errors.shippingAddress && (
                    <div className="invalid-feedback">{errors.shippingAddress}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="billingAddress" className="form-label">
                    Billing Address
                  </label>
                  <textarea
                    className="form-control"
                    id="billingAddress"
                    name="billingAddress"
                    rows="3"
                    value={formData.billingAddress}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  {errors.phoneNumber && (
                    <div className="invalid-feedback">{errors.phoneNumber}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="paymentMethod" className="form-label">
                    Payment Method *
                  </label>
                  <select
                    className="form-select"
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || cart.length === 0}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              {cart.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong>${totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

