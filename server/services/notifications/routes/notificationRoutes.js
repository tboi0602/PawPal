import {
  checkRole,
  checkUser,
  verifyAuth,
} from "../../middlewares/authRequired.js";
import express from "express";
import {
  getNotificationsForUser,
  markAsRead,
  createBroadcastNotification,
  createPersonalNotification,
  getNotificationsAll,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/users", verifyAuth, checkRole(["ADMIN"]), getNotificationsAll);
router.get("/users/:userId", verifyAuth, checkUser, getNotificationsForUser);
router.post("/users/:userId/:id/read", verifyAuth, checkUser, markAsRead);
router.post(
  "/users/:userId",
  verifyAuth,
  checkUser,
  createPersonalNotification
);
router.post(
  "/:senderId/users",
  verifyAuth,
  checkRole(["ADMIN"]),
  createBroadcastNotification
);
router.delete(
  "/users/:id",
  verifyAuth,
  checkRole(["ADMIN"]),
  deleteNotification
);

export default router;
