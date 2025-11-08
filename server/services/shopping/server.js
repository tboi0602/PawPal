import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import multer from "multer";
import { checkRole, verifyAuth } from "../middlewares/authRequired.js";
import { SHOPPING_PORT, MONGO_SHOPPING_URI } from "../../configs/config.js";
import {
  addProduct,
  deleteProduct,
  getProduct,
  updateProduct,
} from "./controllers/productController.js";

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
app.get("/products", verifyAuth, getProduct);
app.get("/products/:id", verifyAuth, getProduct);
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

//run service
app.listen(SHOPPING_PORT, () => {
  console.log(
    `Shopping service running on port: http://localhost:${SHOPPING_PORT}`
  );
});
