import "dotenv/config";
import crypto from "crypto";
import Otp from "../models/Otp.js";
import ResetToken from "../models/ResetToken.js";
import Profile from "../models/Profile.js";

// =====================================
// VERCEL PROXY MAILER (BYPASS RENDER RESTRICTIONS)
// =====================================
const sendEmail = async ({ to, subject, html, text, origin }) => {
  // Use the exact origin of the frontend that made the request to guarantee we hit the correct Vercel deployment (preview or production)
  const baseOrigin = origin || process.env.VERCEL_EMAIL_API_URL || "https://pravixo-kashish.vercel.app";
  // Remove trailing slash if present
  const cleanOrigin = baseOrigin.replace(/\/$/, "");
  const vercelApiUrl = `${cleanOrigin}/api/send-email`;
  const authSecret = process.env.VERCEL_API_SECRET || "fallback-secret-key-123";

  try {
    const response = await fetch(vercelApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authSecret}`,
      },
      body: JSON.stringify({ to, subject, html, text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Vercel API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Vercel proxy failed:", error);
    throw error;
  }
};

// =====================================
// HASH OTP
// =====================================
const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// =====================================
// GENERATE OTP
// =====================================
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// =====================================
// SEND OTP
// =====================================
export const sendOtp = async (email, origin) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const derivedUserId = `user_${Buffer.from(normalizedEmail).toString("base64").replace(/=/g, "")}`;
    const existingProfile = await Profile.findOne({ userId: derivedUserId });

    if (existingProfile) {
      const error = new Error("This email is already registered. Please sign in instead.");
      error.statusCode = 400;
      throw error;
    }

    await Otp.deleteMany({ email: normalizedEmail });
    const otpCode = generateOtp();
    const codeHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      email: normalizedEmail,
      codeHash,
      expiresAt,
      verified: false,
    });

    console.log("=========================================");
    console.log(`[DEV] OTP Code for ${normalizedEmail}: ${otpCode}`);
    console.log("=========================================");

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your email - Pravixo",
      origin,
      text: `Your verification code is ${otpCode}. This code will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px;">
          <h2>Pravixo Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px; text-align: center; background: #f5f5f5; border-radius: 8px;">
            ${otpCode}
          </div>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error("Send OTP error:", error);
    throw error;
  }
};

// =====================================
// VERIFY OTP
// =====================================
export const verifyOtp = async (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otpRecord = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

  if (!otpRecord) return { success: false, message: "No verification code found." };
  if (new Date() > otpRecord.expiresAt) {
    await Otp.deleteMany({ email: normalizedEmail });
    return { success: false, message: "Verification code has expired." };
  }

  const inputHash = hashOtp(otp);
  if (inputHash !== otpRecord.codeHash) return { success: false, message: "Invalid verification code." };

  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true, message: "Email verified successfully." };
};

// =====================================
// SEND RESET LINK
// =====================================
export const sendResetLink = async (email, origin) => {
  const normalizedEmail = email.trim().toLowerCase();
  const derivedUserId = `user_${Buffer.from(normalizedEmail).toString("base64").replace(/=/g, "")}`;
  const existingProfile = await Profile.findOne({ userId: derivedUserId });

  if (!existingProfile) {
    const error = new Error("No account found with this email address.");
    error.statusCode = 404;
    throw error;
  }

  await ResetToken.deleteMany({ email: normalizedEmail });
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await ResetToken.create({ email: normalizedEmail, token, expiresAt });
  const resetLink = `${origin}/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;

  console.log("=========================================");
  console.log(`[DEV] Password Reset Link for ${normalizedEmail}:`);
  console.log(resetLink);
  console.log("=========================================");

  await sendEmail({
    to: normalizedEmail,
    subject: "Reset your password - Pravixo",
    origin,
    text: `Please reset your password using this link (valid for 15 minutes):\n\n${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your Pravixo password.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p style="margin-top: 20px;">This link will expire in 15 minutes.</p>
      </div>
    `,
  });

  return { success: true, message: "Password reset link sent successfully." };
};