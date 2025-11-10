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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-800 font-medium">Please login to view your orders.</span>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrdersCount = statusFilter === "ALL" 
    ? allOrders.length 
    : allOrders.filter((order) => order.status === statusFilter).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">My Orders</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    viewMode === "table" 
                      ? "bg-white text-blue-600" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  📊 Table
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    viewMode === "card" 
                      ? "bg-white text-blue-600" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  📋 Cards
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Sort Controls */}
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="statusFilter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by Date
                </label>
                <select
                  id="sortOrder"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={sortOrder}
                  onChange={handleSortChange}
                >
                  <option value="DESC">Newest First</option>
                  <option value="ASC">Oldest First</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-gray-600 text-sm">
                  Showing {orders.length} of {filteredOrdersCount} order
                  {filteredOrdersCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-lg text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg text-gray-600 mb-2">
              {statusFilter === "ALL"
                ? "No orders found. Start shopping to place your first order!"
                : `No orders found with status "${getStatusLabel(statusFilter)}".`}
            </p>
          </div>
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Total Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Payment Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={order.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(order.orderDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">${parseFloat(order.totalAmount).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/orders/${order.id}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md"
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
              <div className="px-6 py-4 border-t border-gray-200">
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Order #{order.id}</span>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Date:</span>
                    <div className="text-sm text-gray-900 mt-1">{formatDateTime(order.orderDate)}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mt-1">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Items:</span>
                      <div className="text-sm text-gray-900 mt-1">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <Link
                    to={`/orders/${order.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === "card" && totalPages > 1 && (
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
      </div>
    </div>
  );
};

export default OrderList;

