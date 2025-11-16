import express from "express";
import morgan from "morgan";
import mongoose, { get } from "mongoose";
import multer from "multer";
import {
  checkRole,
  checkUser,
  verifyAuth,
} from "../middlewares/authRequired.js";
import { SHOPPING_PORT, MONGO_SHOPPING_URI } from "../../configs/config.js";
import {
  addProduct,
  deleteProduct,
  getProduct,
  updateProduct,
} from "./controllers/productController.js";
import {
  addReview,
  deleteReview,
  getReviews,
} from "./controllers/reviewController.js";
import {
  addPromotion,
  getPromotion,
  getPromotions,
  updatePromotion,
  deletePromotion,
} from "./controllers/promotionControllers.js";
import {
  addCartItem,
  getCartByUser,
  updateCartItem,
  deleteCartItem,
} from "./controllers/cartController.js";
import {
  getOrders,
  getOrdersByUser,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "./controllers/orderController.js";
const app = express();

//connect mongoDB
mongoose
  .connect(MONGO_SHOPPING_URI)
  .then(() => console.log("Shopping DB connection successful!"))
  .catch((err) => console.error(err));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//middle ware
app.use(express.json());
app.use(morgan("dev"));

//router products
app.get("/products", getProduct);
app.get("/products/:id", getProduct);
app.post(
  "/products",
  upload.array("images", 10),
  verifyAuth,
  checkRole(["ADMIN"]),
  addProduct
);
app.put(
  "/products/:id",
  upload.array("newImages", 10),
  verifyAuth,
  checkRole(["ADMIN"]),
  updateProduct
);
app.delete("/products/:id", verifyAuth, checkRole(["ADMIN"]), deleteProduct);

//router Review
app.get("/products/:productId/reviews", getReviews);
app.post("/products/:productId/reviews/", verifyAuth, addReview);
app.delete("/reviews/:id", verifyAuth, deleteReview);

//router promotion
app.post("/promotions", verifyAuth, checkRole(["ADMIN"]), addPromotion);
app.get("/promotions", verifyAuth, getPromotions);
app.get("/promotions/:id", verifyAuth, getPromotion);
app.put("/promotions/:id", verifyAuth, checkUser, updatePromotion);
app.delete(
  "/promotions/:id",
  verifyAuth,
  checkRole(["ADMIN"]),
  deletePromotion
);

//router Cart
app.post("/cart", verifyAuth, addCartItem);
app.get("/cart/users/:userId", verifyAuth, checkUser, getCartByUser);
app.put("/cart/cart-items/:id", verifyAuth, updateCartItem);
app.delete("/cart/cart-items/:id", verifyAuth, deleteCartItem);

//router orders
app.get("/orders", verifyAuth, checkRole(["ADMIN", "STAFF"]), getOrders);
app.get("/orders/user/:userId", verifyAuth, checkUser, getOrdersByUser);
app.post("/orders", createOrder);
app.put("/orders/:id/status", verifyAuth, updateOrderStatus);
app.put("/orders/:id/payment-status", verifyAuth, updatePaymentStatus);

//run service
app.listen(SHOPPING_PORT, () => {
  console.log(
    `Shopping service running on port: http://localhost:${SHOPPING_PORT}`
  );
});
