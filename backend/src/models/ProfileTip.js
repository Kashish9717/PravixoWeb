import mongoose from "mongoose";

const proTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    iconName: {
      type: String,
      required: true,
      trim: true,
    },

    targetRole: {
      type: String,
      enum: ["brand", "creator"],
      required: true,
    },

    createdAt: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  }
);

const ProTip = mongoose.model("ProTip", proTipSchema);

export default ProTip;