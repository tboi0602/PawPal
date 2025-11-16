import { Search, X, Eye, SquarePen } from "lucide-react";
//components
import InputForm from "../components/inputs/InputForm.jsx";
import Pagination from "../components/buttons/Pagination";
import { Loader } from "../components/models/Loaders/Loader.jsx";
//hook
import { useCallback, useEffect, useState } from "react";
//API
import { getOrders, updateOrderStatus } from "../services/shopping/orderAPI";
import Swal from "sweetalert2";
import { formatDate } from "../utils/formatDate";
import { OrderDetails } from "../components/models/Orders/OrderDetails";
import { useDebounce } from "../hooks/useDebounce.js";

export const AdminOrderPage = () => {
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [orders, setOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Delivering",
    "Delivered",
    "Cancelled",
    "Failed",
  ];

  const loadOrders = useCallback(async (page, status, search = "") => {
    setIsLoading(true);
    setMessage("");
    try {
      const dataRes = await getOrders(page, 10, status, search);
      if (!dataRes.success) {
        setOrders([]);
        setMessage("Order not found.");
        setTotalOrders(0);
        setTotalPages(0);
        setPageSize(0);
        if (page === 1) setCurrentPage(1);
        return;
      }

      setOrders(dataRes.orders);
      setTotalOrders(dataRes.pagination.totalOrders);
      setTotalPages(dataRes.pagination.totalPages);
      setPageSize(dataRes.pagination.pageSize);
      setCurrentPage(dataRes.pagination.currentPage);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setMessage("An unexpected error occurred while fetching orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(1, statusFilter, "");
  }, [statusFilter, loadOrders]);

  useEffect(() => {
    loadOrders(1, "", "");
  }, [loadOrders]);
  useEffect(() => {
    if (debounceSearch.length > 1 || debounceSearch.length === 0) {
      loadOrders(1, "", debounceSearch);
    }
  }, [debounceSearch, loadOrders]);
  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      await loadOrders(page, statusFilter, debounceSearch);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    Swal.fire({
      title: "Update Order Status?",
      text: `Change order status to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const dataRes = await updateOrderStatus(orderId, newStatus);
        if (dataRes.success) {
          Swal.fire({
            title: "Updated!",
            text: "Order status has been updated.",
            icon: "success",
          });
          // Re-load orders to see the update
          loadOrders(currentPage, statusFilter);
        } else {
          Swal.fire({
            title: "Error!",
            text: dataRes.message || "Failed to update order status.",
            icon: "error",
          });
        }
      }
    });
  };

  // New function to open the details modal
  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
  };

  // New function to close the details modal
  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "delivering":
        return "text-purple-600 bg-purple-50";
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10">
      {/* Title & Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full pt-4 md:pt-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black shrink-0">
          Manage Orders
        </h1>
        {/* Filter Container */}
        <div className="flex w-full md:w-2/3 lg:w-1/2 gap-4 justify-start md:justify-end items-center flex-wrap">
          {/* Status Filter */}
          <div className="w-full relative flex justify-center items-center">
            {/* Search Input */}
            <InputForm
              Icon={Search}
              placeholder="Search order..."
              name="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <X
                className="absolute right-2 cursor-pointer text-gray-400 hover:text-black"
                onClick={() => {
                  setSearch("");
                }}
              />
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Always reset to page 1 when filter changes
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Status</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[120px]">
                Order ID
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[150px]">
                Customer ID
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[120px]">
                Total
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[120px]">
                Date
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[100px]">
                Delivery Status
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[120px]">
                Method
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[120px]">
                payment STATUS
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[120px]">
                operator
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700 text-sm">
            {orders && orders.length > 0
              ? orders.map((order, index) => {
                  const orderNumber =
                    ((currentPage > 0 ? currentPage : 1) - 1) *
                      (pageSize > 0 ? pageSize : 10) +
                    index +
                    1;

                  return (
                    <tr
                      key={order?._id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-left">
                        {orderNumber}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left font-medium">
                        {order?._id?.slice(-8).toUpperCase()}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left">
                        {order?.userId?.slice(-8).toUpperCase() || "GUEST"}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left font-medium">
                        {order?.finalAmount?.toLocaleString("vi-VN")} VND
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left">
                        {formatDate(order?.createdAt, "dd/mm/yyyy HH:MM:ss")}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left">
                        <select
                          value={order?.status}
                          onChange={(e) =>
                            handleStatusChange(order?._id, e.target.value)
                          }
                          className={`px-2 py-1 rounded font-semibold text-xs cursor-pointer border-0 focus:outline-none ${getStatusColor(
                            order?.status
                          )}`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status.toLowerCase()}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className=" px-3 py-3  text-center justify-center font-bold mt-1 uppercase">
                        {order.paymentMethod?.method === "cod" ? "COD" : "MOMO"}
                      </td>
                      {order.paymentMethod?.status === "paid" ? (
                        <td className=" py-3  text-center justify-center font-bold mt-1 text-green-600 uppercase">
                          {order.paymentMethod?.status}
                        </td>
                      ) : (
                        <td className=" py-3  text-center justify-center font-bold mt-1 text-red-600 uppercase">
                          {order.paymentMethod?.status}
                        </td>
                      )}

                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <div
                          className="flex items-center justify-center gap-3"
                          // Corrected: Pass the specific order object to the handler
                          onClick={() => handleOpenDetails(order)}
                        >
                          <Eye className="w-4 cursor-pointer text-gray-500 hover:text-blue-600 duration-150" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              : !isLoading && (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center text-red-600 p-4 text-lg"
                    >
                      {message || "No orders found."}
                    </td>
                  </tr>
                )}
          </tbody>
        </table>

        {isLoading && (
          <div className="w-full flex justify-center items-center py-4">
            <Loader />
          </div>
        )}
      </div>

      {/* Pagination component */}
      <Pagination
        totalItems={totalOrders}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={pageSize}
      />

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          setOpenDetails={handleCloseDetails}
        />
      )}
    </div>
  );
};
