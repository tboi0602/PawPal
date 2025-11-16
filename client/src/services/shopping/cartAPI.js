import { getItem } from "../../utils/operations";

const BASE_URL = "http://localhost:5000/api-shopping/cart";

export async function getCart(page = 1, limit = 10) {
  const user = getItem("user-data");
  try {
    const res = await fetch(
      `${BASE_URL}/users/${user?._id}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    return res.json();
  } catch (err) {
    console.error("getCart error:", err.message);
    throw err;
  }
}

// Accepts { productId, quantity, selectedOptions }
export async function addToCart(payload) {
  try {
    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (err) {
    console.error("addToCart error:", err.message);
    throw err;
  }
}

// Update by cart item id or productId
export async function updateCartItem(idOrProductId, update) {
  try {
    const res = await fetch(`${BASE_URL}/cart-items/${idOrProductId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(update),
    });
    return res.json();
  } catch (err) {
    console.error("updateCartItem error:", err.message);
    throw err;
  }
}

export async function removeCartItem(idOrProductId) {
  try {
    const res = await fetch(`${BASE_URL}/cart-items/${idOrProductId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return res.json();
  } catch (err) {
    console.error("removeCartItem error:", err.message);
    throw err;
  }
}

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
