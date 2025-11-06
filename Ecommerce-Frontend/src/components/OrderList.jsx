import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

const OrderList = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/orders?page=${page}&size=10&sortBy=orderDate`);
      setOrders(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      PENDING: "bg-warning",
      CONFIRMED: "bg-info",
      PROCESSING: "bg-primary",
      SHIPPED: "bg-secondary",
      DELIVERED: "bg-success",
      CANCELLED: "bg-danger",
    };
    return statusClasses[status] || "bg-secondary";
  };

  if (!isAuthenticated) {
    return <div className="container mt-5">Please login to view your orders.</div>;
  }

  if (loading) {
    return <div className="container mt-5">Loading orders...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
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
                    <td>#{order.id}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>${parseFloat(order.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === "PAID" ? "bg-success" : "bg-warning"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn-sm btn-primary">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav>
              <ul className="pagination">
                <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(i)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
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

