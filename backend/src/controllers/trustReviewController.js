import TrustReview from "../models/TrustReview.js";

export const getTrustReviews = async (req, res) => {
  try {
    const { source } = req.query;

    const filter = {};

    if (source) {
      filter.source = source;
    }

    const reviews = await TrustReview.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get trust reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trust reviews.",
    });
  }
};

export const createTrustReview = async (req, res) => {
  try {
    const review = await TrustReview.create(req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Create trust review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create trust review.",
    });
  }
};

export const updateTrustReview = async (req, res) => {
  try {
    const review = await TrustReview.findByIdAndUpdate(
      req.params.reviewId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Trust review not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Update trust review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update trust review.",
    });
  }
};

export const deleteTrustReview = async (req, res) => {
  try {
    const review = await TrustReview.findByIdAndDelete(
      req.params.reviewId
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Trust review not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trust review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete trust review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete trust review.",
    });
  }
};