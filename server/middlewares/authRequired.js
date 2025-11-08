import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/config.js";

export const verifyAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.headers["x-user-id"] = "GUEST";
    req.headers["x-user-role"] = "GUEST";
    req.headers["x-user-activate"] = "GUEST";
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-role"] = decoded.role;
    req.headers["x-user-activate"] = decoded.isActivate;
    delete req.headers["cookie"];
    next();
  } catch (err) {
    res.clearCookie("token");
    return res
      .status(401)
      .json({ message: `Authentication error: ${err.message}` });
  }
};
