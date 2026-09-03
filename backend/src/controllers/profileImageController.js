import mongoose from "mongoose";
import PortfolioImage from "../models/PortfolioController.js";

export const listPortfolioImages = async (req, res) => {
  try {
    const { profileId } = req.query;

    const filter = profileId ? { profileId } : {};

    const images = await PortfolioImage.find(filter).sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio images.",
    });
  }
};

export const createPortfolioImage = async (req, res) => {
  try {
    const { profileId, imageStorageId, sortOrder } = req.body;

    if (!profileId || !imageStorageId || sortOrder === undefined) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const image = await PortfolioImage.create({
      profileId,
      imageStorageId,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create portfolio image.",
    });
  }
};

export const updatePortfolioImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio image ID.",
      });
    }

    const { imageStorageId, sortOrder } = req.body;

    const image = await PortfolioImage.findByIdAndUpdate(
      id,
      { imageStorageId, sortOrder },
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Portfolio image not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update portfolio image.",
    });
  }
};

export const deletePortfolioImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio image ID.",
      });
    }

    const image = await PortfolioImage.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Portfolio image not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Portfolio image deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete portfolio image.",
    });
  }
};

export const reorderPortfolioImages = async (req, res) => {
  try {
    const { images } = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images array is required.",
      });
    }

    await Promise.all(
      images.map((image) =>
        PortfolioImage.findByIdAndUpdate(image.id, {
          sortOrder: image.sortOrder,
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Portfolio images reordered successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reorder portfolio images.",
    });
  }
};