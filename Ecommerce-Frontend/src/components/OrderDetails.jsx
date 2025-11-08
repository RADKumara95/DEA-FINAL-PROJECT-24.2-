import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderDetails();
    }
  }, [id, isAuthenticated]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await API.put(`/orders/${id}/cancel`);
      fetchOrderDetails();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const canCancel = order && (order.status === "PENDING" || order.status === "CONFIRMED");

  if (!isAuthenticated) {
    return <div className="container mt-5">Please login to view order details.</div>;
  }

  if (loading) {
    return <div className="container mt-5">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || "Order not found"}</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Link to="/orders" className="btn btn-secondary mb-3">
        ← Back to Orders
      </Link>
      <h2 className="mb-4">Order Details #{order.id}</h2>
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Order Information</h5>
              <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className={`badge bg-${order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "danger" : "warning"}`}>{order.status}</span></p>
              <p><strong>Payment Status:</strong> <span className={`badge bg-${order.paymentStatus === "PAID" ? "success" : "warning"}`}>{order.paymentStatus}</span></p>
              <p><strong>Payment Method:</strong> {order.paymentMethod?.replace(/_/g, " ")}</p>
              {order.deliveryDate && (
                <p><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Shipping Information</h5>
              <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
              {order.billingAddress && (
                <p><strong>Billing Address:</strong> {order.billingAddress}</p>
              )}
              <p><strong>Phone:</strong> {order.phoneNumber}</p>
              {order.notes && (
                <p><strong>Notes:</strong> {order.notes}</p>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Order Items</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${parseFloat(item.priceAtOrder).toFixed(2)}</td>
                      <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3">Total:</th>
                    <th>${parseFloat(order.totalAmount).toFixed(2)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Actions</h5>
              {canCancel && (
                <button
                  className="btn btn-danger w-100 mb-2"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

