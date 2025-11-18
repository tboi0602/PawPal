import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  ChevronDown,
  MessageSquare,
  Users,
  Tag,
  Package,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  getBookings,
  updateBooking,
} from "../../services/solutions/bookingAPI";
import { getItem } from "../../utils/operations";
import { Loader } from "../../components/models/Loaders/Loader";
import { BackToTop } from "../../components/buttons/BackToTop";

// Định nghĩa màu chủ đạo: Primary là Đen/Trắng
const PRIMARY_COLOR = "bg-gray-900";
const PRIMARY_TEXT = "text-white";
const SECONDARY_BG = "bg-gray-100";
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

// Status icons
const STATUS_ICONS = {
  pending: <Clock size={16} />,
  confirmed: <CheckCircle size={16} />,
  completed: <CheckCircle size={16} />,
  cancelled: <XCircle size={16} />,
};

/**
 * Booking Card Component
 */
const BookingCard = ({ booking, onViewDetails, onCancel }) => {
  const statusColors = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;

  // Lấy tên Resource đầu tiên (nếu có pet) để hiển thị nhanh
  const resourceName =
    booking.pets && booking.pets.length > 0
      ? booking.pets[0].resourceName
      : "N/A";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {booking.solutionName || "Unknown Service"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Booking ID: {booking._id?.slice(-8)}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusColors.bg} ${statusColors.border}`}
        >
          <span className={statusColors.text}>
            {STATUS_ICONS[booking.status]}
          </span>
          <span
            className={`text-xs font-semibold ${statusColors.text} capitalize`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
        {/* Date */}
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Date
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-gray-600" />
            <span className="text-gray-900 font-medium">
              {booking.dateStarts
                ? new Date(booking.dateStarts).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Time
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-600" />
            <span className="text-gray-900 font-medium">
              {booking.dateStarts
                ? new Date(booking.dateStarts).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Resource Name / Location */}
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Resource
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Package size={14} className="text-gray-600" />
            <span className="text-gray-900 font-medium">{resourceName}</span>
          </div>
        </div>

        {/* Price - Đã sửa từ totalPrice sang totalAmount */}
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Total Price
          </p>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={14} className="text-gray-600" />
            <span className="text-gray-900 font-bold">
              {booking.totalAmount?.toLocaleString("vi-VN") || "0"}đ
            </span>
          </div>
        </div>
      </div>

      {/* Pet Info (Quick summary) */}
      {booking.pets && booking.pets.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
            Pet(s)
          </p>
          <div className="flex flex-wrap gap-2">
            {booking.pets.map((pet, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
              >
                {pet.petName || `Pet ${idx + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(booking)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border ${BORDER_COLOR} text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition`}
        >
          <Eye size={16} />
          Details
        </button>
        {booking.status === "pending" && (
          <button
            onClick={() => onCancel(booking._id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={16} />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------

/**
 * Booking Details Modal
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
                  {booking.user.name}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Email:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {booking.user.email}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Phone:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {booking.user.phone}
                </span>
              </p>
              <div className="md:col-span-2">
                <p>
                  <span className="text-gray-600">Address:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {booking.user.address.join(", ")}
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
                    {booking.solutionId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {/* Tính toán Duration từ dateStarts và dateEnd */}
                    {new Date(booking.dateEnd).getTime() -
                      new Date(booking.dateStarts).getTime() >
                    0
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
                    {new Date(booking.dateStarts).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ends</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.dateEnd).toLocaleString("vi-VN")}
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
                  {booking.totalAmount?.toLocaleString("vi-VN")}đ
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
                  {new Date(booking.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.updatedAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Version Key</p>
                <p className="font-semibold text-gray-900">{booking.__v}</p>
              </div>
            </div>
          </section>

          {/* Notes - Giữ lại nếu trường này có tồn tại trong dữ liệu thực tế */}
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

// ----------------------------------------------------------------------

/**
 * Main Component - Booking History Page
 */
export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Load bookings
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = getItem("user-data");
      if (!userData || !userData._id) {
        Swal.fire("Error", "User not found. Please login again.", "error");
        return;
      }

      // Giả định hàm getBookings đã được config để gửi userId
      const response = await getBookings({ userId: userData._id });
      if (response.success) {
        setBookings(response.bookings || []);
      } else {
        Swal.fire("Error", "Failed to load bookings", "error");
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.solutionName?.toLowerCase().includes(searchLower) ||
          b.user?.name?.toLowerCase().includes(searchLower) || // Thêm tìm kiếm theo tên người dùng
          b._id?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, search]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleCancel = async (bookingId) => {
    const confirm = await Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await updateBooking(bookingId, {
          status: "cancelled",
        });
        if (response.success) {
          Swal.fire("Success", "Booking cancelled successfully", "success");
          loadBookings();
        } else {
          Swal.fire(
            "Error",
            response.message || "Failed to cancel booking",
            "error"
          );
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Booking History
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage all your service bookings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by service name, user name, or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              All Bookings
            </button>
            {["pending", "confirmed", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${
                    statusFilter === status
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* Bookings List */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">
            {filteredBookings.length} Booking
            {filteredBookings.length !== 1 ? "s" : ""}
          </h2>

          {filteredBookings.length > 0 ? (
            <div className="grid gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-900 mb-1">
                No bookings found
              </p>
              <p className="text-gray-600">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "You haven't made any bookings yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />

      <BackToTop />
    </div>
  );
};
