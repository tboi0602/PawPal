export async function getUsers(page = 1, search = "", role = "CUSTOMER") {
  const res = await fetch(
    `http://localhost:5000/api-user/users?page=${page}&search=${search}&limit=10&role=${role}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}

export async function getUser(userId) {
  const res = await fetch(`http://localhost:5000/api-user/users/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
export async function editUser(userId, updateData) {
  const res = await fetch(`http://localhost:5000/api-user/users/${userId}`, {
    method: "PUT",
    credentials: "include",
    body: updateData,
  });
  return res.json();
}
export async function deleteUser(userId) {
  const res = await fetch(`http://localhost:5000/api-user/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
export async function addUser(dataUser) {
  const res = await fetch(`http://localhost:5000/api-user/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dataUser),
  });
  return res.json();
}
