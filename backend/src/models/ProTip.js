import mongoose from "mongoose";

const proTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    iconName: {
      type: String,
      default: "Lightbulb",
    },

    author: {
      type: String,
      default: "",
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    createdAt: {
      type: Number,
      default: () => Date.now(),
    },

    updatedAt: {
      type: Number,
      default: () => Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const ProTip = mongoose.model("ProTip", proTipSchema);

export default ProTip;