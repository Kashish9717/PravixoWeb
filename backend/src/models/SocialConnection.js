import mongoose from "mongoose";

const socialConnectionSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    ownerType: {
      type: String,
      enum: ["creator", "brand"],
      required: true,
    },

    platform: {
      type: String,
      required: true,
    },

    handle: {
      type: String,
      required: true,
    },

    accountId: {
      type: String,
      required: true,
    },

    encryptedAccessToken: String,

    encryptedRefreshToken: String,

    expiresAt: Number,

    verified: {
      type: Boolean,
      required: true,
    },

    lastSyncedAt: Number,

    syncStatus: {
      type: String,
      enum: ["success", "failed", "syncing"],
      default: "success",
    },

    syncMode: {
      type: String,
      enum: ["live", "manual"],
      default: "live",
    },

    lastError: String,

    failureCount: {
      type: Number,
      default: 0,
    },

    accountHealth: {
      type: String,
      enum: ["healthy", "warning", "error"],
      default: "healthy",
    },

    followers: Number,

    subscribers: Number,

    views: Number,

    engagementRate: Number,
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

socialConnectionSchema.index({ profileId: 1 });

socialConnectionSchema.index({
  profileId: 1,
  platform: 1,
});

socialConnectionSchema.index({
  verified: 1,
});

// =========================
// MODEL
// =========================

const SocialConnection = mongoose.model(
  "SocialConnection",
  socialConnectionSchema
);

export default SocialConnection;