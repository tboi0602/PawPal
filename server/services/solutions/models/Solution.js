import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  pricingType: {
    type: String,
    enum: ["per_hour", "per_day", "per_kg", "per_session"],
    default: "per_session"
  },
  type: {
    type: String,
    enum: ["caring", "cleaning", "beauty"],
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Solution", solutionSchema);
