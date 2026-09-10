import express from "express";
import { protect } from "../middleware/auth.js";
import Subscription from "../models/Subscription.js";

const router = express.Router();

router.post("/subscribe", protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    await Subscription.findOneAndUpdate(
      { userId: req.user._id, endpoint: subscription.endpoint },
      { userId: req.user._id, endpoint: subscription.endpoint, keys: subscription.keys },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/test", protect, async (req, res) => {
  try {
    const { sendPushToUser } = await import("../utils/webPush.js");
    const result = await sendPushToUser(req.user._id, {
      title: "Test Notification 🚀",
      body: "Web Push Notifications are working perfectly on Pravixo!",
      url: "/dashboard",
    });
    res.json({ success: true, message: "Push sent", result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;