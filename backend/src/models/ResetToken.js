import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// TTL INDEX
// Automatically deletes
// expired reset tokens
// =========================

resetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// =========================
// MODEL
// =========================

const ResetToken = mongoose.model(
  "ResetToken",
  resetTokenSchema
);

export default ResetToken;