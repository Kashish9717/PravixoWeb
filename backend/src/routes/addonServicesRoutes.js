import express from "express";

import {
  listAddonServices,
  createAddonService,
  updateAddonService,
  deleteAddonService,
  listAddonBookings,
  createAddonBooking,
  updateAddonBookingStatus,
  deleteAddonBooking,
} from "../controllers/addonServicesController.js";

const router = express.Router();

router.get("/services", listAddonServices);
router.post("/services", createAddonService);
router.patch("/services/:id", updateAddonService);
router.delete("/services/:id", deleteAddonService);

router.get("/bookings", listAddonBookings);
router.post("/bookings", createAddonBooking);
router.patch("/bookings/:id", updateAddonBookingStatus);
router.delete("/bookings/:id", deleteAddonBooking);

export default router;