import mongoose from "mongoose";

const verifySchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    verificationToken: { type: String, unique: true, sparse: true },
    verificationExpires: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Verify", verifySchema);
