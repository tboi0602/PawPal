import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, X, RefreshCw } from "lucide-react"; // Thêm RefreshCw cho tải lại
import { Loader } from "../../components/models/Loaders/Loader.jsx";
import Pagination from "../../components/buttons/Pagination.jsx";
import {
  getOrdersByUser,
  updateOrderStatus,
} from "../../services/shopping/orderAPI.js";
import { getItem } from "../../utils/operations.js";
import { OrderDetails } from "../../components/models/Orders/OrderDetails.jsx";
// Giả sử OrderCard là component đã có
import OrderCard from "../../components/models/Orders/OrderCard.jsx";
import Swal from "sweetalert2";

// --- Hằng số và Hàm tiện ích ---

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Delivering",
  "Delivered",
  "Cancelled",
  "Failed",
];

// Hàm lấy màu sắc cho trạng thái (giữ nguyên logic màu sắc đã có)
const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "confirmed":
      return "bg-gray-200 text-gray-800 border-gray-300"; // Thay đổi Blue thành Gray cho theme đen trắng
    case "delivering":
      return "bg-gray-900 text-white border-gray-900"; // Đen làm màu nổi bật cho đang giao
    case "delivered":
      return "bg-green-100 text-green-800 border-green-300";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

// --- Component Chính ---

export const OrderPage = () => {
  const navigate = useNavigate();
  // Lấy dữ liệu người dùng từ Local Storage/Session Storage
  const user = getItem("user-data");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Cố định 10
  const [statusFilter, setStatusFilter] = useState("");
  const [totalOrders, setTotalOrders] = useState(0); // Cần thiết cho Pagination

  // ------------------------------------
  // ## 1. Logic Tải Đơn Hàng
  // ------------------------------------

  const loadOrders = useCallback(
    async (page, status) => {
      if (!user?._id) {
        setMessage("Please log in to view your orders.");
        return;
      }

      setIsLoading(true);
      setMessage("");
      try {
        // Gán pageSize = 10 cứng, nếu API trả về không chuẩn
        const dataRes = await getOrdersByUser(user._id, page, 10, status);

        if (!dataRes.success || !dataRes.orders) {
          setOrders([]);
          setMessage(dataRes.message || "Failed to load orders.");
          setTotalOrders(0);
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }

        setOrders(dataRes.orders);
        setTotalPages(dataRes.pagination?.totalPages || 1);
        setTotalOrders(dataRes.pagination?.totalItems || dataRes.orders.length);
        // setPageSize(dataRes.pagination?.pageSize || 10); // Giữ cố định 10
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

  // Load orders lần đầu và khi filter thay đổi
  useEffect(() => {
    // Luôn tải lại về trang 1 khi filter thay đổi
    loadOrders(1, statusFilter);
  }, [statusFilter, loadOrders]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadOrders(page, statusFilter);
    }
  };

  // ------------------------------------
  // ## 2. Logic Thao Tác Đơn Hàng
  // ------------------------------------

  const handleBuyAgain = (order) => {
    const firstProductId = order.orderItems?.[0]?.productId?._id;
    if (firstProductId) {
      // Điều hướng đến trang chi tiết sản phẩm đầu tiên
      navigate(`/home/products/product-details?id=${firstProductId}`);
      return;
    }
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not find product information to repurchase.",
    });
  };

  const handleCancelOrder = async (orderId, orderStatus) => {
    const statusLower = orderStatus?.toLowerCase();

    // Chỉ cho phép hủy khi đang chờ hoặc đã xác nhận
    if (statusLower !== "pending" && statusLower !== "confirmed") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Cancel",
        text: `Orders with status "${orderStatus}" cannot be cancelled.`,
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Cancellation",
      text: "Are you sure you want to cancel this order? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280", // Gray
      confirmButtonText: "Yes, Cancel It",
    });

    if (result.isConfirmed) {
      // Cập nhật trạng thái
      const data = await updateOrderStatus(orderId, "cancelled");
      if (data.success) {
        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "success",
          title: "Order cancellation request submitted!",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        // Tải lại đơn hàng trên trang hiện tại để cập nhật trạng thái
        loadOrders(currentPage, statusFilter);
      } else {
        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "error",
          title: data.message || "Cancellation failed.",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
        loadOrders(currentPage, statusFilter);
      }
    }
  };

  // ------------------------------------
  // ## 3. Render Điều kiện
  // ------------------------------------

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Sign in to view your order history and track purchases.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 md:px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-black mb-1">My Orders</h1>
            <p className="text-gray-600">Track and manage your purchases</p>
          </div>

          {/* Filter & Reload */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadOrders(currentPage, statusFilter)}
              className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
              title="Reload"
            >
              <RefreshCw size={20} className="text-black" />
            </button>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const firstItem = order.orderItems?.[0];
              const itemCount = order.orderItems?.length || 0;

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition duration-200"
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
              <div className="mt-8 flex justify-center">
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
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-black mb-1">
              No Orders Found
            </h2>
            <p className="text-gray-600 mb-6">
              {message || "Start shopping to place your first order."}
            </p>
            <button
              onClick={() => navigate("/home/products")}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition font-medium"
            >
              Shop Now
            </button>
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
    </div>
  );
};
