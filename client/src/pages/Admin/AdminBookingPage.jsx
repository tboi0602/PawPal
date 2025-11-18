import {
  Search,
  X,
  Eye,
  SquarePen,
  Clock, // Thêm cho Modal
  DollarSign, // Thêm cho Modal
  MessageSquare, // Thêm cho Modal
  Users, // Thêm cho Modal
  Tag, // Thêm cho Modal
  Package, // Thêm cho Modal
  Calendar, // Thêm cho Modal
  CheckCircle, // Thêm cho Modal
  XCircle, // Thêm cho Modal
} from "lucide-react";
//components
import InputForm from "../../components/inputs/InputForm.jsx";
import Pagination from "../../components/buttons/Pagination.jsx";
import { Loader } from "../../components/models/Loaders/Loader.jsx";
//hook
import { useCallback, useEffect, useState } from "react";
//API
import {
  getBookings,
  updateBooking,
} from "../../services/solutions/bookingAPI.js";
import Swal from "sweetalert2";
import { formatDate } from "../../utils/formatDate.js";
import { useDebounce } from "../../hooks/useDebounce.js";

// --- CONSTANTS VÀ COMPONENTS HỖ TRỢ CHO MODAL ---

// Định nghĩa màu chủ đạo cho Modal
const PRIMARY_COLOR = "bg-gray-900";
const PRIMARY_TEXT = "text-white";
const BORDER_COLOR = "border-gray-300";

// Status badge colors
const STATUS_COLORS = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

/**
 * Booking Details Modal (Tái sử dụng logic từ trang khách hàng)
 */
const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className={`bg-white border-b ${BORDER_COLOR} p-6 sticky top-0`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">ID: {booking._id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 p-1 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* User Information */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
              <Users size={16} /> User Information
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="text-gray-600">Name:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {booking.user?.name || "N/A"}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Email:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {booking.user?.email || "N/A"}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Phone:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {booking.user?.phone || "N/A"}
                </span>
              </p>
              <div className="md:col-span-2">
                <p>
                  <span className="text-gray-600">Address:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {booking.user?.address?.join(", ") || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Service & Time Info */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
              <Clock size={16} /> Service & Time
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <p className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-200">
                {booking.solutionName || "Unknown Service"}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Solution ID</p>
                  <p className="font-semibold text-gray-900">
                    {booking.solutionId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {booking.dateStarts && booking.dateEnd
                      ? `${
                          (new Date(booking.dateEnd).getTime() -
                            new Date(booking.dateStarts).getTime()) /
                          3600000
                        } hour(s)`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Starts</p>
                  <p className="font-semibold text-gray-900">
                    {booking.dateStarts
                      ? new Date(booking.dateStarts).toLocaleString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ends</p>
                  <p className="font-semibold text-gray-900">
                    {booking.dateEnd
                      ? new Date(booking.dateEnd).toLocaleString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pets and Resources */}
          {booking.pets && booking.pets.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                <Package size={16} /> Pets & Assigned Resources
              </h3>
              <div className="space-y-3">
                {booking.pets.map((pet, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <p className="font-bold text-gray-900 mb-2">
                      {pet.petName || `Pet ${idx + 1}`}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Resource Name</p>
                        <p className="font-medium text-gray-800">
                          {pet.resourceName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sub-Total</p>
                        <p className="font-medium text-gray-800">
                          {pet.subTotal?.toLocaleString("vi-VN") || "0"}đ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Financial and Status Info */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
              <DollarSign size={16} /> Financial & Status
            </h3>
            <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Hire Shipper</span>
                <span
                  className={`font-semibold text-sm ${
                    booking.hireShipper ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {booking.hireShipper ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    STATUS_COLORS[booking.status]?.bg
                  } ${STATUS_COLORS[booking.status]?.text}`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold text-lg">
                  TOTAL AMOUNT
                </span>
                <span className="font-bold text-xl text-gray-900">
                  {booking.totalAmount?.toLocaleString("vi-VN") || "0"}đ
                </span>
              </div>
            </div>
          </section>

          {/* Metadata */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
              <Tag size={16} /> Metadata
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-semibold text-gray-900">
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">
                  {booking.updatedAt
                    ? new Date(booking.updatedAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Version Key</p>
                <p className="font-semibold text-gray-900">
                  {booking.__v || "0"}
                </p>
              </div>
            </div>
          </section>

          {/* Notes */}
          {booking.notes && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                <MessageSquare size={16} /> Notes
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {booking.notes}
                </p>
              </div>
            </section>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className={`px-6 py-3 ${PRIMARY_COLOR} ${PRIMARY_TEXT} font-semibold rounded-lg hover:bg-gray-700 transition`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const AdminBookingPage = () => {
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [bookings, setBookings] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // State for Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

  // Format price in USD
  const formatPrice = (price) => {
    if (typeof price !== "number") return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const loadBookings = useCallback(async (page, status, search = "") => {
    setIsLoading(true);
    setMessage("");
    try {
      const dataRes = await getBookings({
        search: search || undefined,
        status: status || undefined,
      });

      if (!dataRes.bookings || dataRes.bookings.length === 0) {
        setBookings([]);
        setMessage("No bookings found.");
        setTotalBookings(0);
        setTotalPages(0);
        setPageSize(0);
        if (page === 1) setCurrentPage(1);
        return;
      }

      // Filter and paginate manually if API doesn't support pagination
      let filtered = dataRes.bookings;
      if (status) {
        filtered = filtered.filter(
          (b) => b.status?.toLowerCase() === status.toLowerCase()
        );
      }

      // Client-side search for simplicity (assuming getBookings returns all data)
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.solutionName?.toLowerCase().includes(searchLower) ||
            b.user?.name?.toLowerCase().includes(searchLower) ||
            b._id?.toLowerCase().includes(searchLower)
        );
      }

      const itemsPerPage = 10;
      const totalItems = filtered.length;
      const pages = Math.ceil(totalItems / itemsPerPage);
      const start = Math.max(0, (page - 1) * itemsPerPage);
      const paginated = filtered.slice(start, start + itemsPerPage);

      setBookings(paginated);
      setTotalBookings(totalItems);
      setTotalPages(pages);
      setPageSize(itemsPerPage);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setMessage("An unexpected error occurred while fetching bookings.");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to load on status change
  useEffect(() => {
    // Chỉ load lại page 1 khi filter status thay đổi
    loadBookings(1, statusFilter, debounceSearch);
  }, [statusFilter, loadBookings]);

  // Effect to load on initial render (combined into one for better control)
  useEffect(() => {
    loadBookings(1, statusFilter, "");
  }, [loadBookings]); // Load initial data

  // Effect to load on search debounce
  useEffect(() => {
    // Chỉ load lại page 1 khi search thay đổi
    if (debounceSearch.length > 1 || debounceSearch.length === 0) {
      loadBookings(1, statusFilter, debounceSearch);
    }
  }, [debounceSearch, loadBookings, statusFilter]);

  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      await loadBookings(page, statusFilter, debounceSearch);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    Swal.fire({
      title: "Update Booking Status?",
      text: `Change booking status to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const dataRes = await updateBooking(bookingId, { status: newStatus });
          if (dataRes.success) {
            Swal.fire({
              title: "Updated!",
              text: "Booking status has been updated.",
              icon: "success",
            });
            loadBookings(currentPage, statusFilter, debounceSearch);
          } else {
            Swal.fire({
              title: "Error!",
              text: dataRes.message || "Failed to update booking status.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.message || "Failed to update booking status.",
            icon: "error",
          });
        }
      }
    });
  };

  // Handler for viewing details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "completed":
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
          Manage Bookings
        </h1>
        {/* Filter Container */}
        <div className="flex w-full md:w-2/3 lg:w-1/2 gap-4 justify-start md:justify-end items-center flex-wrap">
          {/* Search Input */}
          <div className="w-full relative flex justify-center items-center">
            <InputForm
              Icon={Search}
              placeholder="Search booking (ID, service, user)..."
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
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Status</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[120px]">
                ID
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[150px]">
                Customer
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[100px]">
                Service
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[100px]">
                Date
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right min-w-[100px]">
                Amount
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[120px]">
                Status
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-20">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700 text-sm">
            {bookings && bookings.length > 0
              ? bookings.map((booking, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-left">
                        {rowNumber}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-left font-medium text-xs text-gray-500">
                        {booking._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-left font-medium">
                        {booking.user?.name || "N/A"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-left">
                        {booking.solutionName || "N/A"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-left">
                        {formatDate(booking.dateStarts)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right font-medium text-green-600">
                        {formatPrice(booking.totalAmount)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <select
                          value={booking.status || ""}
                          onChange={(e) =>
                            handleStatusChange(booking._id, e.target.value)
                          }
                          className={`px-2 py-1 rounded font-semibold text-xs cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-black ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option key={status} value={status.toLowerCase()}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Eye
                            className="w-4 cursor-pointer text-gray-500 hover:text-blue-600 duration-150"
                            onClick={() => handleViewDetails(booking)} // Thêm handler mở Modal
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>

        {bookings?.length === 0 && !isLoading && (
          <p className="text-center text-red-600 p-4 text-lg">{message}</p>
        )}

        {isLoading && (
          <div className="w-full flex justify-center items-center py-10">
            <Loader />
          </div>
        )}
      </div>

      <Pagination
        totalItems={totalBookings}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={pageSize}
      />

      {/* --- Modals --- */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
};

export default AdminBookingPage;
