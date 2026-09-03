import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    budget: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      required: true,
    },

    createdAt: {
      type: Number,
      required: true,
      default: Date.now,
    },
  }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;