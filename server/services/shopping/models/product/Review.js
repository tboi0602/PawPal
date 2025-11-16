import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      id: { type: String, require: true },
      name: { type: String, require: true },
      image: { type: String, require: true },
    },
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
