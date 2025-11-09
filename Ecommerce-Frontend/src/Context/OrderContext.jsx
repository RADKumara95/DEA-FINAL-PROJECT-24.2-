import { createContext, useState, useContext } from "react";
import API from "../axios";

const OrderContext = createContext({
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,
  createOrder: async () => {},
  fetchOrderById: async () => {},
  fetchUserOrders: async () => {},
  cancelOrder: async () => {},
  setCurrentOrder: () => {},
  clearCurrentOrder: () => {},
});

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.post("/orders", orderData);
      const newOrder = response.data;
      setCurrentOrder(newOrder);
      setOrders((prev) => [newOrder, ...prev]);
      return { success: true, data: newOrder };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to create order";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(`/orders/${orderId}`);
      const order = response.data;
      setCurrentOrder(order);
      return { success: true, data: order };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to fetch order";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (page = 0, size = 10, sortBy = "orderDate") => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(
        `/orders?page=${page}&size=${size}&sortBy=${sortBy}`
      );
      const ordersData = response.data.content || response.data || [];
      setOrders(ordersData);
      return {
        success: true,
        data: ordersData,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to fetch orders";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      await API.put(`/orders/${orderId}/cancel`);
      // Update the order in the list
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "CANCELLED" }
            : order
        )
      );
      // Update current order if it's the one being cancelled
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, status: "CANCELLED" });
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to cancel order";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentOrder = () => {
    setCurrentOrder(null);
  };

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        orders,
        loading,
        error,
        createOrder,
        fetchOrderById,
        fetchUserOrders,
        cancelOrder,
        setCurrentOrder,
        clearCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

export default OrderContext;

