import mongoose from "mongoose";

const socialAnalyticsHistorySchema = new mongoose.Schema(
  {
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialConnection",
      required: true,
    },

    timestamp: {
      type: Number,
      required: true,
    },

    followers: {
      type: Number,
      required: true,
    },

    views: {
      type: Number,
    },

    engagementRate: {
      type: Number,
    },

    metadata: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

socialAnalyticsHistorySchema.index({
  connectionId: 1,
});

socialAnalyticsHistorySchema.index({
  connectionId: 1,
  timestamp: -1,
});

// =========================
// MODEL
// =========================

const SocialAnalyticsHistory =
  mongoose.model(
    "SocialAnalyticsHistory",
    socialAnalyticsHistorySchema
  );

export default SocialAnalyticsHistory;