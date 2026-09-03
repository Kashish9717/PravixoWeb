import mongoose from "mongoose";
import CampaignTask from "../models/CampaignTask.js";
import Connection from "../models/Connection.js";
import Campaign from "../models/Campaign.js";
import Payment from "../models/Payment.js";
import PaymentAuditLog from "../models/PaymentAuditLog.js";
import Notification from "../models/Notification.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseAmount = (budgetStr) => {
  const clean = String(budgetStr || "").replace(/[^\d]/g, "");
  const parsed = parseInt(clean, 10);

  return Number.isNaN(parsed) ? 1000 : parsed;
};

// ==========================================
// CREATE TASK
// Convex: createTask
// ==========================================
export const createTask = async (req, res) => {
  try {
    const {
      campaignId,
      creatorId,
      brandId,
      connectionId,
      conversationId,
      title,
      description,
      deliverables,
      priority,
      dueDate,
      notes,
    } = req.body;

    if (
      !creatorId ||
      !brandId ||
      !connectionId ||
      !title ||
      !description ||
      !deliverables ||
      !priority ||
      dueDate === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required task fields are missing.",
      });
    }

    const idsToCheck = [creatorId, brandId, connectionId];
    if (campaignId) idsToCheck.push(campaignId);
    if (conversationId) idsToCheck.push(conversationId);

    if (!idsToCheck.every(isValidId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided.",
      });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority.",
      });
    }

    // Verify connection exists and is accepted
    const connection = await Connection.findById(connectionId);

    if (!connection || connection.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign task to a non-connected creator.",
      });
    }

    const now = Date.now();

    const task = await CampaignTask.create({
      campaignId,
      creatorId,
      brandId,
      connectionId,
      conversationId,
      title,
      description,
      deliverables,
      priority,
      status: "assigned",
      dueDate,
      createdAt: now,
      updatedAt: now,
      notes: notes || "",
    });

    // Notify Creator
    await Notification.create({
      recipientId: creatorId,
      senderId: brandId,
      type: "task_assigned",
      text: `Brand has assigned a new task: "${title}"`,
      taskId: task._id,
      read: false,
      createdAt: now,
    });

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task.",
    });
  }
};

// ==========================================
// START TASK
// Convex: startTask
// ==========================================
export const startTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await CampaignTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: "Task already started or finished.",
      });
    }

    const now = Date.now();

    task.status = "in_progress";
    task.startedAt = now;
    task.updatedAt = now;

    await task.save();

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Start task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start task.",
    });
  }
};

// ==========================================
// SUBMIT TASK
// Convex: submitTask
// ==========================================
export const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const {
      submissionLink,
      notes,
      attachmentLink,
    } = req.body;

    if (!isValidId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    if (!submissionLink) {
      return res.status(400).json({
        success: false,
        message: "Submission link is required.",
      });
    }

    const task = await CampaignTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (
      task.status !== "in_progress" &&
      task.status !== "revision_requested"
    ) {
      return res.status(400).json({
        success: false,
        message: "Task is not in progress or in revision.",
      });
    }

    const now = Date.now();

    task.status = "completed";
    task.completedAt = now;
    task.submissionLink = submissionLink;
    task.notes = notes || "";
    task.attachmentLink = attachmentLink || "";
    task.updatedAt = now;

    await task.save();

    // Notify Brand
    await Notification.create({
      recipientId: task.brandId,
      senderId: task.creatorId,
      type: "task_completed",
      text: `Creator has completed the assigned task: "${task.title}"`,
      taskId: task._id,
      read: false,
      createdAt: now,
    });

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Submit task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit task.",
    });
  }
};

// ==========================================
// REVIEW TASK
// Convex: reviewTask
// ==========================================
export const reviewTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { action } = req.body;

    if (!isValidId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    if (!["approve", "revision"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either approve or revision.",
      });
    }

    const task = await CampaignTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Task is not completed/submitted for review.",
      });
    }

    const now = Date.now();

    // ==========================================
    // APPROVE
    // ==========================================
    if (action === "approve") {
      task.status = "approved";
      task.updatedAt = now;

      await task.save();

      // Fetch campaign to get budget
      const campaign = await Campaign.findById(task.campaignId);

      if (campaign) {
        const totalAmount = parseAmount(campaign.budget);

        const platformCommissionPercentage = 20;

        const platformCommission =
          (totalAmount * platformCommissionPercentage) / 100;

        const creatorAmount =
          totalAmount - platformCommission;

        // Prevent duplicate invoice
        const existing = await Payment.findOne({
          taskId: task._id,
        });

        if (!existing) {
          const payment = await Payment.create({
            campaignId: task.campaignId,
            taskId: task._id,
            conversationId: task.conversationId,
            connectionId: task.connectionId,
            brandId: task.brandId,
            creatorId: task.creatorId,

            paymentGateway: "razorpay",

            invoiceNumber: "INV-" + Date.now(),

            invoiceStatus: "issued",

            currency: "INR",

            grossAmount: totalAmount,

            platformCommissionPercentage,

            platformCommissionAmount: platformCommission,

            creatorAmount,

            holdingStatus: "inactive",

            paymentStatus: "invoice_generated",

            createdAt: now,
            updatedAt: now,
          });

          // Payment Audit Log
          await PaymentAuditLog.create({
            paymentId: payment._id,
            action: "Invoice Created",
            details: `Escrow invoice generated for gross amount of ₹${totalAmount.toLocaleString()}`,
            createdAt: now,
          });
        }
      }

      // Notify Creator
      await Notification.create({
        recipientId: task.creatorId,
        senderId: task.brandId,
        type: "task_approved",
        text: `Brand has approved your task: "${task.title}"`,
        taskId: task._id,
        read: false,
        createdAt: now,
      });

      return res.status(200).json({
        success: true,
        message: "Task approved successfully.",
        data: task,
      });
    }

    // ==========================================
    // REVISION
    // ==========================================
    task.status = "revision_requested";
    task.updatedAt = now;

    await task.save();

    // Notify Creator
    await Notification.create({
      recipientId: task.creatorId,
      senderId: task.brandId,
      type: "revision_requested",
      text: `Brand has requested a revision on your task: "${task.title}"`,
      taskId: task._id,
      read: false,
      createdAt: now,
    });

    return res.status(200).json({
      success: true,
      message: "Revision requested successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Review task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review task.",
    });
  }
};

// ==========================================
// GET TASKS FOR CREATOR
// Convex: getTasksForCreator
// ==========================================
export const getTasksForCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    if (!isValidId(creatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator ID.",
      });
    }

    const tasks = await CampaignTask.find({
      creatorId,
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      tasks.map(async (task) => {
        const campaign = await Campaign.findById(task.campaignId);

        const brand = await mongoose
          .model("Profile")
          .findById(task.brandId);

        return {
          ...task.toObject(),
          campaign,
          brand,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get creator tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch creator tasks.",
    });
  }
};

// ==========================================
// GET TASKS FOR BRAND
// Convex: getTasksForBrand
// ==========================================
export const getTasksForBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    if (!isValidId(brandId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID.",
      });
    }

    const tasks = await CampaignTask.find({
      brandId,
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      tasks.map(async (task) => {
        const campaign = await Campaign.findById(task.campaignId);

        const creator = await mongoose
          .model("Profile")
          .findById(task.creatorId);

        return {
          ...task.toObject(),
          campaign,
          creator,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get brand tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand tasks.",
    });
  }
};

// ==========================================
// GET NOTIFICATIONS
// Convex: getNotifications
// ==========================================
export const getNotifications = async (req, res) => {
  try {
    const { recipientId } = req.params;

    if (!isValidId(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID.",
      });
    }

    const notifications = await Notification.find({
      recipientId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

// ==========================================
// MARK NOTIFICATION READ
// Convex: markNotificationRead
// ==========================================
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!isValidId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    notification.read = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
};