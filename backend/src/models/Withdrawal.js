import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    withdrawalMethod: {
      type: String,
      default: "BANK_TRANSFER",
    },

    bankDetailsSnapshot: {
      accountHolderName: String,
      bankName: String,
      accountNumberMasked: String,
      ifsc: String,
      upiId: String,
    },

    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    payoutReference: {
      type: String,
      default: "",
    },

    failureReason: {
      type: String,
      default: "",
    },

    adminNotes: {
      type: String,
      default: "",
    },

    requestedAt: {
      type: Number,
      default: () => Date.now(),
    },

    processedAt: {
      type: Number,
      default: null,
    },

    completedAt: {
      type: Number,
      default: null,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

withdrawalSchema.index({ creatorId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;
