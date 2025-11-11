import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import notificationRoutes from "./routes/notificationRoutes.js";
import {
  NOTIFICATION_PORT,
  MONGO_NOTIFICATION_URI,
} from "../../configs/config.js";

const app = express();

app.use(express.json());

mongoose
  .connect(MONGO_NOTIFICATION_URI)
  .then(() => {
    console.log("Notification Service connected to Database.");

    app.listen(NOTIFICATION_PORT, () => {
      console.log(`Notification Service running on port: ${NOTIFICATION_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });

app.use("/notifications", notificationRoutes);
