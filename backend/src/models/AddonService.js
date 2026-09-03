import mongoose from "mongoose";

const addonServiceSchema = new mongoose.Schema(
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

    imageUrl: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },

    createdAt: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  }
);

const AddonService = mongoose.model("AddonService", addonServiceSchema);

export default AddonService;