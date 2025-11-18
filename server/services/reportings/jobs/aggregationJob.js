// File: D:\test\reportings\jobs\aggregationJob.js
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
export const generateDailyReport = async (dateToGenerate) => {
  if (!dateToGenerate) {
    console.log("Bắt đầu Cron Job: Tính toán báo cáo hàng ngày...");
  }
  try {
    // 1. Xác định ngày báo cáo (THEO GIỜ UTC)
    const reportDay = dateToGenerate ? new Date(dateToGenerate) : new Date();
    if (!dateToGenerate) {
      reportDay.setDate(reportDay.getDate() - 1);
    }
    reportDay.setUTCHours(0, 0, 0, 0);
    const endOfReportDay = new Date(reportDay);
    endOfReportDay.setUTCHours(23, 59, 59, 999);

    console.log(
      `Generating report for: ${reportDay.toISOString().split("T")[0]}`
    );

    // 2. Prepare auth headers (using admin credentials)
    const authHeaders = {
      "x-user-id": "ADMIN",
      "x-user-role": "ADMIN",
      "x-user-activate": "true",
    };

    // ===== FETCH DATA FROM SHOPPING SERVICE (Orders) =====
    // LƯU Ý: API này cần được cập nhật để trả về orderItems được populate (name, discountPrice,...)
    const ordersData = await fetchFromService(
      `${SHOPPING_TARGET}/orders`,
      "GET",
      authHeaders
    );
    console.log("Orders data:", ordersData?.success ? "✓" : "✗");

    // ===== FETCH DATA FROM SOLUTIONS SERVICE (Bookings) =====
    const bookingsData = await fetchFromService(
      `${SOLUTIONS_TARGET}/booking`,
      "GET",
      authHeaders
    );
    console.log("Bookings data:", bookingsData?.success ? "✓" : "✗");

    // ===== FETCH DATA FROM USERS SERVICE =====
    const usersData = await fetchFromService(
      `${USER_TARGET}/users?role=CUSTOMER`,
      "GET",
      authHeaders
    );
    console.log("Users data:", usersData?.success ? "✓" : "✗");

    // ===== AGGREGATE SHOPPING DATA (LOGIC ĐÃ SỬA) =====
    let totalQuantity = 0;
    let totalAmountProducts = 0;
    let totalOrders = 0;
    const topProducts = {};

    if (ordersData?.success && ordersData.orders) {
      const dayOrders = ordersData.orders.filter((order) => {
        const orderDate = new Date(order.updatedAt);
        return orderDate >= reportDay && orderDate < endOfReportDay;
      });

      totalOrders = dayOrders.length;

      dayOrders.forEach((order) => {
        if (
          !order?.paymentMethod?.status ||
          order?.paymentMethod?.status !== "paid"
        )
          return;
        // SỬA: Dùng order.orderItems theo Order.js schema
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach((item) => {
            const quantity = item.quantity || 0;
            const productInfo = item.productId;

            // 1. Tính toán tổng số lượng sản phẩm bán được
            totalQuantity += quantity;

            // 2. Tính toán tổng doanh thu từ sản phẩm
            // Sử dụng giá (price) được lưu trong orderItem (do orderController tạo ra)
            // hoặc dùng giá khuyến mãi (discountPrice) của sản phẩm nếu được populate
            const itemPrice = item.price || productInfo?.discountPrice || 0;
            totalAmountProducts += itemPrice * quantity;

            // 3. Tổng hợp Top Products
            const productName =
              productInfo?.name || productInfo?._id || "Unknown";
            topProducts[productName] =
              (topProducts[productName] || 0) + quantity;
          });
        }
      });
    }

    // ===== AGGREGATE SOLUTIONS DATA =====
    let usageCount = 0;
    let totalAmountServices = 0;
    const topServices = {};

    if (bookingsData?.success && bookingsData.bookings) {
      const dayBookings = bookingsData.bookings.filter((booking) => {
        const bookingDate = new Date(booking.updatedAt);
        return bookingDate >= reportDay && bookingDate < endOfReportDay;
      });

      usageCount = dayBookings.length;

      dayBookings.forEach((booking) => {
        if (booking.status === "cancelled" || booking.status === "pending")
          return;
        totalAmountServices += booking.totalAmount || 0;

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

      newUsers = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= reportDay && createdAt < endOfReportDay;
      }).length;
    }

    // ===== CALCULATE TOTALS =====
    const totalRevenue = totalAmountProducts + totalAmountServices;
    const totalProfit = totalRevenue * 0.2; // 20% profit margin

    // Convert objects to arrays and sort
    const topProductsArray = Object.entries(topProducts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const topServicesArray = Object.entries(topServices)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // ===== SAVE TO DATABASE =====
    const calculatedData = {
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
    };

    await Report.findOneAndUpdate(
      {
        reportDate: { $gte: reportDay, $lte: endOfReportDay },
      },
      {
        $set: {
          reportDate: reportDay,
          ...calculatedData,
        },
      },
      { upsert: true, new: true }
    );

    const reportDateStr = reportDay.toISOString().split("T")[0];
    console.log(`✓ Report generated successfully for: ${reportDateStr}`);
    console.log(`  - Orders: ${totalOrders}`);
    console.log(`  - Bookings: ${usageCount}`);
    console.log(`  - Revenue: ${totalRevenue.toLocaleString()} VND`);
    console.log(`  - Users: ${totalUsers} (New: ${newUsers})`);
  } catch (error) {
    console.error("Error generating daily report:", error);
  }
};
