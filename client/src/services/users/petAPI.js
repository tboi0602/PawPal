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

export async function addPet(userId, formData) {
  const res = await fetch(
    `http://localhost:5000/api-user/users/${userId}/pets`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );
  return res.json();
}

export async function editPet(userId, petId, formData) {
  const res = await fetch(
    `http://localhost:5000/api-user/users/${userId}/pets/${petId}`,
    {
      method: "PUT",
      credentials: "include",
      body: formData,
    }
  );
  return res.json();
}
