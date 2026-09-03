import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// TTL INDEX
// Automatically deletes
// expired OTP documents
// =========================

otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// =========================
// MODEL
// =========================

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;