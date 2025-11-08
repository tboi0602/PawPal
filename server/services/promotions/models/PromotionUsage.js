import mongoose from "mongoose";

const promotionUsageSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // liên kết sang bảng đơn hàng (nếu có)
      required: true,
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Mỗi người chỉ được dùng 1 lần / 1 mã
promotionUsageSchema.index({ userId: 1, promotionId: 1 }, { unique: true });

const PromotionUsage = mongoose.model("PromotionUsage", promotionUsageSchema);
export default PromotionUsage;
