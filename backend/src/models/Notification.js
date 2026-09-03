import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_completed",
        "revision_requested",
        "task_approved",
        "payment_successful",
        "holding_started",
        "payment_secured",
        "payment_released",
        "new_payment",
        "payment_holding",
        "dispute_raised",
        "new_offer",
        "offer_expiring",
        "subscription_activated",
        "subscription_expired",
        "account_suspended",
        "account_deleted",
      ],
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampaignTask",
    },

    read: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, read: 1 });

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;