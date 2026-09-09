import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
      index: true,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
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
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
      index: true,
    },

    payoutMethod: {
      type: String,
      default: "MANUAL_BANK_TRANSFER",
    },

    transactionReference: {
      type: String,
      required: true,
      unique: true,
    },

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    initiatedAt: {
      type: Number,
      default: () => Date.now(),
    },

    completedAt: {
      type: Number,
      default: () => Date.now(),
    },

    failureReason: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

payoutSchema.index({ creatorId: 1, status: 1 });

const Payout = mongoose.model("Payout", payoutSchema);

export default Payout;
