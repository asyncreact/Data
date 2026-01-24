// backend/src/config/mail.js (ESM)
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, "../../.env"); // backend/.env
  const result = dotenv.config({ path: envPath });
  if (result.error) throw result.error;
}

function getMailConfig() {
  const { GMAIL_USER, GOOGLE_APP_PASSWORD } = process.env;

  if (!GMAIL_USER || !GOOGLE_APP_PASSWORD) {
    throw new Error("Faltan variables: GMAIL_USER y/o GOOGLE_APP_PASSWORD");
  }

  return { user: GMAIL_USER, pass: GOOGLE_APP_PASSWORD };
}

function createGmailTransporter({ user, pass }) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

loadEnv();
const config = getMailConfig();
const transporter = createGmailTransporter(config);

export async function sendApplicationEmail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: `"Amazon" <${config.user}>`,
    to,
    subject,
    text,
    html,
  });
}
