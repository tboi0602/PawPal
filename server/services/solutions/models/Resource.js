import mongoose from "mongoose";
import { type } from "os";

const resourceSchema = new mongoose.Schema({
  solution: {
    _id: {type: String },
    name: {type: String},
    description: {type: String},
    solutionType: {type: String},
    duration: {type: Number},
    price: {type: Number},
    pricingType: {type: String},
    type: {type: String},
  },
  name: { type: String, required: true },
  maxCapacity: { type: Number, required: true },
  location: {
    type: String,
    required: true
  },
  dayOfWeek: { type: [String], enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], default: "Monday" },
  startTime: {
    type: String,
    default: "09:00",
    match: /^([0-1]\d|2[0-3]):([0-5]\d)$/
  },
  endTime: {
    type: String,
    default: "20:00",
    match: /^([0-1]\d|2[0-3]):([0-5]\d)$/
  },
  isAvailable: { type: Boolean, default: true },
  type: {
    type: String,
    enum: ["Basic", "Premium"],
    default: "Basic"
  },
  upcharge: {
    type: Number,
    default: 0
  },
},
  { timestamps: true });

export default mongoose.model("Resource", resourceSchema);
