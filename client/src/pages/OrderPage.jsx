import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";
import { Loader } from "../components/models/Loaders/Loader.jsx";
import Pagination from "../components/buttons/Pagination.jsx";
import {
  getOrdersByUser,
  updateOrderStatus,
} from "../services/shopping/orderAPI.js";
import { getItem } from "../utils/operations.js";
import { OrderDetails } from "../components/models/Orders/OrderDetails.jsx";
import Swal from "sweetalert2";
import OrderCard from "../components/models/Orders/OrderCard.jsx";

export const OrderPage = () => {
  const navigate = useNavigate();
  const user = getItem("user-data");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Delivering",
    "Delivered",
    "Cancelled",
    "Failed",
  ];

  const loadOrders = useCallback(
    async (page, status = "") => {
      if (!user?._id) {
        setMessage("Please log in to view your orders.");
        return;
      }

      setIsLoading(true);
      setMessage("");
      try {
        const dataRes = await getOrdersByUser(user._id, page, 10, status);
        if (!dataRes.success) {
          setOrders([]);
          setMessage(dataRes.message || "Failed to load orders.");
          setTotalOrders(0);
          setTotalPages(0);
          setPageSize(0);
          return;
        }
        setOrders(dataRes.orders);
        setTotalPages(dataRes.pagination?.totalPages || 1);
        setPageSize(dataRes.pagination?.pageSize || 10);
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setMessage("An error occurred while loading your orders.");
      } finally {
        setIsLoading(false);
      }
    },
    [user?._id]
  );

  useEffect(() => {
    loadOrders(1, "");
  }, [loadOrders]);

  useEffect(() => {
    loadOrders(1, statusFilter);
  }, [statusFilter, loadOrders]);

  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      await loadOrders(page, statusFilter);
    }
  };

  const handleBuyAgain = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Items",
        text: "This order has no items to repurchase.",
      });
      return;
    }

    // Navigate to product page with the first product ID
    const firstProductId = order.orderItems[0]?.productId?._id;
    if (firstProductId) {
      navigate(`/home/products/product-details?id=${firstProductId}`);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not find product information.",
      });
    }
  };

  const handleCancelOrder = async (orderId, orderStatus) => {
    if (orderStatus !== "pending" && orderStatus !== "confirmed") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Cancel",
        text: `Orders with status "${orderStatus}" cannot be cancelled.`,
      });
      return;
    }

    Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "gray",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = await updateOrderStatus(orderId, "cancelled");
        if (data.success) {
          Swal.fire({
            toast: true,
            position: "bottom-right",
            icon: "success",
            title:
              "Your order cancellation request has been submitted. Please contact support for updates.",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          });
          loadOrders(1, "");
          return;
        }
        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "error",
          title: data.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
        loadOrders(1, "");
      }
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "delivering":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Please Log In
          </h1>
          <p className="text-gray-600 mb-6">
            You need to log in to view your orders.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-16 md:p-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full pt-4 md:pt-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black shrink-0">
          My Orders
        </h1>

        {/* Filter Container */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">All Status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status.toLowerCase()}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center items-center py-16">
          <Loader />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const firstItem = order.orderItems?.[0];
            const itemCount = order.orderItems?.length || 0;

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-200"
              >
                <OrderCard
                  firstItem={firstItem}
                  itemCount={itemCount}
                  order={order}
                  getStatusColor={getStatusColor}
                  handleBuyAgain={handleBuyAgain}
                  handleCancelOrder={handleCancelOrder}
                  setSelectedOrder={setSelectedOrder}
                />
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                totalItems={totalOrders}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                itemsPerPage={pageSize}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg text-gray-600">
            {message || "No orders found."}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          setOpenDetails={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
