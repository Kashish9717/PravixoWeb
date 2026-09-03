import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({
  profileId: 1,
  sortOrder: 1,
});

export default mongoose.model(
  "Portfolio",
  portfolioSchema
);