import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: Boolean, required: true },
    weight: { type: String },
    specialNotes: { type: String },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Pet", petSchema);
