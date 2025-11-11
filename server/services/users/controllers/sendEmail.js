import { EMAIL_TARGET } from "../../../configs/config.js";

export async function sendEmail(templateName, to, subject, data) {
  const res = await fetch(`${EMAIL_TARGET}/send-email`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ templateName, to, subject, data }),
  });
  return res.json();
}
