import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Very basic security check to ensure it's called by our backend
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.VERCEL_API_SECRET || "fallback-secret-key-123"}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { to, subject, html, text } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: 465, // Vercel can safely use 465 without blocking
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"Pravixo" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Vercel Email Sending Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
