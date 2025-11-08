import { USER_TARGET } from "../../../configs/config.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../configs/config.js";

//* Register
export const handleRegister = async (req, res) => {
  const dataRegister = req.body;
  try {
    if (
      !dataRegister.name ||
      !dataRegister.address ||
      !dataRegister.email ||
      !dataRegister.password
    )
      return res
        .status(400)
        .json({ success: false, message: "Insufficient data" });

    const response = await fetch(`${USER_TARGET}/users/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dataRegister),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Indentity error: ${error.message}`,
    });
  }
};

//* Login
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await fetch(`${USER_TARGET}/users/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    const user = data.user;
    const token = jwt.sign(
      { id: user._id, role: user.role, isActivate: user.isActivate },
      JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    if (data.success) {
      const cookieOptions = {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      };
      res.cookie("token", token, cookieOptions);
    }
    return res.status(response.status).json({ ...data, token: token });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Indentity error: ${error.message}`,
    });
  }
};

export const handleLogout = (req, res) => {
  try {
    res.cookie("token", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Indentity Error: ${error.message}`,
    });
  }
};
