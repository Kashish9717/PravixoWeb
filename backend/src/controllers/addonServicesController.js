import mongoose from "mongoose";
import AddonService from "../models/AddonService.js";
import AddonBooking from "../models/AddonBooking.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";

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

    const bookings = await AddonBooking.find(filter)
      .populate("serviceId")
      .populate("profileId", "fullName email role handle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("List addon bookings error:", error);
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

    // Notify admins of new booking request
    try {
      const admins = await Profile.find({ role: "admin" }).select("_id");
      const service = await AddonService.findById(serviceId).select("name");
      const requester = await Profile.findById(profileId).select("fullName");
      const serviceName = service ? service.name : "Add-on Service";
      const senderName = requester ? requester.fullName : "A user";

      for (const admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          senderId: profileId,
          type: "addon_booking",
          text: `New Add-on Booking Request: ${senderName} requested "${serviceName}".`,
          link: "/addons",
          read: false,
          createdAt: Date.now(),
        });
      }
    } catch (notifErr) {
      console.error("Error creating booking notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Create addon booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create addon booking.",
    });
  }
};

export const updateAddonBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const booking = await AddonBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("serviceId").populate("profileId", "fullName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking marked as ${status}.`,
    });
  } catch (error) {
    console.error("Update addon booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
    });
  }
};

export const deleteAddonBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await AddonBooking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking request deleted successfully.",
    });
  } catch (error) {
    console.error("Delete addon booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking request.",
    });
  }
};