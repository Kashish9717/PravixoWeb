import mongoose from "mongoose";

const paymentAuditLogSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    details: {
      type: String,
    },

    createdAt: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const PaymentAuditLog = mongoose.model(
  "PaymentAuditLog",
  paymentAuditLogSchema
);

export default PaymentAuditLog;