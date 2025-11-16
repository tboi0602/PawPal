import crypto from "crypto";
import { MOMO_SECRET_KEY } from "../configs/config.js";

export const createMoMoSignature = (rawSignature) => {
  return crypto
    .createHmac("sha256", MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");
};
