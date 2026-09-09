import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    let actualSenderId = req.user?._id || senderId;

    if (!actualSenderId && conversationId) {
      const conv = await Conversation.findById(conversationId);
      if (conv) {
        if (conv.adminId) {
          actualSenderId = conv.adminId;
        } else {
          const adminProfile = await Profile.findOne({ role: "admin" });
          if (adminProfile) actualSenderId = adminProfile._id;
        }
      }
    }

    if (!conversationId || !actualSenderId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const message = await Message.create({
      conversationId,
      senderId: actualSenderId,
      text: text.trim(),
      read: false,
    });

    const conversation = await Conversation.findById(conversationId);

    if (conversation) {
      let isUpdated = false;
      if (conversation.status === "pending") {
        conversation.status = "active";
        isUpdated = true;
      }
      if (conversation.archived) {
        conversation.archived = false;
        isUpdated = true;
      }
      if (isUpdated) {
        await conversation.save();
      }

      // Determine recipient for notification
      let recipientId = null;
      const actualSenderStr = actualSenderId.toString();

      if (conversation.creatorId && conversation.creatorId.toString() !== actualSenderStr) {
        recipientId = conversation.creatorId;
      } else if (conversation.brandId && conversation.brandId.toString() !== actualSenderStr) {
        recipientId = conversation.brandId;
      } else if (conversation.adminId && conversation.adminId.toString() !== actualSenderStr) {
        recipientId = conversation.adminId;
      }

      if (recipientId) {
        const senderProfile = await Profile.findById(actualSenderId).select("fullName role").lean();
        const senderName = senderProfile?.fullName || (senderProfile?.role === "admin" ? "Pravixo Admin" : "User");

        await Notification.create({
          recipientId,
          senderId: actualSenderId,
          type: "admin_message",
          text: `New message from ${senderName}: "${text.trim().slice(0, 60)}${text.trim().length > 60 ? "..." : ""}"`,
          createdAt: Date.now(),
        }).catch((notifErr) => console.warn("Could not dispatch message notification:", notifErr));
      }
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

// Unsend message
export const unsendMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required.",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (message.senderId.toString() !== profileId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only unsend your own messages.",
      });
    }

    message.unsent = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message unsent successfully.",
      data: message,
    });
  } catch (error) {
    console.error("Unsend message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to unsend message.",
    });
  }
};