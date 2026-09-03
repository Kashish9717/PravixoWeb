import mongoose from "mongoose";

const videoReviewSchema = new mongoose.Schema(
  {
    thumbnailUrl: {
      type: String,
    },

    videoUrl: {
      type: String,
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

const VideoReview = mongoose.model("VideoReview", videoReviewSchema);

export default VideoReview;