import mongoose from "mongoose";

const campaignTaskSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      index: true,
    },

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

    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    deliverables: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "assigned",
        "in_progress",
        "completed",
        "revision_requested",
        "approved",
      ],
      default: "assigned",
    },

    dueDate: {
      type: Number,
      required: true,
    },

    startedAt: Number,
    completedAt: Number,

    createdAt: {
      type: Number,
      required: true,
      default: Date.now,
    },

    updatedAt: {
      type: Number,
      required: true,
      default: Date.now,
    },

    submissionLink: String,
    notes: String,
    attachmentLink: String,
  },
  {
    timestamps: true,
  }
);

const CampaignTask = mongoose.model(
  "CampaignTask",
  campaignTaskSchema
);

export default CampaignTask;