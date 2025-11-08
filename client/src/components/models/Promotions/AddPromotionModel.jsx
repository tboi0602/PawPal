import { useState } from "react";
import { X, Hash, Percent, Clock, CreditCard, Award } from "lucide-react";
import InputForm from "../../inputs/InputForm";
import Swal from "sweetalert2";
import { Loader2 } from "../Loaders/Loader2";
import { addPromotion } from "../../../services/promotions/promotionAPI";

export const AddPromotionModel = ({ setOpenAdd, reloadPromotions }) => {
  const [promoData, setPromoData] = useState({
    promotionCode: "",
    description: "",
    discountType: "percent",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    usedCount: 0,
    rank: "All",
    status: "upcoming",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    setMessage("");

    // Validate required fields
    if (
      !promoData.promotionCode.trim() ||
      !promoData.description.trim() ||
      !promoData.discountValue ||
      !promoData.startDate ||
      !promoData.endDate
    ) {
      setIsLoading(false);
      setMessage("Please fill in all required fields!");
      return;
    }

    // Validate dates
    const start = new Date(promoData.startDate);
    const end = new Date(promoData.endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setIsLoading(false);
      setMessage("Please enter valid dates!");
      return;
    }

    if (end <= start) {
      setIsLoading(false);
      setMessage("End date must be after start date!");
      return;
    }

    if (start < now) {
      setIsLoading(false);
      setMessage("Start date cannot be in the past!");
      return;
    }

    // Validate numeric values
    if (promoData.discountValue <= 0) {
      setIsLoading(false);
      setMessage("Discount value must be greater than 0!");
      return;
    }

    if (promoData.discountType === "percent" && promoData.discountValue > 100) {
      setIsLoading(false);
      setMessage("Percentage discount cannot exceed 100%!");
      return;
    }

    if (
      promoData.minOrderAmount < 0 ||
      promoData.maxDiscountAmount < 0 ||
      promoData.usageLimit < 0
    ) {
      setIsLoading(false);
      setMessage("Values cannot be negative!");
      return;
    }

    try {
      const formattedData = {
        ...promoData,
        promotionCode: promoData.promotionCode.trim().toUpperCase(),
        description: promoData.description.trim(),
        discountValue: Number(promoData.discountValue),
        minOrderAmount: Number(promoData.minOrderAmount),
        maxDiscountAmount: Number(promoData.maxDiscountAmount),
        usageLimit: Number(promoData.usageLimit),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        isActive: true,
        usageCount: 0,
      };

      const dataRes = await addPromotion(formattedData);

      if (!dataRes.success) {
        setMessage(dataRes.message || "Failed to add promotion.");
        setIsLoading(false);
        Swal.fire({
          toast: true,
          position: "top-right",
          icon: "error",
          title: "Addition Failed!",
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
        title: dataRes.message || "New promotion added successfully!",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });

      setPromoData({
        promotionCode: "",
        description: "",
        discountType: "percent",
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        startDate: "",
        endDate: "",
        usageLimit: 0,
        rank: "Bronze",
      });

      reloadPromotions();
      setOpenAdd(false);
    } catch (error) {
      setMessage(`An unexpected error occurred: ${error.message}`);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative z-50 w-full max-w-2xl bg-white text-black shadow-2xl rounded-xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300">
        {/* Close button */}
        <X
          className="absolute top-4 right-4 cursor-pointer text-neutral-600 hover:text-black transition duration-200"
          onClick={() => setOpenAdd(false)}
          size={24}
        />

        {/* Header */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black border-b border-black pb-3">
          Add New Promotion
        </h2>

        {/* Error Message */}
        {message && (
          <p className="text-center text-red-600 mb-4 font-medium">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={promoData.promotionCode}
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
                  value={promoData.discountType}
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
                  promoData.discountType === "percent"
                    ? "Enter percentage"
                    : "Enter amount"
                }
                value={promoData.discountValue}
                Icon={CreditCard}
                onChange={handleChange}
                className="border-neutral-300 focus:border-black focus:ring-0"
                required
                min="0"
                max={promoData.discountType === "percent" ? "100" : undefined}
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
                value={promoData.minOrderAmount}
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
                value={promoData.maxDiscountAmount}
                Icon={CreditCard}
                onChange={handleChange}
                className="border-neutral-300 focus:border-black focus:ring-0"
                min="0"
              />
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">
                Start Date *
              </label>
              <InputForm
                type="datetime-local"
                name="startDate"
                value={promoData.startDate}
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
                value={promoData.endDate}
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
                value={promoData.usageLimit}
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
                  value={promoData.rank}
                  onChange={handleChange}
                  className="w-full p-2.5 pl-10 border rounded-lg focus:border-black focus:ring-0"
                >
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
                value={promoData.description}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-lg focus:border-black focus:ring-0 min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 mt-6 rounded-lg text-xl font-bold transition duration-200 bg-black text-white 
            hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-500`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 />
              </div>
            ) : (
              "Save Promotion"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
