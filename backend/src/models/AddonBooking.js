import mongoose from "mongoose";

const addonBookingSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddonService",
      required: true,
    },

    bookingDate: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      required: true,
      default: "pending",
    },

    notes: {
      type: String,
    },

    createdAt: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  }
);

const AddonBooking = mongoose.model("AddonBooking", addonBookingSchema);

export default AddonBooking;