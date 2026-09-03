import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
    index: true,
  },

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
    index: true,
  },

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    default: null,
  },

  pitch: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  creatorNotificationSeen: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Number,
    default: Date.now,
  },

  updatedAt: {
    type: Number,
    default: Date.now,
  },
});

connectionSchema.index({ creatorId: 1, brandId: 1 });
connectionSchema.index({ creatorId: 1, campaignId: 1 });
connectionSchema.index({ brandId: 1, campaignId: 1 });

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;