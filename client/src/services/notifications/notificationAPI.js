const BASE_URL = "http://localhost:5000/api-notification/notifications";

export async function getNotificationsAll(page = 1, search = "", type = "") {
  const queryParams = {
    page: page,
    limit: 10,
    type: type,
  };
  if (search !== "") {
    queryParams.search = search;
  }
  const queryString = new URLSearchParams(queryParams).toString();
  const res = await fetch(`${BASE_URL}/users?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}

export async function deleteNotifications(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}

export async function addNotifications(senderId, formData) {
  const res = await fetch(`${BASE_URL}/${senderId}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return res.json();
}

export async function getNotificationsForUser(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}

export async function markAsRead(userId, notificationId) {
  const res = await fetch(
    `${BASE_URL}/users/${userId}/${notificationId}/read`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
