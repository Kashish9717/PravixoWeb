import mongoose from "mongoose";

const offerAnalyticsSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionOffer",
      required: true,
      index: true,
    },

    views: {
      type: Number,
      required: true,
      default: 0,
    },

    clicks: {
      type: Number,
      required: true,
      default: 0,
    },

    upgrades: {
      type: Number,
      required: true,
      default: 0,
    },

    revenue: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const OfferAnalytics = mongoose.model(
  "OfferAnalytics",
  offerAnalyticsSchema
);

export default OfferAnalytics;