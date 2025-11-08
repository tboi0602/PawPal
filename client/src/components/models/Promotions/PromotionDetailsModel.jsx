import { useEffect, useState } from "react";
import { getPromotion } from "../../../services/promotions/promotionAPI";
import {
  X,
  Hash,
  Percent,
  Clock,
  CreditCard,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "../../../utils/formatDate";

export const PromotionDetailsModel = ({ promotionId, setOpenDetails }) => {
  const [promotion, setPromotion] = useState(null);
  const [message, setMessage] = useState("");

  // Load promotion info
  useEffect(() => {
    const loadData = async () => {
      const res = await getPromotion(promotionId);
      if (!res.success) {
        setMessage(res.message);
        return;
      }
      setPromotion(res.promotion);
    };
    loadData();
  }, [promotionId]);

  const DetailItem = ({ Icon, label, value }) => (
    <div className="flex items-center gap-2 p-3 transition border-b border-neutral-100 last:border-b-0">
      <Icon size={18} className="text-neutral-600" />
      <span className="font-medium text-neutral-800 w-32 shrink-0">
        {label}:
      </span>
      <span className="text-black wrap-break-words grow">{value}</span>
    </div>
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get promotion status styling
  const getPromotionStatus = () => {
    if (!promotion) return { text: "Unknown", color: "neutral" };

    switch (promotion.status) {
      case "active":
        return { text: "Active", color: "green" };
      case "expired":
        return {
          text:
            promotion.usageCount >= promotion.usageLimit
              ? "Fully Used"
              : "Expired",
          color: "red",
        };
      case "upcoming":
        return { text: "Upcoming", color: "yellow" };
      default:
        return { text: "Unknown", color: "neutral" };
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
      <div className="relative z-50 w-full max-w-4xl bg-white text-black shadow-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300 transform scale-100">
        {/* Close button */}
        <X
          className="absolute top-4 right-4 cursor-pointer text-neutral-600 hover:text-black transition duration-200"
          onClick={() => setOpenDetails(false)}
          size={24}
        />

        {/* Header */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black">
          Promotion Details
        </h2>

        {/* Message if error */}
        {!promotion ? (
          <div className="text-center p-10 text-black font-semibold">
            {message || "Promotion data could not be loaded."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border border-neutral-300 rounded-xl p-4 md:p-6 bg-neutral-50">
              <div className="flex flex-col items-center justify-start py-4 bg-white rounded-lg shadow-md border border-neutral-200 lg:col-span-1">
                {/* Promotion Status Banner */}
                {promotion && (
                  <div
                    className={`w-full text-center py-2 mb-4 ${
                      getPromotionStatus().color === "green"
                        ? "bg-green-100 text-green-800"
                        : getPromotionStatus().color === "yellow"
                        ? "bg-yellow-100 text-yellow-800"
                        : getPromotionStatus().color === "red"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getPromotionStatus().text}
                  </div>
                )}

                {/* Promotion Code Display */}
                <div className=" bg-black p-1 px-3 rounded-lg flex items-center justify-center text-white border-4 border-black">
                  <div className="text-center">
                    <span className="text-lg font-bold">
                      {promotion.promotionCode}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="mt-4 text-center space-y-2">
                  <h3 className="text-2xl font-bold text-black">
                    {promotion.discountType === "percent"
                      ? `${promotion.discountValue}% OFF`
                      : formatCurrency(promotion.discountValue)}
                  </h3>

                  <p className="text-neutral-600">
                    {promotion.discountType === "percent" &&
                      promotion.maxDiscountAmount && (
                        <span className="block text-sm">
                          Max: {formatCurrency(promotion.maxDiscountAmount)}
                        </span>
                      )}
                  </p>

                  <p
                    className={`text-sm font-medium px-3 py-1 rounded-full mt-2 inline-block
                    ${
                      promotion.rank
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    <Award size={14} className="inline-block mr-1" />
                    {promotion.rank || "All Ranks"}
                  </p>
                </div>

                <div className="mt-4 text-center space-y-2">
                  <p className="flex items-center gap-2 justify-center">
                    <Users size={16} />
                    <span className="font-bold">
                      {promotion.usageCount || 0}
                    </span>{" "}
                    /<span>{promotion.usageLimit || "∞"}</span>
                    <span className="text-neutral-600">Uses</span>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {/* Promotion Details */}
                <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">
                  <h4 className="font-bold text-lg p-3 bg-black/80 text-white">
                    Promotion Details
                  </h4>
                  <div className="divide-y divide-neutral-100">
                    <DetailItem
                      Icon={Hash}
                      label="Promotion ID"
                      value={promotion._id}
                    />
                    <DetailItem
                      Icon={CreditCard}
                      label="Min Order Amount"
                      value={
                        promotion.minOrderAmount
                          ? formatCurrency(promotion.minOrderAmount)
                          : "No minimum"
                      }
                    />
                    <DetailItem
                      Icon={Calendar}
                      label="Start Date"
                      value={formatDate(
                        promotion.startDate,
                        "dd/mm/yyyy HH:MM"
                      )}
                    />
                    <DetailItem
                      Icon={Calendar}
                      label="End Date"
                      value={formatDate(promotion.endDate, "dd/mm/yyyy HH:MM")}
                    />
                  </div>
                </div>

                {/* Description and Conditions */}
                <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">
                  <h4 className="font-bold text-lg p-3 bg-black/80 text-white">
                    Description & Conditions
                  </h4>
                  <div className="p-4">
                    <p className="text-neutral-800 whitespace-pre-line">
                      {promotion.description}
                    </p>

                    <div className="mt-4 space-y-2">
                      <p className="flex items-start gap-2 text-sm">
                        <CheckCircle2
                          size={16}
                          className="text-green-500 mt-1"
                        />
                        {promotion.discountType === "percent"
                          ? `${promotion.discountValue}% discount on your order`
                          : `${formatCurrency(
                              promotion.discountValue
                            )} discount on your order`}
                      </p>
                      {promotion.minOrderAmount && (
                        <p className="flex items-start gap-2 text-sm">
                          <AlertTriangle
                            size={16}
                            className="text-yellow-500 mt-1"
                          />
                          Minimum order amount:{" "}
                          {formatCurrency(promotion.minOrderAmount)}
                        </p>
                      )}
                      {promotion.maxDiscountAmount &&
                        promotion.discountType === "percent" && (
                          <p className="flex items-start gap-2 text-sm">
                            <AlertTriangle
                              size={16}
                              className="text-yellow-500 mt-1"
                            />
                            Maximum discount amount:{" "}
                            {formatCurrency(promotion.maxDiscountAmount)}
                          </p>
                        )}
                      {promotion.usageLimit && (
                        <p className="flex items-start gap-2 text-sm">
                          <AlertTriangle
                            size={16}
                            className="text-yellow-500 mt-1"
                          />
                          Limited to {promotion.usageLimit} uses
                        </p>
                      )}
                      {promotion.rank && (
                        <p className="flex items-start gap-2 text-sm">
                          <AlertTriangle
                            size={16}
                            className="text-yellow-500 mt-1"
                          />
                          Requires {promotion.rank} rank or higher
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
