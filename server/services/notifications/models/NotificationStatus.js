// File: models/Notification.js
import mongoose from "mongoose";

const NotificationStatusSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationAdmin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationStatus = mongoose.model(
  "NotificationStatus",
  NotificationStatusSchema
);
export default NotificationStatus;
