import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    orderId: { type: String },
    requestId: { type: String },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["success", "failed"], default: "failed" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transactionSchema);
