import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { checkRole, verifyAuth } from "../middlewares/authRequired.js";
import { PROMOTION_PORT, MONGO_PROMOTION_URI } from "../../configs/config.js";
import {
  addPromotion,
  getPromotion,
  getPromotions,
  updatePromotion,
  deletePromotion,
  applyPromotion,
} from "./controllers/promotionControllers.js";

dotenv.config();


const app = express();
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(MONGO_PROMOTION_URI)
  .then(() => console.log("Promotion DB connection successful!"))
  .catch((err) => console.error(err));

// Routes
app.post("/promotions", verifyAuth, checkRole(["ADMIN"]), addPromotion);
app.get(
  "/promotions",
  verifyAuth,
  checkRole(["ADMIN"], ["STAFF"]),
  getPromotions
);
app.get(
  "/promotions/:id",
  verifyAuth,
  checkRole(["ADMIN"], ["STAFF"], ["CUSTOMER"]),
  getPromotion
);
app.put("/promotions/:id", verifyAuth, checkRole(["ADMIN"]), updatePromotion);
app.delete(
  "/promotions/:id",
  verifyAuth,
  checkRole(["ADMIN"]),
  deletePromotion
);
app.post(
  "/promotions/apply",
  verifyAuth,
  checkRole(["ADMIN"], ["STAFF"], ["CUSTOMER"]),
  applyPromotion
);

// Run service
app.listen(PROMOTION_PORT, () => {
  console.log(
    `Promotion service running on port: http://localhost:${PROMOTION_PORT}`
  );
});
