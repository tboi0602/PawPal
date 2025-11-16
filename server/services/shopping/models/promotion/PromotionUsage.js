import mongoose from "mongoose";

const promotionUsageSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);


const PromotionUsage = mongoose.model("PromotionUsage", promotionUsageSchema);
export default PromotionUsage;
