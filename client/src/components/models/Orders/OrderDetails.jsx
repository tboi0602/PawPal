import React from "react";
import {
  X,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
} from "lucide-react";

export const OrderDetails = ({ order, setOpenDetails }) => {
  if (!order) return null;

  const calculateSubtotal = () => {
    return order.orderItems.reduce((acc, item) => {
      return acc + item.productId.discountPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "confirmed":
        return "bg-blue-200 text-blue-800";
      case "delivering":
        return "bg-indigo-200 text-indigo-800";
      case "delivered":
        return "bg-green-200 text-green-800";
      case "cancelled":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Modal content container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-black text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Order Details</h2>
              <p className="text-pink-100 text-sm mt-1">
                #{order._id?.slice(-8).toUpperCase()}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-bold capitalize  ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Order Info Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold">ORDER ID</p>
                <p className="font-mono text-sm font-bold text-gray-900">
                  {order._id}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold">DATE</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            {/* Delivery Address Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg text-gray-900">
                  Delivery Address
                </h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Customer Name</p>
                    <p className="font-semibold text-gray-900">
                      {order.address?.fullName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Phone Number</p>
                    <p className="font-semibold text-gray-900">
                      {order.address?.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Full Address</p>
                    <p className="font-semibold text-gray-900 leading-relaxed">
                      {order.address?.address || "N/A"}
                    </p>
                  </div>
                </div>
                {order.address?.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-600 text-sm">Special Notes</p>
                    <p className="text-sm italic text-gray-700 bg-yellow-50 p-2 rounded mt-1">
                      {order.address.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg text-gray-900">
                  Products ({order.orderItems.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {order.orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={item.productId?.images?.[0] || "/placeholder.png"}
                      alt={item.productId?.name || "Product"}
                      className="w-14 h-14 object-cover rounded-md border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {item.productId?.name || "Product Name"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.productId?.discountPrice?.toLocaleString(
                          "vi-VN"
                        ) || 0}{" "}
                        VND
                        <span className="ml-2 text-gray-500">
                          × {item.quantity}
                        </span>
                      </p>
                    </div>
                    <p className="font-bold text-red-600 text-right shrink-0">
                      {(
                        item.productId?.discountPrice * item.quantity
                      ).toLocaleString("vi-VN")}
                      <span className="text-xs text-gray-600 ml-1">VND</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg text-gray-900">
                  Payment Summary
                </h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {subtotal.toLocaleString("vi-VN")} VND
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-semibold text-gray-900">
                    {order.shippingFee?.toLocaleString("vi-VN") || "Free"} VND
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-red-600">
                      - {order.discountAmount?.toLocaleString("vi-VN") || 0} VND
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center bg-white rounded p-2">
                  <span className="font-bold text-gray-900">Final Amount</span>
                  <span className="font-bold text-2xl text-red-600">
                    {order.finalAmount?.toLocaleString("vi-VN") || 0}
                    <span className="text-sm text-gray-600 ml-1">VND</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Payment Method
                  </p>
                  {order.paymentMethod?.method === "cod" ? (
                    <p className="text-lg font-bold mt-1 text-green-600">
                      Cash on Delivery (COD)
                    </p>
                  ) : (
                    <p className="text-lg font-bold mt-1 text-pink-700">MOMO</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Payment Status
                  </p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      order.paymentMethod?.status === "Paid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.paymentMethod?.status?.toUpperCase() || "N/A"}
                  </p>
                </div>
              </div>
              {order.promotionCode && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-gray-600 text-sm font-semibold">
                    Promotion Code
                  </p>
                  <p className="text-sm font-mono font-bold text-purple-600 mt-1">
                    {order.promotionCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer/Close Action */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            className="px-6 py-2 button-black rounded-lg font-semibold shadow-md"
            onClick={() => setOpenDetails(null)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
