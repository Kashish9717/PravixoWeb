import OfferAnalytics from "../models/OfferAnalytics.js";
import mongoose from "mongoose";

export const getOfferAnalytics = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID.",
      });
    }

    let analytics = await OfferAnalytics.findOne({ offerId }).lean();

    if (!analytics) {
      analytics = await OfferAnalytics.create({
        offerId,
        views: 0,
        clicks: 0,
        upgrades: 0,
        revenue: 0,
        updatedAt: Date.now(),
      });
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get offer analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch offer analytics.",
    });
  }
};

export const updateOfferAnalytics = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { views, clicks, upgrades, revenue } = req.body;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID.",
      });
    }

    const analytics = await OfferAnalytics.findOneAndUpdate(
      { offerId },
      {
        $inc: {
          views: views || 0,
          clicks: clicks || 0,
          upgrades: upgrades || 0,
          revenue: revenue || 0,
        },
        updatedAt: Date.now(),
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Update offer analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update offer analytics.",
    });
  }
};