import mongoose from "mongoose";
import Portfolio from "../models/Portfolio.js";
import cloudinary from "../config/cloudinary.js";

// =====================================================
// GET PORTFOLIO BY PROFILE
// Convex: getByProfile
// =====================================================

export const getByProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    const images = await Portfolio.find({
      profileId,
    })
      .sort({ sortOrder: 1 })
      .lean();

    const results = images.map((image) => ({
      ...image,
      url: image.imageUrl,
    }));

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio.",
    });
  }
};

// =====================================================
// ADD PORTFOLIO IMAGE
// Convex: addImage
//
// Cloudinary upload is handled through multer.
// =====================================================

export const addImage = async (req, res) => {
  try {
    const { profileId, sortOrder } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Portfolio image is required.",
      });
    }

    const getFileUrl = (file) => {
      if (!file) return null;
      if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
        return file.path;
      }
      return `/uploads/${file.filename}`;
    };

    const portfolioImage = await Portfolio.create({
      profileId,
      imageUrl: getFileUrl(req.file),
      cloudinaryPublicId: req.file.filename,
      sortOrder: Number(sortOrder) || 0,
    });


    return res.status(201).json({
      success: true,
      data: portfolioImage,
    });
  } catch (error) {
    console.error("Add portfolio image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add portfolio image.",
    });
  }
};

// =====================================================
// REMOVE PORTFOLIO IMAGE
// Convex: removeImage
// =====================================================

export const removeImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio image ID.",
      });
    }

    const image = await Portfolio.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Portfolio image not found.",
      });
    }

    // Delete from Cloudinary
    if (image.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(
        image.cloudinaryPublicId,
        {
          resource_type: "image",
        }
      );
    }

    // Delete from MongoDB
    await Portfolio.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Portfolio image removed successfully.",
    });
  } catch (error) {
    console.error(
      "Remove portfolio image error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove portfolio image.",
    });
  }
};