import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
      index: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
      index: true,
    },
    creatorOrBrandType: {
      type: String,
      enum: ["creator", "brand"],
      required: true,
    },
    offerTitle: {
      type: String,
      required: true,
      trim: true,
    },
    conditionText: {
      type: String,
      required: true,
      trim: true,
    },
    offerCategory: {
      type: String,
      enum: ["discount", "monetary_bonus", "free_addon", "custom"],
      default: "discount",
    },
    discountPercent: {
      type: Number,
      min: 1,
      max: 90,
      default: null,
    },
    monetaryBonus: {
      type: Number,
      default: null,
    },
    validityHours: {
      type: Number,
      required: true,
      min: 1,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending_approval", "active", "rejected", "deleted"],
      default: "pending_approval",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound index for sidebar queries
offerSchema.index({ status: 1, expiresAt: 1 });

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
