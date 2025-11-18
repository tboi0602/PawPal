// src/utils/bookingUtils.js

export const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

export const STATUS_COLORS = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
};

/**
 * Lấy lớp CSS màu cho trạng thái booking
 */
export const getStatusColor = (status) => {
  const colorMap = STATUS_COLORS[status?.toLowerCase()];
  if (colorMap) {
    return `${colorMap.text} ${colorMap.bg}`;
  }
  return "text-gray-600 bg-gray-50";
};

/**
 * Định dạng giá tiền VND
 */
export const formatPrice = (price) => {
  if (typeof price !== "number") return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};