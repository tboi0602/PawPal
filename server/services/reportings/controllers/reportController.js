// File: D:\test\reportings\controllers\reportController.js
import Report from "../models/Report.js";
import {
  SHOPPING_TARGET,
  SOLUTIONS_TARGET,
  USER_TARGET,
} from "../../../configs/config.js";

/**
 * Helper function to fetch data from other services with auth headers
 */
const fetchFromService = async (url, method = "GET", headers = {}) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error.message);
    return null;
  }
};

/**
 * Generate comprehensive daily report by aggregating data from all services
 * Fetches: Orders (Shopping), Bookings (Solutions), Users (Users)
 */
export const generateDailyReport = async (req, res) => {
  try {
    const authHeaders = {
      "Content-Type": "application/json",
      ["x-user-id"]: req.headers["x-user-id"],
      ["x-user-role"]: req.headers["x-user-role"],
      ["x-user-activate"]: req.headers["x-user-activate"],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`Generating report for ${today.toISOString()}`);

    // ===== FETCH DATA FROM SHOPPING SERVICE (Orders) =====
    const ordersData = await fetchFromService(
      `${SHOPPING_TARGET}/orders?status=completed`,
      "GET",
      authHeaders
    );
    console.log("Orders data:", ordersData?.success ? "✓" : "✗");

    // ===== FETCH DATA FROM SOLUTIONS SERVICE (Bookings) =====
    const bookingsData = await fetchFromService(
      `${SOLUTIONS_TARGET}/booking?status=confirmed`,
      "GET",
      authHeaders
    );
    console.log("Bookings data:", bookingsData?.success ? "✓" : "✗");

    // ===== FETCH DATA FROM USERS SERVICE =====
    const usersData = await fetchFromService(
      `${USER_TARGET}/users`,
      "GET",
      authHeaders
    );
    console.log("Users data:", usersData?.success ? "✓" : "✗");

    // ===== AGGREGATE SHOPPING DATA =====
    let totalQuantity = 0;
    let totalAmountProducts = 0;
    let totalOrders = 0;
    const topProducts = {};

    if (ordersData?.success && ordersData.orders) {
      const todayOrders = ordersData.orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today && orderDate < tomorrow;
      });

      totalOrders = todayOrders.length;

      todayOrders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            totalQuantity += item.quantity || 0;
            totalAmountProducts += (item.price || 0) * (item.quantity || 0);

            // Track top products
            const productName = item.productName || item.productId || "Unknown";
            topProducts[productName] =
              (topProducts[productName] || 0) + (item.quantity || 0);
          });
        }
      });
    }

    // ===== AGGREGATE SOLUTIONS DATA =====
    let usageCount = 0;
    let totalAmountServices = 0;
    const topServices = {};

    if (bookingsData?.success && bookingsData.bookings) {
      const todayBookings = bookingsData.bookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= today && bookingDate < tomorrow;
      });

      usageCount = todayBookings.length;

      todayBookings.forEach((booking) => {
        totalAmountServices += booking.totalAmount || 0;

        // Track top services
        const serviceName = booking.solutionName || "Unknown";
        topServices[serviceName] = (topServices[serviceName] || 0) + 1;
      });
    }

    // ===== AGGREGATE USERS DATA =====
    let totalUsers = 0;
    let newUsers = 0;

    if (usersData?.success) {
      const users = usersData.users || usersData.data || [];
      totalUsers = users.length;

      // Count new users registered today
      newUsers = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= today && createdAt < tomorrow;
      }).length;
    }

    // ===== CALCULATE TOTALS =====
    const totalRevenue = totalAmountProducts + totalAmountServices;
    const totalProfit = totalRevenue * 0.2; // 20% profit margin

    // Convert objects to arrays
    const topProductsArray = Object.entries(topProducts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10

    const topServicesArray = Object.entries(topServices)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10

    // ===== CREATE OR UPDATE REPORT =====
    const report = await Report.findOneAndUpdate(
      {
        reportDate: {
          $gte: today,
          $lt: tomorrow,
        },
      },
      {
        reportDate: today,
        totalQuantity,
        totalAmountProducts,
        usageCount,
        totalAmountServices,
        totalRevenue,
        totalProfit,
        totalUsers,
        totalOrders,
        newUsers,
        topProducts: topProductsArray,
        topServices: topServicesArray,
      },
      { upsert: true, new: true }
    );

    console.log("Report generated successfully:", report._id);

    return res.status(200).json({
      success: true,
      message: "Daily report generated successfully",
      report,
      summary: {
        date: today.toISOString().split("T")[0],
        totalRevenue,
        totalProfit,
        totalOrders,
        totalBookings: usageCount,
        newUsers,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating report",
      error: error.message,
    });
  }
};

// --- HÀM getReportByDate KHÔNG ĐỔI ---
export const getReportByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json("Vui lòng cung cấp ngày (date).");
    }
    const startOfDay = new Date(date + "T00:00:00Z");
    const endOfDay = new Date(date + "T23:59:59Z");
    const report = await Report.findOne({
      reportDate: { $gte: startOfDay, $lte: endOfDay },
    });
    if (!report) {
      return res.status(404).json("Không tìm thấy báo cáo cho ngày này.");
    }
    res.status(200).json(report);
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo ngày:", error);
    res.status(500).json("Lỗi server");
  }
};

/**
 * API: Lấy báo cáo cho 1 khoảng ngày (Tuần)
 * (Đã CẬP NHẬT để $sum các trường mới VÀ $last totalUsers)
 */
export const getReportByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json(
          "Vui lòng cung cấp ngày bắt đầu (startDate) và ngày kết thúc (endDate)."
        );
    }
    const start = new Date(startDate + "T00:00:00Z");
    const end = new Date(endDate + "T23:59:59Z");
    const rangeReport = await Report.aggregate([
      {
        $match: {
          reportDate: { $gte: start, $lte: end },
        },
      },
      // --- THÊM: Sắp xếp theo ngày để $last hoạt động chính xác ---
      {
        $sort: { reportDate: 1 },
      },
      {
        // BƯỚC 1: GỘP (Group)
        $group: {
          _id: null,
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmountProducts: { $sum: "$totalAmountProducts" },
          usageCount: { $sum: "$usageCount" },
          totalAmountServices: { $sum: "$totalAmountServices" },
          totalRevenue: { $sum: "$totalRevenue" },
          totalOrders: { $sum: "$totalOrders" },
          newUsers: { $sum: "$newUsers" },
          // --- BỔ SUNG MỚI ---
          totalProfit: { $sum: "$totalProfit" }, // Tính tổng lợi nhuận
          totalUsers: { $last: "$totalUsers" }, // Lấy snapshot của ngày cuối cùng
          // --- KẾT THÚC BỔ SUNG ---
          allTopProducts: { $push: "$topProducts" },
          allTopServices: { $push: "$topServices" },
        },
      },
      {
        // BƯỚC 2: BIẾN ĐỔI (Project)
        $project: {
          _id: 0,
          totalQuantity: 1,
          totalAmountProducts: 1,
          usageCount: 1,
          totalAmountServices: 1,
          totalRevenue: 1,
          totalOrders: 1,
          newUsers: 1,
          // --- BỔ SUNG MỚI ---
          totalProfit: 1,
          totalUsers: 1,
          // --- KẾT THÚC BỔ SUNG ---
          topProducts: {
            $reduce: {
              input: "$allTopProducts",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
          topServices: {
            $reduce: {
              input: "$allTopServices",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);
    if (!rangeReport || rangeReport.length === 0) {
      return res
        .status(404)
        .json("Không tìm thấy dữ liệu báo cáo cho khoảng ngày này.");
    }
    res.status(200).json({
      startDate: startDate,
      endDate: endDate,
      ...rangeReport[0],
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo khoảng ngày:", error);
    res.status(500).json("Lỗi server");
  }
};

/**
 * API: Lấy báo cáo cho 1 tháng
 * (Đã CẬP NHẬT để $sum các trường mới VÀ $last totalUsers)
 */
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res
        .status(400)
        .json("Vui lòng cung cấp năm (year) và tháng (month).");
    }
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const monthlyReport = await Report.aggregate([
      {
        $match: {
          reportDate: { $gte: startDate, $lte: endDate },
        },
      },
      // --- THÊM: Sắp xếp theo ngày để $last hoạt động chính xác ---
      {
        $sort: { reportDate: 1 },
      },
      {
        // BƯỚC 1: GỘP (Group)
        $group: {
          _id: null,
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmountProducts: { $sum: "$totalAmountProducts" },
          usageCount: { $sum: "$usageCount" },
          totalAmountServices: { $sum: "$totalAmountServices" },
          totalRevenue: { $sum: "$totalRevenue" },
          totalOrders: { $sum: "$totalOrders" },
          newUsers: { $sum: "$newUsers" },
          // --- BỔ SUNG MỚI ---
          totalProfit: { $sum: "$totalProfit" },
          totalUsers: { $last: "$totalUsers" },
          // --- KẾT THÚC BỔ SUNG ---
          allTopProducts: { $push: "$topProducts" },
          allTopServices: { $push: "$topServices" },
        },
      },
      {
        // BƯỚC 2: BIẾN ĐỔI (Project)
        $project: {
          _id: 0,
          totalQuantity: 1,
          totalAmountProducts: 1,
          usageCount: 1,
          totalAmountServices: 1,
          totalRevenue: 1,
          totalOrders: 1,
          newUsers: 1,
          // --- BỔ SUNG MỚI ---
          totalProfit: 1,
          totalUsers: 1,
          // --- KẾT THÚC BỔ SUNG ---
          topProducts: {
            $reduce: {
              input: "$allTopProducts",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
          topServices: {
            $reduce: {
              input: "$allTopServices",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);
    if (!monthlyReport || monthlyReport.length === 0) {
      return res
        .status(404)
        .json("Không tìm thấy dữ liệu báo cáo cho tháng này.");
    }
    res.status(200).json({
      year: parseInt(year),
      month: parseInt(month),
      ...monthlyReport[0],
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo tháng:", error);
    res.status(500).json("Lỗi server");
  }
};

/**
 * API: Lấy báo cáo cho 1 Quý
 * (Đã CẬP NHẬT để $sum các trường mới VÀ $last totalUsers)
 */
export const getQuarterlyReport = async (req, res) => {
  try {
    const { year, quarter } = req.query; // quarter là 1, 2, 3, hoặc 4
    if (!year || !quarter) {
      return res
        .status(400)
        .json("Vui lòng cung cấp năm (year) và quý (quarter).");
    }
    // Comment: Tính tháng bắt đầu (0-11)
    const startMonth = (parseInt(quarter) - 1) * 3; // Q1->0, Q2->3, Q3->6, Q4->9
    const endMonth = startMonth + 2; // Q1->2, Q2->5, Q3->8, Q4->11
    const startDate = new Date(Date.UTC(year, startMonth, 1));
    const endDate = new Date(Date.UTC(year, endMonth + 1, 0, 23, 59, 59, 999));
    const quarterlyReport = await Report.aggregate([
      {
        $match: {
          reportDate: { $gte: startDate, $lte: endDate },
        },
      },
      // --- THÊM: Sắp xếp theo ngày để $last hoạt động chính xác ---
      {
        $sort: { reportDate: 1 },
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmountProducts: { $sum: "$totalAmountProducts" },
          usageCount: { $sum: "$usageCount" },
          totalAmountServices: { $sum: "$totalAmountServices" },
          totalRevenue: { $sum: "$totalRevenue" },
          totalOrders: { $sum: "$totalOrders" },
          newUsers: { $sum: "$newUsers" },
          // --- BỔ SUNG MỚI ---
          totalProfit: { $sum: "$totalProfit" },
          totalUsers: { $last: "$totalUsers" },
          // --- KẾT THÚC BỔ SUNG ---
          allTopProducts: { $push: "$topProducts" },
          allTopServices: { $push: "$topServices" },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuantity: 1,
          totalAmountProducts: 1,
          usageCount: 1,
          totalAmountServices: 1,
          totalRevenue: 1,
          totalOrders: 1,
          newUsers: 1,
          // --- BỔ SUNG MỚI ---
          totalProfit: 1,
          totalUsers: 1,
          // --- KẾT THÚC BỔ SUNG ---
          topProducts: {
            $reduce: {
              input: "$allTopProducts",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
          topServices: {
            $reduce: {
              input: "$allTopServices",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);
    if (!quarterlyReport || quarterlyReport.length === 0) {
      return res
        .status(404)
        .json("Không tìm thấy dữ liệu báo cáo cho quý này.");
    }
    res.status(200).json({
      year: parseInt(year),
      quarter: parseInt(quarter),
      ...quarterlyReport[0],
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo quý:", error);
    res.status(500).json("Lỗi server");
  }
};

/**
 * API: Lấy báo cáo cho 1 Năm
 * (Đã CẬP NHẬT để $sum các trường mới VÀ $last totalUsers)
 */
export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json("Vui lòng cung cấp năm (year).");
    }
    const startDate = new Date(Date.UTC(year, 0, 1)); // 1 tháng 1
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // 31 tháng 12
    const yearlyReport = await Report.aggregate([
      {
        $match: {
          reportDate: { $gte: startDate, $lte: endDate },
        },
      },
      // --- THÊM: Sắp xếp theo ngày để $last hoạt động chính xác ---
      {
        $sort: { reportDate: 1 },
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmountProducts: { $sum: "$totalAmountProducts" },
          usageCount: { $sum: "$usageCount" },
          totalAmountServices: { $sum: "$totalAmountServices" },
          totalRevenue: { $sum: "$totalRevenue" },
          totalOrders: { $sum: "$totalOrders" },
          newUsers: { $sum: "$newUsers" },
          // --- BỔ SUNG MỚI ---
          totalProfit: { $sum: "$totalProfit" },
          totalUsers: { $last: "$totalUsers" },
          // --- KẾT THÚC BỔ SUNG ---
          allTopProducts: { $push: "$topProducts" },
          allTopServices: { $push: "$topServices" },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuantity: 1,
          totalAmountProducts: 1,
          usageCount: 1,
          totalAmountServices: 1,
          totalRevenue: 1,
          totalOrders: 1,
          newUsers: 1,
          // --- BỔ SUNG MỚI ---
          totalProfit: 1,
          totalUsers: 1,
          // --- KẾT THÚC BỔ SUNG ---
          topProducts: {
            $reduce: {
              input: "$allTopProducts",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
          topServices: {
            $reduce: {
              input: "$allTopServices",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);
    if (!yearlyReport || yearlyReport.length === 0) {
      return res
        .status(404)
        .json("Không tìm thấy dữ liệu báo cáo cho năm này.");
    }
    res.status(200).json({
      year: parseInt(year),
      ...yearlyReport[0],
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo năm:", error);
    res.status(500).json("Lỗi server");
  }
};

/**
 * API: Get all reports with pagination
 */
export const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await Report.find()
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Report.countDocuments();

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      reports,
    });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả báo cáo:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

/**
 * API: Get dashboard summary for last 7 days
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const authHeaders = {
      "Content-Type": "application/json",
      ["x-user-id"]: req.headers["x-user-id"],
      ["x-user-role"]: req.headers["x-user-role"],
      ["x-user-activate"]: req.headers["x-user-activate"],
    };

    // Get last 7 days reports
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReports = await Report.find({
      reportDate: { $gte: sevenDaysAgo },
    }).sort({ reportDate: -1 });

    const summary = {
      totalRevenue7Days: recentReports.reduce(
        (sum, r) => sum + (r.totalRevenue || 0),
        0
      ),
      totalProfit7Days: recentReports.reduce(
        (sum, r) => sum + (r.totalProfit || 0),
        0
      ),
      totalOrders7Days: recentReports.reduce(
        (sum, r) => sum + (r.totalOrders || 0),
        0
      ),
      totalBookings7Days: recentReports.reduce(
        (sum, r) => sum + (r.usageCount || 0),
        0
      ),
      newUsers7Days: recentReports.reduce(
        (sum, r) => sum + (r.newUsers || 0),
        0
      ),
      latestReport: recentReports[0] || null,
      totalUsers: recentReports.totalUsers,
      totalQuantity: recentReports.totalQuantity,
      usageCount: recentReports.usageCount
    };

    return res.status(200).json({
      success: true,
      summary,
      recentReports,
    });
  } catch (error) {
    console.error("Lỗi khi lấy dashboard summary:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
