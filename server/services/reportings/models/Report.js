// File: D:\test\reportings\models\Report.js
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reportDate: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    // --- ĐÃ SỬA LẠI CHO KHỚP RDM ---
    totalQuantity: {
      // Tổng số lượng sản phẩm bán ra
      type: Number,
      default: 0,
    },
    totalAmountProducts: {
      // Tổng doanh thu từ sản phẩm
      type: Number,
      default: 0,
    },
    usageCount: {
      // Tổng số lượt sử dụng dịch vụ
      type: Number,
      default: 0,
    },
    totalAmountServices: {
      // Tổng doanh thu từ dịch vụ
      type: Number,
      default: 0,
    },
    totalRevenue: {
      // Tổng doanh thu (Products + Services)
      type: Number,
      default: 0,
    },

    // --- BỔ SUNG THEO YÊU CẦU MỚI ---
    totalProfit: {
      // Thêm: Tổng lợi nhuận được tính bằng cách doanh thu nhân với 20%
      // Ví dụ ngày hôm nay admin thêm 10 sản phẩm tổng giá thêm là 1,000,000 VND
      // thì tổng lợi nhuận sẽ là 200,000 VND(nếu bán hết). Không hết sẽ tính là: Tổng tiền bỏ ra hôm nay - Tổng doanh thu hôm nay
      // Nếu âm thì ghi nhận lỗ. Nếu dương thì ghi nhận lãi. Nếu bằng 0 thì hòa vốn.
      type: Number,
      default: 0,
    },
    totalUsers: {
      // Thêm: Tổng số người dùng (snapshot)
      type: Number,
      default: 0,
    },
    // --- KẾT THÚC PHẦN BỔ SUNG ---

    // --- THÊM CÁC TRƯỜNG CHO ĐỀ BÀI (PDF) ---
    totalOrders: {
      // Thêm: Tổng số đơn hàng
      type: Number,
      default: 0,
    },
    newUsers: {
      // Thêm: Số lượng người dùng mới đăng ký trong ngày
      type: Number,
      default: 0,
    },
    // --- KẾT THÚC PHẦN THÊM ---
    topProducts: {
      type: [Object], // Mảng các productName, quantity sold
      default: [],
    },
    // Mảng các productId

    topServices: {
      // Mảng các serviceId
      type: [Object], // Mảng các serviceName,  quantity booked
      default: [],
    },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
    toObject: { virtuals: true },
  }
);

const Report = mongoose.model("Reporting", ReportSchema);
// Tên bảng là "Reporting"
export default Report;
