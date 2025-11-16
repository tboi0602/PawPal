const BASE_URL = "http://localhost:5000/api-shopping";
export async function getPromotions(
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  sortField = "createdAt",
  sortOrder = "desc"
) {
  const queryParams = {
    page: page,
    limit: limit,
    status: status,
    sortField: sortField,
    sortOrder: sortOrder,
  };
  if (search !== "") {
    queryParams.search = search;
  }

  const queryString = new URLSearchParams(queryParams).toString();

  const res = await fetch(`${BASE_URL}/promotions?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}

export async function getPromotion(promotionId) {
  const res = await fetch(`${BASE_URL}/promotions/${promotionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
export async function editPromotion(promotionId, updateData) {
  const res = await fetch(`${BASE_URL}/promotions/${promotionId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(updateData),
  });
  return res.json();
}
export async function deletePromotion(promotionId) {
  const res = await fetch(`${BASE_URL}/promotions/${promotionId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
export async function addPromotion(promoData) {
  const res = await fetch(`${BASE_URL}/promotions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(promoData),
  });
  return res.json();
}
