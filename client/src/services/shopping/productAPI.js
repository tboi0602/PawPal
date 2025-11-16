const BASE_URL = "http://localhost:5000/api-shopping/products";
export async function getProducts(
  page = 1,
  limit = 10,
  search = "",
  category = "",
  min = 0,
  max = 0
) {
  const queryParams = {
    page: page,
    limit: limit,
  };
  if (search !== "") {
    queryParams.search = search;
  }
  if (category !== "") {
    queryParams.category = category;
  }
  if (min > 0) {
    queryParams.min = min;
  }
  if (max > 0) {
    queryParams.max = max;
  }

  const queryString = new URLSearchParams(queryParams).toString();

  const res = await fetch(`${BASE_URL}?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}

export async function getProduct(productId) {
  const res = await fetch(`${BASE_URL}/${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
export async function editProduct(productId, updateData) {
  const res = await fetch(`${BASE_URL}/${productId}`, {
    method: "PUT",
    credentials: "include",
    body: updateData,
  });
  return res.json();
}
export async function deleteProduct(productId) {
  const res = await fetch(`${BASE_URL}/${productId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
export async function addProduct(formData) {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return res.json();
}
