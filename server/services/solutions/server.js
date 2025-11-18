import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { checkRole, verifyAuth } from "../middlewares/authRequired.js";
import { SOLUTIONS_PORT, MONGO_SOLUTIONS_URI } from "../../configs/config.js";
import {
  addSolution,
  getSolutionById,
  getSolutions,
  updateSolution,
  deleteSolution,
} from "./controllers/serviceController.js";
import {
  addResource,
  getResourceById,
  getResources,
  updateResource,
  getResourcesBySolutionId,
  deleteResource,
} from "./controllers/resourceController.js";
import {
  createBooking,
  getBookingById,
  getBookings,
  deleteBooking,
  updateBookingStatus,
  createBookingAfterPayment,
  createBookingForPayment,
} from "./controllers/bookingController.js";

const app = express();
mongoose
  .connect(MONGO_SOLUTIONS_URI)
  .then(() => console.log("Solutions DB Connected!"))
  .catch((err) => console.error(err));

app.use(express.json());
app.use(morgan("dev"));

// Define your routes and controllers here
// Solution routes
app.post("/solutions", verifyAuth, checkRole(["ADMIN"]), addSolution);
app.get("/solutions", getSolutions);
app.get("/solutions/:id", getSolutionById);
app.put("/solutions/:id", verifyAuth, checkRole(["ADMIN"]), updateSolution);
app.delete("/solutions/:id", verifyAuth, checkRole(["ADMIN"]), deleteSolution);

// Resource routes
app.post("/resources", verifyAuth, checkRole(["ADMIN"]), addResource);
app.get("/resources", getResources);
app.get("/resources/:id", getResourceById);
app.put("/resources/:id", verifyAuth, checkRole(["ADMIN"]), updateResource);
app.get(
  "/resources/solution/:solutionId",
  verifyAuth,
  getResourcesBySolutionId
);
app.delete("/resources/:id", verifyAuth, deleteResource, checkRole(["ADMIN"]));

// Booking routes - specific routes first, then parameterized routes
app.post("/booking/for-payment", createBookingForPayment);
app.post("/booking/payment/create", createBookingAfterPayment);
app.post("/booking/:id", createBooking);
app.get("/booking", getBookings);
app.get("/booking/:id", getBookingById);
app.put("/booking/:id/status", updateBookingStatus);
app.put("/booking/status/:id", verifyAuth, updateBookingStatus);
app.delete( 
  "/booking/:id",
  verifyAuth,
  checkRole(["ADMIN", "STAFF"]),
  deleteBooking
);

app.listen(SOLUTIONS_PORT, () => {
  console.log(`Solutions service running on port: ${SOLUTIONS_PORT}`);
});
