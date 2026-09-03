import mongoose from "mongoose";

const pricingTierSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    sortOrder: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PricingTier = mongoose.model("PricingTier", pricingTierSchema);

export default PricingTier;