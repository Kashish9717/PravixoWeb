import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";

export const listCampaigns = async (req, res) => {
  try {
    const { brandId } = req.query;

    const filter = brandId
      ? { brandId }
      : {};

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("List campaigns error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns.",
    });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID.",
      });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Get campaign error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch campaign.",
    });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const {
      brandId,
      title,
      budget,
      category,
      duration,
      active,
    } = req.body;

    if (
      !brandId ||
      !title ||
      !budget ||
      !category ||
      !duration ||
      active === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required campaign fields are missing.",
      });
    }

    const campaign = await Campaign.create({
      brandId,
      title,
      budget,
      category,
      duration,
      active,
      createdAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Create campaign error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create campaign.",
    });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID.",
      });
    }

    const {
      title,
      budget,
      category,
      duration,
      active,
    } = req.body;

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      {
        title,
        budget,
        category,
        duration,
        active,
      },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Update campaign error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update campaign.",
    });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID.",
      });
    }

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully.",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete campaign.",
    });
  }
};

export const getActiveCampaignsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID.",
      });
    }

    const campaigns = await Campaign.find({
      brandId,
      active: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Get active campaigns error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch active campaigns.",
    });
  }
};