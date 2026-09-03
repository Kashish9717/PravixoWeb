import mongoose from "mongoose";

const trustReviewSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["trustpilot", "google", "client"],
      required: true,
    },

    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },

    reviewText: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
    },

    createdAt: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  }
);

const TrustReview = mongoose.model("TrustReview", trustReviewSchema);

export default TrustReview;