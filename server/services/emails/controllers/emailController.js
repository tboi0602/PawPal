import nodemailer from "nodemailer";
import handlebars from "handlebars";
import juice from "juice";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {  EMAIL_PASS , EMAIL_USER } from "../../../configs/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * @param {string} templateName 
 * @param {object} data 
 * @param {object} mailOptions
 */
export const sendEmailWithTemplate = async (
  templateName,
  data,
  mailOptions
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates",
      `${templateName}.hbs`
    );

    const source = fs.readFileSync(templatePath, "utf-8");

    const template = handlebars.compile(source);
    const htmlToSend = template(data);

    const htmlWithCss = juice(htmlToSend);

    await transporter.sendMail({
      ...mailOptions, 
      html: htmlWithCss,
    });

    console.log(`Email sent successfully using template: ${templateName}`);
  } catch (error) {
    console.error("Error sending email with template:", error);
    throw new Error("Could not send email");
  }
};