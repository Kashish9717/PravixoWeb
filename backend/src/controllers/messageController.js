import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    if (!conversationId || !senderId || !text) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      text,
      read: false,
    });

    const conversation = await Conversation.findById(conversationId);

    if (conversation?.status === "pending") {
      conversation.status = "active";
      await conversation.save();
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