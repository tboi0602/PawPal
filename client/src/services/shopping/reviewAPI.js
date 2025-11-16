export async function getReviews(productId, page = 1, limit = 10) {
  const res = await fetch(
    `http://localhost:5000/api-shopping/products/${productId}/reviews?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}

export async function deleteReview( reviewId) {
  const res = await fetch(
    `http://localhost:5000/api-shopping/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
export async function addReview(productId, name, image, comment, rate) {
  const res = await fetch(
    `http://localhost:5000/api-shopping/products/${productId}/reviews`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, image, comment, rate }),
    }
  );
  return res.json();
}
