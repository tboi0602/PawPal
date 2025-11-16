import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    promotionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, required: true, trim: true },
    discountType: {
      type: String,
      required: true,
      enum: ["fixed", "percent"],
      default: "percent",
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["upcoming", "active", "expired", "fully_used"],
      default: "upcoming",
    },
    usageLimit: { type: Number, default: 0, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    rank: {
      type: String,
      enum: ["All", "Bronze", "Gold", "Diamond", "Platinum"],
      default: "All",
    },
  },
  {
    timestamps: true,
  }
);

// Tự động cập nhất status dựa trên ngày hiện tại
promotionSchema.virtual("currentStatus").get(function () {
  const now = new Date();
  const start = this.startDate;
  const end = this.endDate;

  if (now < start) {
    return "upcoming";
  }

  if (this.usageLimit > 0 && this.usageCount >= this.usageLimit) {
    return "fully_used";
  }
  if (now > end) {
    return "expired";
  }
  return "active";
});

export default mongoose.model("Promotion", promotionSchema);
