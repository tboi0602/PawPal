import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    comment: { type: String, require: true },
    rate: { type: Number, require: true },

  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Review", reviewSchema);
