import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors"
import { INDENTITY_PORT,MONGO_INDENTITY_URI,CLIENT_TARGET } from "../../configs/config.js";
import { handleLogin, handleRegister, handleLogout} from "./controllers/indentityController.js"
import { ActivationRequired, handleActivate, ChangePasswordRequired, handleChangePassword} from "./controllers/verifyController.js"

const app = express();

//connect mongoDB
mongoose
  .connect(MONGO_INDENTITY_URI)
  .then(() => console.log("Indentity DB connection successful!"))
  .catch((err) => console.error(err));


//middle ware
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: CLIENT_TARGET,
    credentials: true,
  })
);


//router indentity
app.post("/login",handleLogin)
app.post("/register", handleRegister)
app.post("/logout", handleLogout)

//router verify 
app.post("/required-activate",ActivationRequired)
app.get("/activate",handleActivate)
app.post("/required-change-password",ChangePasswordRequired)
app.post("/forgot-password",handleChangePassword)

//run service
app.listen(INDENTITY_PORT, () => {
  console.log(`User service running on port: http://localhost:${INDENTITY_PORT}`);
});
