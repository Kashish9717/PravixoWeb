import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      default: null,
      index: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
      index: true,
    },

    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
      default: null,
    },

    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Withdrawal",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      default: "CREDIT",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
      index: true,
    },

    description: {
      type: String,
      default: "Collaboration payment release",
    },

    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    balanceAfter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ creatorId: 1, createdAt: -1 });
walletTransactionSchema.index({ payoutId: 1 }, { unique: true, sparse: true });

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);

export default WalletTransaction;
