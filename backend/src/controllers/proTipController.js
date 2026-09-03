import ProTip from "../models/ProTip.js";

export const getProTips = async (req, res) => {
  try {
    const { targetRole } = req.query;

    const filter = {};

    if (targetRole) {
      filter.targetRole = targetRole;
    }

    const tips = await ProTip.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: tips,
    });
  } catch (error) {
    console.error("Get pro tips error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pro tips.",
    });
  }
};

export const createProTip = async (req, res) => {
  try {
    const tip = await ProTip.create(req.body);

    res.status(201).json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error("Create pro tip error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create pro tip.",
    });
  }
};

export const updateProTip = async (req, res) => {
  try {
    const tip = await ProTip.findByIdAndUpdate(
      req.params.tipId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: "Pro tip not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error("Update pro tip error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update pro tip.",
    });
  }
};

export const deleteProTip = async (req, res) => {
  try {
    const tip = await ProTip.findByIdAndDelete(req.params.tipId);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: "Pro tip not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pro tip deleted successfully.",
    });
  } catch (error) {
    console.error("Delete pro tip error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete pro tip.",
    });
  }
};