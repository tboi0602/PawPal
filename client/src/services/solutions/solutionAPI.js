const BASE_URL = "http://localhost:5000/api-solution/solutions";

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

export const getSolutions = async () => {
  const res = await fetch(`${BASE_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return handleResponse(res);
};

export const getSolutionById = async (solutionId) => {
  const res = await fetch(`${BASE_URL}/${solutionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return handleResponse(res);
};

export const createSolution = async (solutionData) => {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(solutionData),
  });
  return handleResponse(res);
};

export const updateSolution = async (solutionId, updateData) => {
  const res = await fetch(`${BASE_URL}/${solutionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updateData),
  });
  return handleResponse(res);
};

export const deleteSolution = async (solutionId) => {
  const res = await fetch(`${BASE_URL}/${solutionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return handleResponse(res);
};