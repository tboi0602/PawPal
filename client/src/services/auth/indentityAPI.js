export async function login(email,password) {
  const res = await fetch("http://localhost:5000/api-auth/login",{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

export async function register(name, address, email,password) {
  const res = await fetch("http://localhost:5000/api-auth/register",{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, address, email,password }),
  })
  return res.json()
}

export async function logout() {
  const res = await fetch("http://localhost:5000/api-auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
