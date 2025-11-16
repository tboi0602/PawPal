import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    id: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: Array },
  },

  solutionId: { type: String, required: true },
  solutionName: { type: String },

  dateStarts: { type: Date, required: true },
  dateEnd: { type: Date },

  pets: [{
    petId: { type: String, required: true },
    petName: { type: String },
    resourceId: { type: String, required: true },
    resourceName: { type: String },
    subTotal: { type: Number, default: 0 }
  }],

  totalAmount: { type: Number, required: true },

  hireShipper: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  }
},
  { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
