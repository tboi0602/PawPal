const BASE_URL = "http://localhost:5000/api-shopping/orders";
export async function createOrder(orderData) {
  console.log(orderData);
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(orderData),
  });
  return res.json();
}
export async function getOrdersByUser(userId, page = 1, limit = 10, status) {
  const res = await fetch(
    `${BASE_URL}/user/${userId}?page=${page}&limit=${limit}&status=${status}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
export async function getOrders(
  page = 1,
  limit = 10,
  status = "",
  search = ""
) {
  const res = await fetch(
    `${BASE_URL}?page=${page}&limit=${limit}&status=${status}&search=${search}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
export async function updateOrderStatus(id, newStatus) {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status: newStatus }),
  });
  return res.json();
}
