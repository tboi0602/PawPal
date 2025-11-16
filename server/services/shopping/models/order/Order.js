import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    shippingFee: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    paymentMethod: {
      method: {
        type: String,
        required: true,
        default: "cod",
        enum: ["momo", "cod"],
      },
      status: { type: String, default: "unpaid", enum: ["unpaid", "paid"] },
    },
    address: { type: Object, required: true },
    status: {
      type: String,
      default: "pending",
      enum: [
        "pending",
        "confirmed",
        "delivering",
        "delivered",
        "cancelled",
        "failed",
      ],
    },
    promotionCode: { type: String },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Order", orderSchema);
