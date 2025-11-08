import { jwtDecode } from "jwt-decode";

export const checkTokenValidity = () => {
  const token = localStorage.getItem("token")
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const expirationTime = decoded.exp;
    if (expirationTime > currentTime) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
