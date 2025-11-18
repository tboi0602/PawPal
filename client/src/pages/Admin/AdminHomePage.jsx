import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardSummary,
  getReportByRange,
} from "../../services/reportings/reportingAPI";

// Renamed from AdminHomePage to AdminDashboardPage for clarity
export const AdminHomePage = () => {
  const [filterType, setFilterType] = useState("7days"); // 7days, 30days, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dashboardData, setDashboardData] = useState(null); // Fixed typo setSashboardData -> setDashboardData
  const [rangeData, setRangeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#cc33ff",
    "#ff6600",
    "#00cccc",
  ];
  const LOCALE = "en-US";
  const CURRENCY = "USD";

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getDashboardSummary();
      if (response.success) {
        // Cấu trúc response.summary cần được cập nhật ở Backend
        // để chứa các chỉ số toàn cục (totalResources, totalCustomers).
        // Tạm thời, tôi sẽ giả định các trường này có thể có hoặc là 0
        const summary = {
          ...response.summary,
          // DÙNG totalUser VÀ totalResources ĐỂ CUNG CẤP DỮ LIỆU BAN ĐẦU
          totalResources: response.summary.totalResources || 0,
          totalUsers: response.summary.totalUser || 0, // Cập nhật tên trường để tương thích với backend đã sửa
        };
        setDashboardData(summary);

        // Sửa lỗi logic: Đảm bảo rangeData luôn là một object có thuộc tính recentReports
        setRangeData({ recentReports: response.recentReports });
      }
    } catch (err) {
      setError("Error fetching dashboard summary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch range data based on filter
  const fetchRangeData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let start, end;

      if (filterType === "7days") {
        end = new Date();
        start = new Date();
        start.setDate(start.getDate() - 7);
      } else if (filterType === "30days") {
        end = new Date();
        start = new Date();
        start.setDate(start.getDate() - 30);
      } else if (filterType === "custom" && startDate && endDate) {
        // Use midnight of start date and end of end date
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        return; // Don't fetch if custom is selected but dates are missing
      }

      // Đảm bảo truyền ngày tháng dưới dạng YYYY-MM-DD
      const startIso = start.toISOString().split("T")[0];
      const endIso = end.toISOString().split("T")[0];

      const response = await getReportByRange(startIso, endIso);
      if (response.success) {
        // response từ /range API được kỳ vọng chứa { recentReports: [...] }
        setRangeData(response);
      }
    } catch (err) {
      setError("Error fetching range data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType, startDate, endDate]);

  // Initial load effect
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch when filter changes effect
  useEffect(() => {
    if (filterType === "custom") {
      if (startDate && endDate) {
        fetchRangeData();
      }
    } else {
      fetchRangeData();
    }
  }, [filterType, startDate, endDate, fetchRangeData]);

  // --- DERIVED DATA & CALCULATIONS (NEW/UPDATED) ---

  // Prepare chart data (keys translated: doanhthu->revenue, loinhuan->profit, donhang->orders, datdich->bookings)
  const chartData =
    rangeData?.recentReports
      ?.slice() // <--- (1) Tạo bản sao của mảng
      .sort((a, b) => {
        // <--- (2) Thêm hàm sort TĂNG DẦN (ngày cũ nhất trước, mới nhất sau)
        return new Date(a.reportDate) - new Date(b.reportDate);
      })
      .map((report) => ({
        date: new Date(report.reportDate).toLocaleDateString(LOCALE, {
          month: "2-digit",
          day: "2-digit",
        }),
        revenue: report.totalRevenue || 0,
        profit: report.totalProfit || 0,
        orders: report.totalOrders || 0,
        bookings: report.usageCount || 0,
        newUsers: report.newUsers || 0, // Thêm newUsers để tính tổng
        topProducts: report.topProducts || [],
      })) || [];

  // Calculate total metrics for the selected range (Dynamic Summary)
  const totalRevenueInRange = chartData.reduce((sum, r) => sum + r.revenue, 0);
  const totalProfitInRange = chartData.reduce((sum, r) => sum + r.profit, 0);
  const totalOrdersInRange = chartData.reduce((sum, r) => sum + r.orders, 0);
  const totalBookingsInRange = chartData.reduce(
    (sum, r) => sum + r.bookings,
    0
  );
  const totalNewUsersInRange = chartData.reduce(
    (sum, r) => sum + r.newUsers,
    0
  );

  // NEW: Calculate total products sold in the current range
  const totalProductsSoldInRange =
    rangeData?.recentReports
      ?.flatMap((r) => r.topProducts || [])
      .reduce((sum, prod) => sum + (prod.quantity || 0), 0) || 0;

  // --- SUMMARY STATS (UPDATED) ---

  const formattedCurrency = (value) =>
    value.toLocaleString(LOCALE, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    });

  const formattedNumber = (value) => value.toLocaleString(LOCALE);

  // Summary statistics data (Aggregated totals for the selected range)
  const summaryStats = [
    {
      label: `${filterType} Revenue`,
      value: formattedCurrency(totalRevenueInRange),
      unit: CURRENCY,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-600",
      // Hiển thị chỉ số này đầu tiên vì nó là quan trọng nhất
      order: 1,
    },
    {
      label: `${filterType} Profit`,
      value: formattedCurrency(totalProfitInRange),
      unit: CURRENCY,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-600",
      order: 2,
    },
    {
      label: `${filterType} Orders`,
      value: formattedNumber(totalOrdersInRange),
      unit: "orders",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-600",
      order: 3,
    },
    {
      label: `${filterType} Bookings`,
      value: formattedNumber(totalBookingsInRange),
      unit: "times",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-600",
      order: 4,
    },
    // NEW: Total Products Sold in Range
    {
      label: `${filterType} Products Sold`,
      value: formattedNumber(totalProductsSoldInRange),
      unit: "products",
      color: "bg-pink-50 border-pink-200", // Màu mới
      textColor: "text-pink-600", // Màu mới
      order: 5,
    },
    {
      label: `${filterType} New Users`,
      value: formattedNumber(totalNewUsersInRange),
      unit: "users",
      color: "bg-red-50 border-red-200",
      textColor: "text-red-600",
      order: 6,
    },
    // Đã xóa Total Resources và Total Customers theo yêu cầu của người dùng.
  ];

  // Top products data aggregation (no change in logic, only comments/text translation)
  const topProductsData =
    rangeData?.recentReports
      ?.flatMap((r) => r.topProducts || [])
      .reduce((acc, prod) => {
        const existing = acc.find((p) => p.name === prod.name);
        if (existing) {
          existing.value += prod.quantity;
        } else {
          acc.push({ name: prod.name, value: prod.quantity });
        }
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) || [];

  // Top services data aggregation (no change in logic, only comments/text translation)
  const topServicesData =
    rangeData?.recentReports
      ?.flatMap((r) => r.topServices || [])
      .reduce((acc, svc) => {
        const existing = acc.find((s) => s.name === svc.name);
        if (existing) {
          existing.value += svc.quantity;
        } else {
          acc.push({ name: svc.name, value: svc.quantity });
        }
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) || [];

  const currencyFormatter = (value) =>
    value.toLocaleString(LOCALE, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    });
  const numberFormatter = (value) => value.toLocaleString(LOCALE);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track business performance and statistics
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("7days")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === "7days"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setFilterType("30days")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === "30days"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setFilterType("custom")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === "custom"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom date range */}
            {filterType === "custom" && (
              <div className="flex gap-2 ml-auto items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="px-2 py-2 text-gray-600">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && dashboardData && (
          <>
            {/* Summary Stats (Updated to lg:grid-cols-3 for 6 items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {summaryStats
                .sort((a, b) => -a.order + b.order)
                .map((stat, idx) => (
                  <div
                    key={idx}
                    className={`${stat.color} border rounded-lg p-6`}
                  >
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.unit}</p>
                  </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue & Profit Trend */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Revenue & Profit Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    {/* Use currencyFormatter for YAxis of monetary values */}
                    <YAxis
                      fontSize={12}
                      tickFormatter={(value) =>
                        value.toLocaleString(LOCALE, {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        })
                      }
                    />
                    {/* Use currencyFormatter for Tooltip of monetary values */}
                    <Tooltip formatter={currencyFormatter} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Orders & Bookings */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Orders & Bookings Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    {/* Use numberFormatter for YAxis of count values */}
                    <YAxis
                      fontSize={12}
                      tickFormatter={(value) =>
                        value.toLocaleString(LOCALE, { notation: "compact" })
                      }
                    />
                    {/* Use numberFormatter for Tooltip of count values */}
                    <Tooltip formatter={numberFormatter} />
                    <Legend />
                    <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
                    <Bar dataKey="bookings" fill="#f59e0b" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products & Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Top 5 Products
                </h3>
                {topProductsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topProductsData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {topProductsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={numberFormatter} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    No data available
                  </p>
                )}
              </div>

              {/* Top Services */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Top 5 Services
                </h3>
                {topServicesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topServicesData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {topServicesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={numberFormatter} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    No data available
                  </p>
                )}
              </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Daily Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Profit
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Bookings
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        New Users
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rangeData?.recentReports?.map((report, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(report.reportDate).toLocaleDateString(
                            LOCALE
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {(report.totalRevenue || 0).toLocaleString(LOCALE, {
                            style: "currency",
                            currency: CURRENCY,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {(report.totalProfit || 0).toLocaleString(LOCALE, {
                            style: "currency",
                            currency: CURRENCY,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {report.totalOrders || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {report.usageCount || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {report.newUsers || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
