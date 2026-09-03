import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampaignTask",
      required: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    paymentGateway: {
      type: String,
      required: true,
    },

    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    gatewayStatus: String,
    gatewayWebhookStatus: String,
    gatewayResponse: String,

    invoiceNumber: {
      type: String,
      required: true,
    },

    invoiceStatus: {
      type: String,
      required: true,
    },

    transactionReference: String,
    paymentMethod: String,

    currency: {
      type: String,
      required: true,
    },

    grossAmount: {
      type: Number,
      required: true,
    },

    platformCommissionPercentage: {
      type: Number,
      required: true,
    },

    platformCommissionAmount: {
      type: Number,
      required: true,
    },

    creatorAmount: {
      type: Number,
      required: true,
    },

    holdingStatus: {
      type: String,
      enum: [
        "inactive",
        "holding",
        "ready_to_release",
        "released",
        "disputed",
        "refunded",
      ],
      default: "inactive",
    },

    holdingStartedAt: Number,
    holdingEndsAt: Number,
    releasedAt: Number,

    refundStatus: {
      type: String,
      enum: ["inactive", "pending", "processed", "failed"],
      default: "inactive",
    },

    refundAmount: Number,
    refundReason: String,

    payoutStatus: {
      type: String,
      enum: ["pending", "processing", "processed", "failed"],
    },

    payoutReference: String,
    creatorBankAccountId: String,

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "invoice_generated",
        "payment_successful",
        "holding",
        "ready_to_release",
        "released",
        "completed",
        "disputed",
        "refunded",
      ],
      default: "pending",
    },

    createdAt: {
      type: Number,
      default: Date.now,
    },

    updatedAt: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ campaignId: 1 });
paymentSchema.index({ taskId: 1 });
paymentSchema.index({ conversationId: 1 });
paymentSchema.index({ connectionId: 1 });
paymentSchema.index({ brandId: 1 });
paymentSchema.index({ creatorId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;