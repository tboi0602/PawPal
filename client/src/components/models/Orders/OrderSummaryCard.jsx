export const OrderSummaryCard = ({
  orderItems,
  subtotal,
  shippingFee,
  loadingFee,
  discountAmount,
  bestDiscount,
  totalAmount,
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl h-fit border-2 border-gray-200 lg:sticky lg:top-16">
      <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-3 text-black">
        Order Summary
      </h2>

      {/* Item List */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
        {orderItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0"
          >
            <img
              src={item?.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md border border-gray-300"
            />
            <div className="grow">
              <p className="font-semibold text-sm line-clamp-2 text-gray-800">
                {item.name}
              </p>
              <div className="font-bold text-red-600 text-base mt-1 flex gap-2 items-center">
                {item?.price?.toLocaleString("vi-VN")}₫
                <p className="text-xs text-gray-500">x {item.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Totals */}
      <div className="mt-8 pt-4 border-t-2 border-black space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-lg text-gray-700">
          <span>Subtotal:</span>
          <span className="font-medium">
            {subtotal?.toLocaleString("vi-VN")}₫
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between text-lg items-center">
          <span className="font-semibold text-green-600">
            Discount
            {bestDiscount && (
              <span className="text-sm text-gray-500 ml-2">
                ({bestDiscount.promotionCode})
              </span>
            )}
          </span>
          <span className="font-bold text-green-600">
            {discountAmount
              ? `-${discountAmount?.toLocaleString("vi-VN")}₫`
              : "0₫"}
          </span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between text-lg text-gray-700 items-center">
          <span>Shipping Fee:</span>
          <span className="font-medium flex items-center">
            {loadingFee ? (
              <div className="text-green-600">Calculating...</div>
            ) : shippingFee > 0 ? (
              shippingFee?.toLocaleString("vi-VN") + "₫"
            ) : (
              "FreeShip"
            )}
          </span>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between text-3xl font-extrabold text-red-600 pt-4 border-t border-gray-300">
          <span>TOTAL:</span>
          <span>{totalAmount?.toLocaleString("vi-VN")}₫</span>
        </div>
      </div>
    </div>
  );
};
