import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    images: { type: Array },
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, defaul: 0 },
    stock: { type: Number, required: true },
    attributes: { type: Object, required: true },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Product", productSchema);
