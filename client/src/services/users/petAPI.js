export async function getPets(userId) {
  const res = await fetch(
    `http://localhost:5000/api-user/users/${userId}/pets`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
