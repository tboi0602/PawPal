export async function getProducts(
  page = 1,
  search = "",
  category = "",
  min = 0,
  max = 0
) {
  const queryParams = {
    page: page,
    limit: 10,
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

  const res = await fetch(
    `http://localhost:5000/api-shopping/products?${queryString}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}

export async function getProduct(productId) {
  const res = await fetch(
    `http://localhost:5000/api-shopping/products/${productId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
export async function editProduct(productId, updateData) {
  const res = await fetch(
    `http://localhost:5000/api-shopping/products/${productId}`,
    {
      method: "PUT",
      credentials: "include",
      body: updateData,
    }
  );
  return res.json();
}
export async function deleteProduct(productId) {
  const res = await fetch(
    `http://localhost:5000/api-shopping/products/${productId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
export async function addProduct(formData) {
  const res = await fetch(`http://localhost:5000/api-shopping/products`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return res.json();
}
