import mongoose from "mongoose";

const subscriptionOfferSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    discountPercentage: {
      type: Number,
    },

    discountAmount: {
      type: Number,
    },

    bannerImageUrl: {
      type: String,
    },

    bannerStorageId: {
      type: String,
    },

    expiryDate: {
      type: Number,
      required: true,
    },

    buttonText: {
      type: String,
      required: true,
      trim: true,
    },

    targetUsers: {
      type: String,
      enum: ["brands", "creators", "both"],
      required: true,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPackage",
      required: true,
      index: true,
    },

    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionOffer = mongoose.model(
  "SubscriptionOffer",
  subscriptionOfferSchema
);

export default SubscriptionOffer;