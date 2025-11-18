// D:\test\reports\jobs\scheduler.js
// import cron from "node-cron";
// import { generateDailyReport } from "./aggregationJob.js";

// export const startReportScheduler = () => {
//   console.log("Scheduler (Lịch chạy) đã được kích hoạt.");

//   // Lên lịch chạy vào 2 giờ sáng mỗi ngày
//   // (Cron syntax: phút giờ ngày tháng thứ)
//   cron.schedule("0 2 * * *", () => {
//     console.log("Đến giờ chạy cron job (2 giờ sáng). Bắt đầu tính toán...");
//     generateDailyReport();
//   });

//   // --- TÙY CHỌN: Chạy ngay khi khởi động (để test) ---
//   // Bạn có thể bật dòng này để test ngay mà không cần chờ 2h sáng
//   generateDailyReport();
// };

// File: D:\test\reports\jobs\scheduler.js
import cron from "node-cron";
import { generateDailyReport } from "./aggregationJob.js";

// SỬA: Import thêm Report model để xóa data cũ
import Report from "../models/Report.js";

/**
 * (Hàm test) Hàm này sẽ tạo báo cáo cho ngày hôm qua
 */
async function runBackfillTest() {
  console.log("--- BẮT ĐẦU TẠO BÁO CÁO NGÀY HÔM QUA ---");

  // Tạo báo cáo cho ngày hôm qua
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  console.log(
    `Đang tạo báo cáo cho ngày: ${yesterday.toISOString().split("T")[0]}`
  );
  await generateDailyReport(yesterday);

  console.log(`--- KẾT THÚC: Đã tạo báo cáo cho ngày hôm qua ---`);
}

export const startReportScheduler = () => {
  console.log("Scheduler (Lịch chạy) đã được kích hoạt.");

  // SỬA: Tắt cron job thật
  // cron.schedule("0 2 * * *", () => {
  //     console.log("Đến giờ chạy cron job (2 giờ sáng). Bắt đầu tính toán...");
  //     generateDailyReport(); // Comment: Hàm này giờ sẽ tự lấy ngày hôm qua
  // });

  // --- TÙY CHỌN: Chạy ngay khi khởi động (để test) ---
  // SỬA: Bật hàm test
  runBackfillTest();
};
