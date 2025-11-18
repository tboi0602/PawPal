const API_REPORTING_BASE_URL = "http://localhost:5000/api-reporting/reports";

export const getDashboardSummary = async () => {
  const url = `${API_REPORTING_BASE_URL}/dashboard`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Lỗi khi lấy Dashboard Summary: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API Error - getDashboardSummary:", error.message);
    throw error;
  }
};

export const getReportByRange = async (startDate, endDate) => {
  const url = `${API_REPORTING_BASE_URL}/range?startDate=${startDate}&endDate=${endDate}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data ||
          `Lỗi khi lấy báo cáo theo khoảng ngày: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API Error - getReportByRange:", error.message);
    throw error;
  }
};
