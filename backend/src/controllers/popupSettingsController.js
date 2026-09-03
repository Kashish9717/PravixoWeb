import PopupSetting from "../models/PopupSetting.js";
import mongoose from "mongoose";

export const getPopupSettings = async (req, res) => {
  try {
    const settings = await PopupSetting.findOne()
      .populate("activeOfferId")
      .lean();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get popup settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popup settings.",
    });
  }
};

export const updatePopupSettings = async (req, res) => {
  try {
    const {
      showPopup,
      popupFrequency,
      targetUsers,
      popupExpiry,
      activeOfferId,
    } = req.body;

    if (
      showPopup === undefined ||
      !popupFrequency ||
      !targetUsers ||
      !popupExpiry
    ) {
      return res.status(400).json({
        success: false,
        message: "Required popup settings are missing.",
      });
    }

    if (
      activeOfferId &&
      !mongoose.Types.ObjectId.isValid(activeOfferId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID.",
      });
    }

    const settings = await PopupSetting.findOneAndUpdate(
      {},
      {
        showPopup,
        popupFrequency,
        targetUsers,
        popupExpiry,
        activeOfferId: activeOfferId || undefined,
        updatedAt: Date.now(),
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Update popup settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update popup settings.",
    });
  }
};