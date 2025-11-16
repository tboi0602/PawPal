import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "CUSTOMER" },
    image: { type: String },
    name: { type: String },
    phone: { type: Number },
    loyaltyPoints: { type: Number },
    address: { type: Array },
    rank: {
      type: String,
      enum: ["Bronze", "Gold", "Diamond", "Platinum"],
      default: "Bronze",
    },
    isActivate: { type: Boolean, required: true, default: false },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
    toObject: { virtuals: true },
  }
);

export default mongoose.model("User", userSchema);
