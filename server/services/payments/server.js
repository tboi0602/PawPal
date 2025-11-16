import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import { PAYMENT_PORT, MONGO_PAYMENT_URI } from "../../configs/config.js";
import {
  handleMoMoPaymentResult,
  initiateMoMoPayment,
} from "./paymentController.js";

const app = express();

mongoose
  .connect(MONGO_PAYMENT_URI)
  .then(() => console.log("Payment DB connection successful!"))
  .catch((err) => console.error(err));

//middle ware
app.use(express.json());
app.use(morgan("dev"));

//routes
app.post("/payments/momo/create", initiateMoMoPayment);
app.get("/payments/momo/results", handleMoMoPaymentResult);
//run service
app.listen(PAYMENT_PORT, () => {
  console.log(
    `Payment service running on port: http://localhost:${PAYMENT_PORT}`
  );
});
