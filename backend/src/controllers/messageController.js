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