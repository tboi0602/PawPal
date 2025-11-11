//* Kiểm tra đăng nhập
export const verifyAuth = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const isActivate = req.headers["x-user-activate"] === "true";
  if (userId === "GUEST") {
    return res.status(401).json({ message: "Access denied. Please log in." });
  }
  if (!isActivate)
    return res.status(403).json({ message: "Please activate your account." });
  next();
};

//* Phân quyền
export const checkRole = (rolesRequired) => (req, res, next) => {
  const userRole = req.headers["x-user-role"];

  const requiredRoles = Array.isArray(rolesRequired)
    ? rolesRequired
    : [rolesRequired];
  const isAuthorized = requiredRoles.includes(userRole);
  if (!isAuthorized) {
    return res.status(403).json({
      message:
        "Access denied. You do not have permission to perform this action.",
      required: requiredRoles,
    });
  }
  next();
};

//* Kiểm tra quyền truy cập
export const checkUser = (req, res, next) => {
  const requestedUserId = req.params.userId;
  const userRole = req.headers["x-user-role"];

  const authenticatedUserId = req.headers["x-user-id"];
  if (authenticatedUserId !== requestedUserId && userRole !== "ADMIN") {
    return res.status(403).json({
      message:
        "Access denied. You do not have permission to perform this action.",
    });
  }
  next();
};
