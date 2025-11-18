const API_URL = "http://localhost:5000/api-solution";

// Hàm xử lý chung cho Response
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    // Ném lỗi với thông báo từ server hoặc thông báo mặc định
    throw new Error(
      data.message || `API call failed with status: ${res.status}`
    );
  }
  return data;
};

// Get resources by solution ID
export const getResourcesBySolutionId = async (solutionId) => {
  const res = await fetch(`${API_URL}/resources/solution/${solutionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};

// Get all resources
export const getResources = async () => {
  const res = await fetch(`${API_URL}/resources`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  return handleResponse(res);
};

// Get resource by ID
export const getResourceById = async (resourceId) => {
  const res = await fetch(`${API_URL}/resources/${resourceId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};

// Create a resource
export const createResource = async (resourceData) => {
  const res = await fetch(`${API_URL}/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(resourceData),
  });
  return handleResponse(res);
};

// Update a resource
export const updateResource = async (resourceId, resourceData) => {
  const res = await fetch(`${API_URL}/resources/${resourceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(resourceData),
  });
  return handleResponse(res);
};

// Delete a resource
export const deleteResource = async (resourceId) => {
  const res = await fetch(`${API_URL}/resources/${resourceId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};

// Create a booking
export const createBooking = async (solutionId, bookingData) => {
  const res = await fetch(`${API_URL}/booking/${solutionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(bookingData),
  });
  return handleResponse(res);
};

// Get bookings (with filters)
export const getBookings = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.userId) params.append("userId", filters.userId);
  if (filters.status) params.append("status", filters.status);
  if (filters.search) params.append("search", filters.search);
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  const res = await fetch(`${API_URL}/booking?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  const res = await fetch(`${API_URL}/booking/${bookingId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};

// Update booking status or details
export const updateBooking = async (bookingId, status) => {
  // Sửa endpoint để hỗ trợ cập nhật chung (không chỉ status)
  const res = await fetch(`${API_URL}/booking/status/${bookingId}`, { 
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(status),
  });
  return handleResponse(res);
};

// Delete booking
export const deleteBooking = async (bookingId) => {
  const res = await fetch(`${API_URL}/booking/${bookingId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};