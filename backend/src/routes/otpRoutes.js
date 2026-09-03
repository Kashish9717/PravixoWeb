import express from "express";

import {
  sendOtpController,
  verifyOtpController,
  sendResetLinkController,
} from "../controllers/otpController.js";

const router = express.Router();

// ============================================
// SEND OTP
// POST /api/otp/send
// ============================================
router.post("/send", sendOtpController);

// ============================================
// VERIFY OTP
// POST /api/otp/verify
// ============================================
router.post("/verify", verifyOtpController);

// ============================================
// SEND PASSWORD RESET LINK
// POST /api/otp/reset-link
// ============================================
router.post("/reset-link", sendResetLinkController);

export default router;