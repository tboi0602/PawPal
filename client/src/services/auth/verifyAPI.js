export async function requiredActivate(email) {
  const res = await fetch(
    `http://localhost:5000/api-auth/required-activate?email=${email}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
export async function activate(email, token) {
  const res = await fetch(
    `http://localhost:5000/api-auth/activate?email=${email}&token=${token}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}

export async function requiredChangePassword(email) {
  const res = await fetch(
    `http://localhost:5000/api-auth/required-change-password?email=${email}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  return res.json();
}
export async function changePassword(email, token, password) {
  const res = await fetch(
    `http://localhost:5000/api-auth/forgot-password?email=${email}&token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({password})
    }
  );
  return res.json();
}
