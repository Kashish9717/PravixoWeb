// Ye file review se related saari business logic handle karti hai. 5 function: canReview, submitReview, listReviewsForCreator, getAvegrageRating,toggleReviewVisibility


import mongoose from "mongoose";
import Review from "../models/Review.js";
import Profile from "../models/Profile.js";
import Conversation from "../models/Conversation.js";

// Check karta hai ki brand kisi creator ko review kar sakta hai ya nahi.
export const canReview = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { brandId } = req.query;

    if (!brandId) {
      return res.status(200).json({
        success: true,
        data: {
          canReview: false,
        },
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(creatorId) ||
      !mongoose.Types.ObjectId.isValid(brandId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator or brand ID.",
      });
    }

    // Verify brand exists and has brand role.
    const brand = await Profile.findById(brandId);

    if (!brand || brand.role !== "brand") {
      return res.status(200).json({
        success: true,
        data: {
          canReview: false,
        },
      });
    }

    // Find conversations between this brand and creator.
    const conversations = await Conversation.find({
      brandId,
      creatorId,
    }).lean();

    if (conversations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          canReview: false,
        },
      });
    }

    // Check if any collaboration has not been reviewed yet.
    for (const conversation of conversations) {
      const existingReview = await Review.findOne({
        conversationId: conversation._id,
      });

      if (!existingReview) {
        return res.status(200).json({
          success: true,
          data: {
            canReview: true,
            conversationId: conversation._id,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        canReview: false,
      },
    });
  } catch (error) {
    console.error("Can review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check review eligibility.",
    });
  }
};

// Brand kisi creator ke collaboration ke liye review submit karta hai.
export const submitReview = async (req, res) => {
  try {
    const {
      creatorId,
      brandId,
      conversationId,
      rating,
      title,
      text,
      campaignRef,
    } = req.body;

    // Basic required field validation.
    if (
      !creatorId ||
      !brandId ||
      !conversationId ||
      rating === undefined ||
      !title ||
      !text
    ) {
      return res.status(400).json({
        success: false,
        message: "Required review fields are missing.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(creatorId) ||
      !mongoose.Types.ObjectId.isValid(brandId) ||
      !mongoose.Types.ObjectId.isValid(conversationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided.",
      });
    }

    // 1. Verify reviewer is a brand.
    const brand = await Profile.findById(brandId);

    if (!brand || brand.role !== "brand") {
      return res.status(403).json({
        success: false,
        message: "Only authenticated Brands can submit reviews.",
      });
    }

    // 2. Verify target is a creator.
    const creator = await Profile.findById(creatorId);

    if (!creator || creator.role !== "creator") {
      return res.status(400).json({
        success: false,
        message: "Reviews can only be submitted for Creators.",
      });
    }

    // 3. Verify conversation exists and belongs to this brand + creator.
    const conversation = await Conversation.findById(conversationId);

    if (
      !conversation ||
      conversation.brandId.toString() !== brandId.toString() ||
      conversation.creatorId.toString() !== creatorId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid collaboration reference.",
      });
    }

    // 4. Ensure one review per collaboration.
    const existingReview = await Review.findOne({
      conversationId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "This collaboration has already been reviewed.",
      });
    }

    // 5. Validate rating.
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars.",
      });
    }

    // 6. Create review.
    const review = await Review.create({
      creatorId,
      brandId,
      conversationId,
      rating,
      title,
      text,
      campaignRef,
      visible: true,
      createdAt: Date.now(),
    });

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Submit review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review.",
    });
  }
};

// Creator ke saare reviews return karta hai.
export const listReviewsForCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    // Query parameter:
    // /api/reviews/creator/:creatorId?visibleOnly=true
    const visibleOnly = req.query.visibleOnly === "true";

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator ID.",
      });
    }

    const filter = {
      creatorId,
    };

    if (visibleOnly) {
      filter.visible = true;
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Add brand information to each review.
    const results = await Promise.all(
      reviews.map(async (review) => {
        const brandProfile = await Profile.findById(review.brandId).lean();

        return {
          ...review,
          brandName: brandProfile?.fullName || "Anonymous Brand",
          brandAvatar: brandProfile?.avatarUrl,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("List reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
    });
  }
};

// Creator ka average rating calculate karta hai.
export const getAverageRating = async (req, res) => {
  try {
    const { creatorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator ID.",
      });
    }

    const reviews = await Review.find({
      creatorId,
      visible: true,
    }).lean();

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          rating: 5.0,
          reviewsCount: 0,
        },
      });
    }

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const avgRating =
      Math.round((totalRating / reviews.length) * 10) / 10;

    return res.status(200).json({
      success: true,
      data: {
        rating: avgRating,
        reviewsCount: reviews.length,
      },
    });
  } catch (error) {
    console.error("Average rating error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate average rating.",
    });
  }
};

// Creator apne review ki visibility on/off kar sakta hai.
export const toggleReviewVisibility = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { creatorId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(reviewId) ||
      !mongoose.Types.ObjectId.isValid(creatorId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid review or creator ID.",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Verify ownership.
    if (review.creatorId.toString() !== creatorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized operation.",
      });
    }

    review.visible = !review.visible;

    await review.save();

    return res.status(200).json({
      success: true,
      data: {
        visible: review.visible,
      },
    });
  } catch (error) {
    console.error("Toggle review visibility error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review visibility.",
    });
  }
};