import mongoose from "mongoose";
import VideoReview from "../models/VideoReview.js";

// =====================================
// GET ALL VIDEO REVIEWS
// GET /api/video-reviews
// =====================================

export const getVideoReviews = async (req, res) => {
  try {
    const { targetRole } = req.query;

    const filter = {};

    if (targetRole) {
      filter.targetRole = targetRole;
    }

    const reviews = await VideoReview.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get video reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch video reviews.",
    });
  }
};

// =====================================
// GET VIDEO REVIEW BY ID
// GET /api/video-reviews/:id
// =====================================

export const getVideoReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video review ID.",
      });
    }

    const review = await VideoReview.findById(id).lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Video review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Get video review by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch video review.",
    });
  }
};

// =====================================
// CREATE VIDEO REVIEW
// POST /api/video-reviews
// =====================================

export const createVideoReview = async (req, res) => {
  try {
    const review = await VideoReview.create(req.body);

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Create video review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create video review.",
    });
  }
};

// =====================================
// UPDATE VIDEO REVIEW
// PUT /api/video-reviews/:id
// =====================================

export const updateVideoReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video review ID.",
      });
    }

    const review = await VideoReview.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Video review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Update video review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update video review.",
    });
  }
};

// =====================================
// DELETE VIDEO REVIEW
// DELETE /api/video-reviews/:id
// =====================================

export const deleteVideoReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video review ID.",
      });
    }

    const review = await VideoReview.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Video review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete video review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete video review.",
    });
  }
};