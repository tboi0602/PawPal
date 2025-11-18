// File: D:\test\reportings\routes\reportRoutes.js
import express from "express";
import {
  getReportByDate,
  getReportByRange,
  getMonthlyReport,
  getQuarterlyReport,
  getYearlyReport,
  generateDailyReport,
  getAllReports,
  getDashboardSummary,
} from "../controllers/reportController.js";

import Report from "../models/Report.js";

const router = express.Router();

router.post("/generate", generateDailyReport);
router.get("/", getReportByDate);
router.get("/all", getAllReports);
router.get("/dashboard", getDashboardSummary);
router.get("/range", getReportByRange);
router.get("/monthly", getMonthlyReport);
router.get("/quarterly", getQuarterlyReport);
router.get("/yearly", getYearlyReport);
router.delete("/clear-all", async (req, res) => {
  try {
    await Report.deleteMany({}); // Xóa TẤT CẢ bản ghi
    res.status(200).json("Đã xóa tất cả báo cáo.");
  } catch (error) {
    res.status(500).json("Lỗi khi xóa.");
  }
});

export default router;
