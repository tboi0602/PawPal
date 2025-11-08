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
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ["fixed", "percent"],
      default: "percent",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "expired"],
      default: "upcoming",
    },
    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rank: {
      type: String,
      enum: ["All", "Gold", "Diamond", "Platinum"],
      default: "All",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Promotion", promotionSchema);
