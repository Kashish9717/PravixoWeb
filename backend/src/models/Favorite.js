import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    creatorId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index(
  { brandId: 1, creatorId: 1 },
  { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;