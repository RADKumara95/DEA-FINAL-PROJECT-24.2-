import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

const OrderList = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DESC"); // DESC for newest first, ASC for oldest first
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const pageSize = 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, sortOrder]);

  useEffect(() => {
    // Apply client-side filtering when statusFilter, allOrders, sortOrder, or page changes
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, allOrders, sortOrder, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch all orders first for client-side filtering
      // We'll fetch with a large page size to get all orders, then filter client-side
      const response = await API.get(
        `/orders?page=0&size=1000&sortBy=orderDate`
      );
      const fetchedOrders = response.data.content || [];
      
      // Sort orders based on sortOrder
      const sortedOrders = [...fetchedOrders].sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
      });
      
      setAllOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];

    // Apply status filter
    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply pagination
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrders = filtered.slice(startIndex, endIndex);
    const totalFilteredPages = Math.ceil(filtered.length / pageSize);

    setOrders(paginatedOrders);
    setTotalPages(totalFilteredPages);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setPage(0); // Reset to first page when sort changes
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
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

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Please login to view your orders.</div>
      </div>
    );
  }

  const filteredOrdersCount = statusFilter === "ALL" 
    ? allOrders.length 
    : allOrders.filter((order) => order.status === statusFilter).length;

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setViewMode("table")}
          >
            <i className="bi bi-table"></i> Table
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === "card" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setViewMode("card")}
          >
            <i className="bi bi-grid"></i> Cards
          </button>
        </div>
      </div>

      {/* Filters and Sort Controls */}
      <div className="row mb-4">
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
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="sortOrder" className="form-label">
            Sort by Date
          </label>
          <select
            id="sortOrder"
            className="form-select"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <div className="text-muted">
            Showing {orders.length} of {filteredOrdersCount} order
            {filteredOrdersCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info">
          {statusFilter === "ALL"
            ? "No orders found. Start shopping to place your first order!"
            : `No orders found with status "${getStatusLabel(statusFilter)}".`}
        </div>
      ) : viewMode === "table" ? (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>
                      <div>{formatDate(order.orderDate)}</div>
                      <small className="text-muted">
                        {formatDateTime(order.orderDate)}
                      </small>
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
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  // Show first page, last page, current page, and pages around current
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
      ) : (
        <>
          <div className="row">
            {orders.map((order) => (
              <div key={order.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>Order #{order.id}</strong>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="card-text">
                      <strong>Date:</strong> {formatDateTime(order.orderDate)}
                    </p>
                    <p className="card-text">
                      <strong>Total Amount:</strong>{" "}
                      <span className="text-primary fs-5">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </span>
                    </p>
                    <p className="card-text">
                      <strong>Payment Status:</strong>{" "}
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
                    </p>
                    {order.items && order.items.length > 0 && (
                      <p className="card-text">
                        <strong>Items:</strong> {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="card-footer bg-transparent">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-primary w-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default OrderList;

