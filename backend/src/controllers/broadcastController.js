import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import { sendPushToUsers } from "../utils/webPush.js";

// POST /api/admin/broadcast
export const sendBroadcast = async (req, res) => {
  try {
    const { title, message, audience = "all", targetUrl = "/" } = req.body;
    const adminId = req.user?._id || req.user?.profileId || req.body.adminId;

    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required for broadcast.",
      });
    }

    // Build role filter based on audience
    let roleFilter = {};
    if (audience === "creators") {
      roleFilter = { role: "creator" };
    } else if (audience === "brands") {
      roleFilter = { role: "brand" };
    } else {
      // "all"
      roleFilter = { role: { $in: ["creator", "brand"] } };
    }

    // Exclude deleted profiles
    roleFilter.isDeleted = { $ne: true };

    const recipients = await Profile.find(roleFilter).select("_id").lean();

    if (!recipients || recipients.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found for the selected audience.",
        count: 0,
      });
    }

    const recipientIds = recipients.map((r) => r._id);
    const now = Date.now();

    // 1. Bulk create in-app notifications
    const notifications = recipientIds.map((userId) => ({
      recipientId: userId,
      senderId: adminId || userId,
      type: "admin_broadcast",
      text: `${title.trim()}: ${message.trim()}`,
      targetUrl: targetUrl || "/",
      createdAt: now,
    }));

    await Notification.insertMany(notifications, { ordered: false }).catch((err) =>
      console.error("Broadcast in-app insert error:", err.message)
    );

    // 2. Chunk web push to avoid overloading network/VAPID in batches of 500
    const chunkSize = 500;
    for (let i = 0; i < recipientIds.length; i += chunkSize) {
      const chunk = recipientIds.slice(i, i + chunkSize);
      sendPushToUsers(chunk, {
        title: title.trim(),
        body: message.trim(),
        icon: "/logo192.png",
        url: targetUrl || "/",
      }).catch((err) => console.error("Broadcast web push batch error:", err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Broadcast sent to ${recipientIds.length} users successfully.`,
      count: recipientIds.length,
    });
  } catch (error) {
    console.error("sendBroadcast error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send broadcast.",
      error: error.message,
    });
  }
};
