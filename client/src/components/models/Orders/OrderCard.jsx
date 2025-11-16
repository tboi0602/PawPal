import { BanknoteArrowUp, Eye, RotateCcw, ShoppingBag } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";

const OrderCard = ({
  order,
  firstItem,
  itemCount,
  setSelectedOrder,
  handleBuyAgain,
  handleCancelOrder,
  getStatusColor,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
      {/* Product Image */}
      <div className="w-full sm:w-32 sm:h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {firstItem?.productId?.images ? (
          <img
            src={firstItem.productId.images}
            alt={firstItem.productId.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Top Section: Order ID and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Order ID
            </p>
            <p className="text-lg font-bold text-gray-900">
              {order._id?.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {formatDate(order.createdAt, "dd/mm/yyyy HH:MM:ss")}
            </p>
          </div>

          {/* Status Badge - Large */}
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-2 rounded-full font-bold text-base whitespace-nowrap ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">{firstItem?.productId?.name}</span>
            {itemCount > 1 && (
              <span className="ml-2 text-[#FF6B6B] font-medium">
                + {itemCount - 1} more item(s)
              </span>
            )}
          </p>
          <p className="text-sm text-gray-600">
            Quantity: {firstItem?.quantity || 1}
            {itemCount > 1 && ` + ${itemCount - 1}`}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-2">
            {firstItem?.productId?.discountPrice?.toLocaleString("vi-VN")} VND
          </p>
        </div>

        {/* Total Amount and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Total
            </p>
            <p className="text-2xl font-bold text-[#FF6B6B]">
              {order.finalAmount?.toLocaleString("vi-VN")} VND
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            {/* View Details Button */}
            <button
              onClick={() => setSelectedOrder(order)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium text-sm cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>

            {/* Buy Again Button */}
            {(order.status === "delivered" ||
              order.status === "cancelled" ||
              order.status === "failed") && (
              <button
                onClick={() => handleBuyAgain(order)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition font-medium text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Buy Again
              </button>
            )}

            {/* Cancel Order Button */}
            {order.status !== "delivered" &&
              order.status !== "cancelled" &&
              order.status !== "failed" && (
                <button
                  onClick={() => handleCancelOrder(order._id, order.status)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
