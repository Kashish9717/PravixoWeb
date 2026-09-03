import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    gateway: {
      type: String,
      required: true,
      trim: true,
      default: "razorpay",
    },

    event: {
      type: String,
      required: true,
      trim: true,
    },

    payload: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["processed", "error"],
      required: true,
      trim: true,
    },

    createdAt: {
      type: Number,
      default: () => Date.now(),
    },
  },
  {
    timestamps: false,
  }
);

// Useful for webhook history/debugging
webhookLogSchema.index({ gateway: 1 });
webhookLogSchema.index({ event: 1 });
webhookLogSchema.index({ status: 1 });
webhookLogSchema.index({ createdAt: -1 });

const WebhookLog = mongoose.model(
  "WebhookLog",
  webhookLogSchema
);

export default WebhookLog;