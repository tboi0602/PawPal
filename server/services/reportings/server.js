// D:\test\reports\server.js
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import reportRoutes from "./routes/reportRoutes.js";
import { startReportScheduler } from "./jobs/scheduler.js";
import { REPORTING_PORT, MONGO_REPORTING_URI } from "../../configs/config.js";

const app = express();
app.use(express.json());

// Kết nối Database
mongoose
  .connect(MONGO_REPORTING_URI)
  .then(() => {
    console.log("Report Service connected to Database.");
    setTimeout(() => {
      app.listen(REPORTING_PORT, () => {
        console.log(`Report Service running on port: ${REPORTING_PORT}`);
      });
      startReportScheduler();
    }, 5000);
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
// Routes API
app.use("/reports", reportRoutes);
