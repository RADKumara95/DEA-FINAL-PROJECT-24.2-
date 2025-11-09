import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useOrder } from "../Context/OrderContext";
import API from "../axios";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cancelOrder } = useOrder();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [orderItemsWithImages, setOrderItemsWithImages] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderDetails();
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (order && order.items) {
      fetchProductImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch order details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async () => {
    if (!order || !order.items) return;

    try {
      const itemsWithImages = await Promise.all(
        order.items.map(async (item) => {
          try {
            const imageResponse = await API.get(
              `/product/${item.productId}/image`,
              { responseType: "blob" }
            );
            const imageUrl = URL.createObjectURL(imageResponse.data);
            return { ...item, imageUrl };
          } catch (error) {
            console.error(
              `Error fetching image for product ${item.productId}:`,
              error
            );
            return { ...item, imageUrl: null };
          }
        })
      );
      setOrderItemsWithImages(itemsWithImages);
    } catch (error) {
      console.error("Error fetching product images:", error);
      setOrderItemsWithImages(order.items.map((item) => ({ ...item, imageUrl: null })));
    }
  };

  const handleCancelOrder = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelOrder(id);
      if (result.success) {
        await fetchOrderDetails();
      } else {
        setError(result.error || "Failed to cancel order");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await API.get(`/reports/invoice/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      setError(err.response?.data?.message || 'Failed to download invoice');
    }
  };

  const canCancel =
    order &&
    (order.status === "PENDING" || order.status === "CONFIRMED");

  const getStatusTimeline = () => {
    if (!order) return [];

    const statuses = [
      { status: "PENDING", label: "Order Placed", icon: "📝" },
      { status: "CONFIRMED", label: "Order Confirmed", icon: "✓" },
      { status: "PROCESSING", label: "Processing", icon: "⚙️" },
      { status: "SHIPPED", label: "Shipped", icon: "🚚" },
      { status: "DELIVERED", label: "Delivered", icon: "📦" },
      { status: "CANCELLED", label: "Cancelled", icon: "❌" },
    ];

    const currentStatusIndex = statuses.findIndex(
      (s) => s.status === order.status
    );

    return statuses.map((statusItem, index) => {
      let state = "pending";
      if (order.status === "CANCELLED" && statusItem.status === "CANCELLED") {
        state = "active";
      } else if (order.status === "CANCELLED") {
        state = "cancelled";
      } else if (index < currentStatusIndex) {
        state = "completed";
      } else if (index === currentStatusIndex) {
        state = "active";
      }

      return { ...statusItem, state };
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPaymentMethod = (method) => {
    if (!method) return "N/A";
    return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      PENDING: "bg-warning text-dark",
      CONFIRMED: "bg-info text-white",
      PROCESSING: "bg-primary text-white",
      SHIPPED: "bg-secondary text-white",
      DELIVERED: "bg-success text-white",
      CANCELLED: "bg-danger text-white",
    };
    return statusClasses[status] || "bg-secondary text-white";
  };

  const getPaymentStatusBadgeClass = (status) => {
    const statusClasses = {
      PENDING: "bg-warning text-dark",
      PAID: "bg-success text-white",
      FAILED: "bg-danger text-white",
      REFUNDED: "bg-info text-white",
    };
    return statusClasses[status] || "bg-secondary text-white";
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please login to view order details.
        </div>
        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || "Order not found"}</div>
        <Link to="/orders" className="btn btn-primary">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const timeline = getStatusTimeline();
  const itemsToDisplay =
    orderItemsWithImages.length > 0 ? orderItemsWithImages : order.items || [];

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/orders" className="btn btn-outline-secondary">
          ← Back to Orders
        </Link>
        <div>
          {canCancel && (
            <button
              className="btn btn-danger me-2"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </button>
          )}
          <button
            className="btn btn-outline-primary"
            onClick={handleDownloadInvoice}
            title="Coming soon"
          >
            📄 Download Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Order #{order.id}</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Order Date:</strong> {formatDate(order.orderDate)}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong>{" "}
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>Payment Status:</strong>{" "}
                    <span
                      className={`badge ${getPaymentStatusBadgeClass(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Payment Method:</strong>{" "}
                    {formatPaymentMethod(order.paymentMethod)}
                  </p>
                  {order.deliveryDate && (
                    <p className="mb-2">
                      <strong>Delivery Date:</strong>{" "}
                      {formatDate(order.deliveryDate)}
                    </p>
                  )}
                  <p className="mb-2">
                    <strong>Total Amount:</strong>{" "}
                    <span className="text-primary fs-4 fw-bold">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Order Status Timeline */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Status Timeline</h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                {timeline.map((item, index) => (
                  <div
                    key={item.status}
                    className={`timeline-item ${
                      item.state === "completed"
                        ? "completed"
                        : item.state === "active"
                        ? "active"
                        : item.state === "cancelled"
                        ? "cancelled"
                        : ""
                    }`}
                  >
                    <div className="timeline-marker">
                      <span className="timeline-icon">{item.icon}</span>
                    </div>
                    <div className="timeline-content">
                      <h6 className="mb-1">{item.label}</h6>
                      {item.state === "active" && (
                        <small className="text-muted">Current Status</small>
                      )}
                      {item.state === "completed" && (
                        <small className="text-success">✓ Completed</small>
                      )}
                      {item.state === "cancelled" && item.status === "CANCELLED" && (
                        <small className="text-danger">Order Cancelled</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Items</h5>
            </div>
            <div className="card-body">
              {itemsToDisplay.length === 0 ? (
                <p className="text-muted">No items found in this order.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "100px" }}>Image</th>
                        <th>Product</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsToDisplay.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="img-thumbnail"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                }}
                              >
                                <span className="text-muted">No Image</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>{item.productName}</strong>
                            <br />
                            <small className="text-muted">
                              Product ID: {item.productId}
                            </small>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="text-end">
                            ${parseFloat(item.priceAtOrder || 0).toFixed(2)}
                          </td>
                          <td className="text-end fw-bold">
                            ${parseFloat(item.subtotal || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th colSpan="4" className="text-end">
                          Total Amount:
                        </th>
                        <th className="text-end text-primary fs-5">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Shipping & Billing Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted mb-2">Shipping Address</h6>
                  <p className="mb-0">{order.shippingAddress}</p>
                </div>
                {order.billingAddress &&
                  order.billingAddress !== order.shippingAddress && (
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted mb-2">Billing Address</h6>
                      <p className="mb-0">{order.billingAddress}</p>
                    </div>
                  )}
              </div>
              <hr />
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Phone Number:</strong> {order.phoneNumber}
                  </p>
                </div>
                {order.notes && (
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Order Notes:</strong>
                    </p>
                    <p className="text-muted">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-primary fs-5">
                  ${parseFloat(order.totalAmount).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              {canCancel && (
                <button
                  className="btn btn-danger w-100 mb-2"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Order"
                  )}
                </button>
              )}
              <button
                className="btn btn-outline-primary w-100 mb-2"
                onClick={handleDownloadInvoice}
                title="Coming soon"
              >
                📄 Download Invoice
              </button>
              <Link to="/orders" className="btn btn-outline-secondary w-100">
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

