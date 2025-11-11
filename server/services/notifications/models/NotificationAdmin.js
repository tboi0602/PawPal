// File: models/Notification.js
import mongoose from "mongoose";

const NotificationAdminSchema = new mongoose.Schema(
  {
    senderId: { type: String, default: "SYSTEM" },
    receiverId: { type: String, default: "ALL" },
    title: { type: String, required: true },
    content: { type: String },
    type: {
      type: String,
      default: "CONFIRM",
      enum: ["CONFIRM", "SALE", "MAINTENANCE"],
    },
  },
  {
    timestamps: true,
  }
);

const NotificationAdmin = mongoose.model(
  "NotificationAdmin",
  NotificationAdminSchema
);
export default NotificationAdmin;
