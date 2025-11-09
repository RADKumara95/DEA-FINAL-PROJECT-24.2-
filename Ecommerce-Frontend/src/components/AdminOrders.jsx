import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

const AdminOrders = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [deletingOrder, setDeletingOrder] = useState(null);
  const pageSize = 10;

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isSeller = user?.roles?.includes("ROLE_SELLER");
  const isAdminOrSeller = isAdmin || isSeller;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      if (!isAdminOrSeller) {
        navigate("/");
        return;
      }
      fetchOrders();
    }
  }, [isAuthenticated, isAdminOrSeller, authLoading, page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      let url = `/orders/admin/all?page=${page}&size=${pageSize}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const response = await API.get(url);
      setOrders(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch orders. Please try again."
      );
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Client-side search since backend doesn't support search
    // We'll filter the already fetched orders
    setPage(0);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!window.confirm(`Are you sure you want to update order status to ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus({ ...updatingStatus, [orderId]: true });
    try {
      const requestData = {
        status: newStatus,
      };
      await API.put(`/orders/admin/${orderId}/status`, requestData);
      await fetchOrders(); // Refresh orders
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update order status. Please try again."
      );
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingStatus({ ...updatingStatus, [orderId]: false });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!isAdmin) {
      alert("Only administrators can delete orders.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingOrder(orderId);
    try {
      await API.delete(`/orders/admin/${orderId}`);
      await fetchOrders(); // Refresh orders
      alert("Order deleted successfully.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete order. Please try again."
      );
      console.error("Error deleting order:", error);
    } finally {
      setDeletingOrder(null);
    }
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

  const getStatusLabel = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getNextValidStatuses = (currentStatus) => {
    const statusTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };
    return statusTransitions[currentStatus] || [];
  };

  // Filter orders by search query (client-side)
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      (order.username && order.username.toLowerCase().includes(query))
    );
  });

  if (authLoading || loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdminOrSeller) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Orders</h2>
        <Link to="/orders" className="btn btn-outline-secondary">
          View My Orders
        </Link>
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

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="statusFilter" className="form-label">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                className="form-select"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="searchQuery" className="form-label">
                Search by Order ID or Customer Name
              </label>
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    id="searchQuery"
                    className="form-control"
                    placeholder="Enter order ID or customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="submit">
                    🔍 Search
                  </button>
                  {searchQuery && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <div className="text-muted small">
                Total: {totalElements} orders
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="alert alert-info">
          {searchQuery
            ? "No orders found matching your search criteria."
            : "No orders found."}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Update Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const nextStatuses = getNextValidStatuses(order.status);
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>{order.username || "N/A"}</td>
                      <td>
                        <div>{formatDate(order.orderDate)}</div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td>
                        <strong>${parseFloat(order.totalAmount).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.paymentStatus === "PAID"
                              ? "bg-success"
                              : order.paymentStatus === "FAILED"
                              ? "bg-danger"
                              : order.paymentStatus === "REFUNDED"
                              ? "bg-info"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        {nextStatuses.length > 0 ? (
                          <select
                            className="form-select form-select-sm"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusUpdate(order.id, e.target.value);
                              }
                            }}
                            disabled={updatingStatus[order.id]}
                          >
                            <option value="">Update Status</option>
                            {nextStatuses.map((status) => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-muted small">No updates</span>
                        )}
                        {updatingStatus[order.id] && (
                          <div className="spinner-border spinner-border-sm ms-2" role="status">
                            <span className="visually-hidden">Updating...</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Link
                            to={`/orders/${order.id}`}
                            className="btn btn-sm btn-primary"
                            title="View Details"
                          >
                            👁️ View
                          </Link>
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deletingOrder === order.id}
                              title="Delete Order"
                            >
                              {deletingOrder === order.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                >
                                  <span className="visually-hidden">Deleting...</span>
                                </span>
                              ) : (
                                "🗑️ Delete"
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Order pagination" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => {
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= page - 1 && i <= page + 1)
                  ) {
                    return (
                      <li
                        key={i}
                        className={`page-item ${page === i ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(i)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    );
                  } else if (i === page - 2 || i === page + 2) {
                    return (
                      <li key={i} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                })}
                <li
                  className={`page-item ${
                    page === totalPages - 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages - 1}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;

