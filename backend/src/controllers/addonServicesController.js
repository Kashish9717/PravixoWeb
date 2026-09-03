import mongoose from "mongoose";
import AddonService from "../models/AddonService.js";
import AddonBooking from "../models/AddonBooking.js";

export const listAddonServices = async (req, res) => {
  try {
    const enabledOnly = req.query.enabledOnly === "true";

    const filter = enabledOnly ? { enabled: true } : {};
    const services = await AddonService.find(filter);

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch addon services.",
    });
  }
};

export const createAddonService = async (req, res) => {
  try {
    const { name, description, imageUrl, price, enabled } = req.body;

    const service = await AddonService.create({
      name,
      description,
      imageUrl,
      price,
      enabled,
      createdAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create addon service.",
    });
  }
};

export const updateAddonService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
    }

    const { name, description, imageUrl, price, enabled } = req.body;

    const service = await AddonService.findByIdAndUpdate(
      id,
      {
        name,
        description,
        imageUrl,
        price,
        enabled,
      },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Addon service not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update addon service.",
    });
  }
};

export const deleteAddonService = async (req, res) => {
  try {
    const { id } = req.params;

    await AddonService.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Addon service deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete addon service.",
    });
  }
};

export const listAddonBookings = async (req, res) => {
  try {
    const { profileId } = req.query;

    const filter = profileId ? { profileId } : {};

    const bookings = await AddonBooking.find(filter);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch addon bookings.",
    });
  }
};

export const createAddonBooking = async (req, res) => {
  try {
    const { profileId, serviceId, notes } = req.body;

    const booking = await AddonBooking.create({
      profileId,
      serviceId,
      notes,
      bookingDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      status: "pending",
      createdAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create addon booking.",
    });
  }
};