import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, "..", ".env"),
});

//*Client
export const CLIENT_TARGET = "http://localhost:5173";

//*token
export const JWT_SECRET = process.env.JWT_SECRET || "TaiTriTrong";

//* Uploads
export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

//*Gateway
export const GATEWAY_PORT = process.env.GATEWAY_PORT || 5000;

//* INDENTITY_PORT
export const INDENTITY_PORT = process.env.INDENTITY_PORT || 5001;
export const MONGO_INDENTITY_URI =
  process.env.MONGO_INDENTITY_URI || "mongodb://localhost:27017/indentity";
export const INDENTITY_TARGET = `http://localhost:${INDENTITY_PORT}`;

//*User
export const USER_PORT = process.env.USER_PORT || 5002;
export const MONGO_USER_URI =
  process.env.MONGO_USER_URI || "mongodb://localhost:27017/user";
export const USER_TARGET = `http://localhost:${USER_PORT}`;

//*Shoping
export const SHOPPING_PORT = process.env.SHOPPING_PORT || 5003;
export const MONGO_SHOPPING_URI =
  process.env.MONGO_SHOPPING_URI || "mongodb://localhost:27017/shopping";
export const SHOPPING_TARGET = `http://localhost:${SHOPPING_PORT}`;

//*Promotion
export const PROMOTION_PORT = process.env.PROMOTION_PORT || 5004;
export const MONGO_PROMOTION_URI =
  process.env.MONGO_PROMOTION_URI || "mongodb://localhost:27017/promotion";
export const PROMOTION_TARGET = `http://localhost:${PROMOTION_PORT}`;

//* Email
export const EMAIL_PORT = process.env.EMAIL_PORT || 5005;
export const EMAIL_TARGET = `http://localhost:${EMAIL_PORT}`;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

//* Notification
export const NOTIFICATION_PORT = process.env.NOTIFICATION_PORT || 5006;
export const MONGO_NOTIFICATION_URI =
  process.env.MONGO_NOTIFICATION_URI ||
  "mongodb://localhost:27017/notification";
export const NOTIFICATION_TARGET = `http://localhost:${NOTIFICATION_PORT}`;
