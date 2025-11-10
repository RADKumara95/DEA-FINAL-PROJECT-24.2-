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

  const handleGenerateOrdersReport = async (days = 30) => {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const res = await API.get(`/reports/admin/orders?startDate=${startStr}&endDate=${endStr}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-report-${startStr}-to-${endStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate orders report:', err);
      alert('Failed to generate orders report');
    }
  };

  const handleExportSalesCsv = async (days = 30) => {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const res = await API.get(`/reports/admin/sales?startDate=${startStr}&endDate=${endStr}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${startStr}-to-${endStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export sales csv:', err);
      alert('Failed to export sales csv');
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
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-gray-100 text-gray-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusClass = (status) => {
    const statusClasses = {
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-blue-100 text-blue-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };
    return statusClasses[status] || "bg-yellow-100 text-yellow-800";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md mx-4">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdminOrSeller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-800 font-medium">You do not have permission to access this page.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{marginTop:"5rem"}}>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <h2 className="text-3xl font-bold text-white">Manage Orders</h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                  onClick={() => handleGenerateOrdersReport(30)}
                >
                  📄 Generate 30d Report
                </button>
                <button 
                  className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                  onClick={() => handleExportSalesCsv(30)}
                >
                  📊 Export Sales CSV
                </button>
                <Link 
                  to="/orders" 
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
            <div className="md:col-span-2">
              <label htmlFor="searchQuery" className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Order ID or Customer Name
              </label>
              <form onSubmit={handleSearch}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="searchQuery"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter order ID or customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    className="px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm" 
                    type="submit"
                  >
                    🔍 Search
                  </button>
                  {searchQuery && (
                    <button
                      className="px-4 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-sm"
                      type="button"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
              <div className="mt-2 text-sm text-gray-600">
                Total: {totalElements} orders
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg text-blue-800 font-medium">
              {searchQuery
                ? "No orders found matching your search criteria."
                : "No orders found."}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Total Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Payment Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Update Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order, index) => {
                      const nextStatuses = getNextValidStatuses(order.status);
                      return (
                        <tr key={order.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-bold text-gray-900">#{order.id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.username || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(order.orderDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-gray-900">
                              ${parseFloat(order.totalAmount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {nextStatuses.length > 0 ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                                {updatingStatus[order.id] && (
                                  <div className="flex justify-center">
                                    <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No updates</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Link
                                to={`/orders/${order.id}`}
                                className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                                title="View Details"
                              >
                                👁️ View
                              </Link>
                              {isAdmin && (
                                <button
                                  className="inline-flex items-center px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  disabled={deletingOrder === order.id}
                                  title="Delete Order"
                                >
                                  {deletingOrder === order.id ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-xl shadow-xl p-6">
                <nav aria-label="Order pagination" className="flex justify-center">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        page === 0
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      if (
                        i === 0 ||
                        i === totalPages - 1 ||
                        (i >= page - 1 && i <= page + 1)
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              page === i
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      } else if (i === page - 2 || i === page + 2) {
                        return (
                          <span key={i} className="px-3 py-2 text-sm text-gray-500">...</span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages - 1}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        page === totalPages - 1
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

