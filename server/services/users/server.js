import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import multer from "multer";

import {
  checkRole,
  checkUser,
  verifyAuth,
} from "../middlewares/authRequired.js";
import { USER_PORT, MONGO_USER_URI } from "../../configs/config.js";
import {
  getUser,
  addUser,
  updateUser,
  deleteUser,
} from "./controllers/userController.js";
import {
  getPet,
  addPet,
  updatePet,
  deletePet,
} from "./controllers/petController.js";
import {
  ActivationRequired,
  ChangePasswordRequired,
  handleActivate,
  handleChangePassword,
  handleLogin,
  handleRegister,
} from "./controllers/authController.js";

//Data example
// import User from "./models/User.js";
// import { users } from "./fakeData.js";

const app = express();

//connect mongoDB
mongoose
  .connect(MONGO_USER_URI)
  .then(() => console.log("User DB connection successful!"))
  .catch((err) => console.error(err));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// const runSave = () => {
//   users.map(async (user) => {
//     const newUser = new User(user);
//     await newUser.save();
//   });
// };
// runSave();
//middle ware
app.use(express.json());
app.use(morgan("dev"));

//router auth
app.post("/users/login", handleLogin);
app.post("/users/register", handleRegister);

app.post("/users/activate", handleActivate);
app.post("/users/required-activate", ActivationRequired);
app.post("/users/required-change-password", ChangePasswordRequired);
app.post("/users/forgot-password", handleChangePassword);

//router users
app.get("/users", verifyAuth, checkRole(["ADMIN", "STAFF"]), getUser);
app.get("/users/:id", verifyAuth, checkUser, getUser);
app.post("/users", verifyAuth, checkRole(["ADMIN"]), addUser); // Tạo STAFF
app.put("/users/:id", upload.single("image"), verifyAuth, updateUser);
app.delete("/users/:id", verifyAuth, checkRole(["ADMIN"]), deleteUser);

//router pets
app.get("/users/:userId/pets/:id", verifyAuth, getPet);
app.get("/users/:userId/pets", verifyAuth, getPet);
app.post(
  "/users/:userId/pets",
  upload.single("image"),
  verifyAuth,
  checkUser,
  checkRole(["CUSTOMER", "STAFF"]),
  addPet
);
app.put(
  "/users/:userId/pets/:id",
  upload.single("image"),
  verifyAuth,
  checkUser,
  checkRole(["CUSTOMER", "STAFF"]),
  updatePet
);
app.delete(
  "/users/:userId/pets/:id",
  verifyAuth,
  checkUser,
  checkRole(["CUSTOMER", "STAFF"]),
  deletePet
);

//run service
app.listen(USER_PORT, () => {
  console.log(`User service running on port: http://localhost:${USER_PORT}`);
});
