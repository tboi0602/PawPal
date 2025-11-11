import express from "express";
import "dotenv/config";
import morgan from "morgan";
import { sendEmailWithTemplate } from "./controllers/emailController.js";
import { EMAIL_PORT } from "../../configs/config.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.post("/send-email", async (req, res) => {
  const { templateName, to, subject, data } = req.body;

  const mailOptions = {
    from: '"PawPal" <no-reply@pawpal.com>',
    to: to,
    subject: subject,
  };

  try {
    await sendEmailWithTemplate(templateName, data, mailOptions);
    res.status(200).json({
      success: true,
      message: `Email with template '${templateName}'send successfully.`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Email error: ${error.message}` });
  }
});

app.listen(EMAIL_PORT, () => {
  console.log(`Email service running on port: ${EMAIL_PORT}`);
});
