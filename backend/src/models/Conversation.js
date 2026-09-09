import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
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

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
      index: true,
    },

    conversationType: {
      type: String,
      enum: ["brand_creator", "admin_brand", "admin_creator"],
      default: "brand_creator",
      index: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },

    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({
  creatorId: 1,
  brandId: 1,
  campaignId: 1,
});

conversationSchema.index({
  adminId: 1,
  brandId: 1,
});

conversationSchema.index({
  adminId: 1,
  creatorId: 1,
});

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;