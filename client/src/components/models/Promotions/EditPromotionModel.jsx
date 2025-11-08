import { useEffect, useState } from "react";
import {
  getPromotion,
  editPromotion,
} from "../../../services/promotions/promotionAPI";
import { X, Hash, Percent, Clock, CreditCard, Award } from "lucide-react";
import InputForm from "../../inputs/InputForm";
import { Loader2 } from "../Loaders/Loader2";
import Swal from "sweetalert2";

export const EditPromotionModel = ({
  promotionId,
  setOpenEdit,
  reloadPromotions,
}) => {
  const [promotion, setPromotion] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPromotion = async () => {
      const res = await getPromotion(promotionId);
      if (!res.success) {
        setMessage(res.message);
        setPromotion(null);
      } else {
        setPromotion({
          ...res.promotion,
          startDate: new Date(res.promotion.startDate).toISOString().substring(0, 19),
          endDate: new Date(res.promotion.endDate).toISOString().substring(0, 19),
        });
        setMessage("");
      }
    };
    loadPromotion();
  }, [promotionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validate dates
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    const now = new Date();

    if (end <= start) {
      setIsLoading(false);
      setMessage("End date must be after start date!");
      return;
    }

    if (promotion.discountType === "percent" && promotion.discountValue > 100) {
      setIsLoading(false);
      setMessage("Percentage discount cannot exceed 100%!");
      return;
    }
    
    // Update status based on dates and usage
    if (now < start) {
      promotion.status = "upcoming";
    } else if (now > end || (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit)) {
      promotion.status = "expired";
    } else {
      promotion.status = "active";
    }

    try {
      const formattedData = {
        ...promotion,
        promotionCode: promotion.promotionCode.trim().toUpperCase(),
        description: promotion.description.trim(),
        discountValue: Number(promotion.discountValue),
        minOrderAmount: Number(promotion.minOrderAmount),
        maxDiscountAmount: Number(promotion.maxDiscountAmount),
        usageLimit: Number(promotion.usageLimit),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
      const dataRes = await editPromotion(promotionId, formattedData);

      if (!dataRes.success) {
        setMessage(dataRes.message || "Failed to update promotion.");
        setIsLoading(false);
        Swal.fire({
          toast: true,
          position: "top-right",
          icon: "error",
          title: "Update Failed!",
          text: dataRes.message,
          showConfirmButton: false,
          timer: 5000,
        });
        return;
      }

      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: dataRes.message || "Promotion updated successfully!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      reloadPromotions();
      setOpenEdit(false);
    } catch (error) {
      setMessage(`Update error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative z-50 w-full max-w-2xl bg-white text-black shadow-2xl rounded-xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300">
        {/* Close button */}
        <X
          className="absolute top-4 right-4 cursor-pointer text-neutral-600 hover:text-black transition duration-200"
          onClick={() => setOpenEdit(false)}
          size={24}
        />

        {/* Header */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black border-b border-black pb-3">
          Edit Promotion
        </h2>

        {/* Error Message */}
        {message && (
          <p className="text-center text-red-600 mb-4 font-medium">{message}</p>
        )}

        {promotion ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Promotion Code */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Promotion Code *
                </label>
                <InputForm
                  type="text"
                  name="promotionCode"
                  placeholder="Enter promotion code"
                  value={promotion.promotionCode}
                  Icon={Hash}
                  onChange={handleChange}
                  className="border-neutral-300 focus:border-black focus:ring-0"
                  required
                />
              </div>

              {/* Discount Type Select */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Discount Type *
                </label>
                <div className="relative">
                  <select
                    name="discountType"
                    value={promotion.discountType}
                    onChange={handleChange}
                    className="w-full p-2.5 pl-10 border rounded-lg focus:border-black focus:ring-0"
                    required
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                  <Percent
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>
              </div>

              {/* Discount Value */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Discount Value *
                </label>
                <InputForm
                  type="number"
                  name="discountValue"
                  placeholder={
                    promotion.discountType === "percent"
                      ? "Enter percentage"
                      : "Enter amount"
                  }
                  value={promotion.discountValue}
                  Icon={CreditCard}
                  onChange={handleChange}
                  className="border-neutral-300 focus:border-black focus:ring-0"
                  required
                  min="0"
                  max={promotion.discountType === "percent" ? "100" : undefined}
                />
              </div>

              {/* Minimum Order Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Minimum Order Amount
                </label>
                <InputForm
                  type="number"
                  name="minOrderAmount"
                  placeholder="Enter minimum amount"
                  value={promotion.minOrderAmount}
                  Icon={CreditCard}
                  onChange={handleChange}
                  className="border-neutral-300 focus:border-black focus:ring-0"
                  min="0"
                />
              </div>

              {/* Maximum Discount Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Maximum Discount Amount
                </label>
                <InputForm
                  type="number"
                  name="maxDiscountAmount"
                  placeholder="Enter maximum discount"
                  value={promotion.maxDiscountAmount}
                  Icon={CreditCard}
                  onChange={handleChange}
                  className="border-neutral-300 focus:border-black focus:ring-0"
                  min="0"
                />
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Start Date
                </label>
                <InputForm
                  type="datetime-local"
                  name="startDate"
                  value={promotion.startDate}
                  Icon={Clock}
                  onChange={handleChange}
                  className="border-neutral-300 focus:border-black focus:ring-0"
                  required
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  End Date *
                </label>
                <InputForm
                  type="datetime-local"
                  name="endDate"
                  value={promotion.endDate}
                  Icon={Clock}
                  onChange={handleChange}
                  className="border-neutral-300 focus:border-black focus:ring-0"
                  required
                />
              </div>

              {/* Usage Limit */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Usage Limit
                </label>
                <InputForm
                  type="number"
                  name="usageLimit"
                  placeholder="Enter usage limit"
                  value={promotion.usageLimit}
                  Icon={Hash}
                  onChange={handleChange}
                  className="border-neutral-300 focus:border-black focus:ring-0"
                  min="0"
                />
              </div>

              {/* Rank Select */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Required Rank
                </label>
                <div className="relative">
                  <select
                    name="rank"
                    value={promotion.rank}
                    onChange={handleChange}
                    className="w-full p-2.5 pl-10 border rounded-lg focus:border-black focus:ring-0"
                  >
                    <option value="All">All</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                  <Award
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-semibold text-black">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Enter promotion description"
                  value={promotion.description}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:border-black focus:ring-0 min-h-[100px]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-end gap-4 mt-6">
              <button
                onClick={() => setOpenEdit(false)}
                type="button"
                className="px-6 py-2.5 rounded-lg text-white font-semibold transition duration-200 bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg text-white font-semibold transition duration-200 bg-black hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-500"
              >
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 />
                  </div>
                ) : (
                  "Update Promotion"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center p-10 text-red-600 font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
