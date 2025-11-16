import { Tag, Check } from "lucide-react";

export const PromotionSection = ({
  allAvailablePromos,
  bestDiscount,
  handleSelectPromo,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border-2 border-green-200">
      <h2 className="text-lg font-semibold mb-4 border-b-2 border-green-300 pb-3 text-green-700 flex items-center">
        <Tag className="w-6 h-6 mr-2" /> Apply Discount Code (
        {allAvailablePromos.length})
      </h2>

      {allAvailablePromos.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {allAvailablePromos.map((promo) => (
            <div
              key={promo._id}
              onClick={() => handleSelectPromo(promo)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                bestDiscount?.promotionCode === promo.promotionCode
                  ? "border-green-600 bg-green-50 shadow-md ring-2 ring-green-500"
                  : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-bold  text-gray-800">
                  {promo.promotionCode}
                </p>
                {bestDiscount?.promotionCode === promo.promotionCode && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-700 line-clamp-1 mt-1">
                {promo.description}
              </p>
              <p className="text-red-600 font-semibold mt-1">
                Discount: -{promo.actualDiscount.toLocaleString("en-US")}₫
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic text-sm">
          No active promotions available for this order or user rank.
        </p>
      )}

      {/* Nút hủy mã giảm giá */}
      {bestDiscount && (
        <button
          onClick={() => handleSelectPromo(null)}
          className="w-full py-2 mt-4 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          Remove Discount ({bestDiscount.promotionCode})
        </button>
      )}
    </div>
  );
};
