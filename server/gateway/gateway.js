import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";

import {
  CLIENT_TARGET,
  GATEWAY_PORT,
  USER_TARGET,
  INDENTITY_TARGET,
  SHOPPING_TARGET,
  EMAIL_TARGET,
  NOTIFICATION_TARGET,
  PAYMENT_TARGET,
  SOLUTIONS_TARGET,
  REPORTING_TARGET,
} from "../configs/config.js";

import { verifyAuth } from "../middlewares/authRequired.js";
const app = express();

app.use(
  cors({
    origin: CLIENT_TARGET,
    credentials: true,
  })
);
app.use(morgan("tiny"));
app.use(cookieParser());

app.use(
  "/api-auth",
  createProxyMiddleware({
    target: INDENTITY_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-auth": "" },
  })
);
app.use(
  "/api-user",
  verifyAuth,
  createProxyMiddleware({
    target: USER_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-user": "" },
  })
);
app.use(
  "/api-shopping",
  verifyAuth,
  createProxyMiddleware({
    target: SHOPPING_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-shopping": "" },
  })
);

app.use(
  "/api-email",
  createProxyMiddleware({
    target: EMAIL_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-email": "" },
  })
);
app.use(
  "/api-notification",
  verifyAuth,
  createProxyMiddleware({
    target: NOTIFICATION_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-notification": "" },
  })
);
app.use(
  "/api-payment",
  verifyAuth,
  createProxyMiddleware({
    target: PAYMENT_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-payment": "" },
  })
);
app.use(
  "/api-solution",
  verifyAuth,
  createProxyMiddleware({
    target: SOLUTIONS_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-solution": "" },
  })
);
app.use(
  "/api-reporting",
  verifyAuth,
  createProxyMiddleware({
    target: REPORTING_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-reporting": "" },
  })
);
app.listen(GATEWAY_PORT, () =>
  console.log(`Gateway running on http://localhost:${GATEWAY_PORT}`)
);
