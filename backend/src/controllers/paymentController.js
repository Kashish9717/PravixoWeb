import mongoose from "mongoose";

import Payment from "../models/Payment.js";
import CreatorBankDetails from "../models/CreatorBankDetails.js";
import PaymentAuditLog from "../models/PaymentAuditLog.js";
import WebhookLog from "../models/WebhookLog.js";
import Notification from "../models/Notification.js";

import {
  createOrder,
  verifySignature,
  capturePayment,
  refundPayment as refundPaymentService,
  verifyWebhookSignature,
  createPayout,
} from "../services/paymentServices.js";

const HOLDING_DURATION = 72 * 60 * 60 * 1000;

/*
|--------------------------------------------------------------------------
| Helper: Validate ObjectId
|--------------------------------------------------------------------------
*/

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/*
|--------------------------------------------------------------------------
| Helper: Create Payment Audit Log
|--------------------------------------------------------------------------
*/

const createAuditLog = async ({
  paymentId,
  action,
  details,
}) => {
  return PaymentAuditLog.create({
    paymentId,
    action,
    details,
    createdAt: Date.now(),
  });
};

/*
|--------------------------------------------------------------------------
| Helper: Create Notification
|--------------------------------------------------------------------------
*/

const createNotification = async ({
  recipientId,
  senderId,
  type,
  text,
  taskId,
}) => {
  return Notification.create({
    recipientId,
    senderId,
    type,
    text,
    taskId,
    read: false,
    createdAt: Date.now(),
  });
};

/*
|--------------------------------------------------------------------------
| 1. INITIATE PAYMENT ORDER
|
| Convex:
| initiatePaymentOrder
|--------------------------------------------------------------------------
*/

export const initiatePaymentOrder = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!isValidObjectId(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Same validation as Convex
    |--------------------------------------------------------------------------
    */

    if (
      payment.paymentStatus !== "invoice_generated" &&
      payment.paymentStatus !== "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment order can only be created for pending/generated invoices",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Razorpay Order
    |--------------------------------------------------------------------------
    */

    const order = await createOrder({
      amount: payment.grossAmount,
      currency: payment.currency,
      receiptId: payment.invoiceNumber,
    });

    /*
    |--------------------------------------------------------------------------
    | Update Payment
    |--------------------------------------------------------------------------
    */

    payment.gatewayOrderId = order.id;
    payment.paymentStatus = "pending";
    payment.updatedAt = Date.now();

    await payment.save();

    /*
    |--------------------------------------------------------------------------
    | Audit Log
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      paymentId: payment._id,
      action: "Payment Initiated",
      details: `Razorpay Order ${order.id} initiated for checkout.`,
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("initiatePaymentOrder:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| 2. VERIFY PAYMENT SIGNATURE
|
| Convex:
| verifyPaymentSignature
|--------------------------------------------------------------------------
*/

export const verifyPaymentSignatureController = async (
  req,
  res
) => {
  try {
    const { paymentId } = req.params;

    if (!isValidObjectId(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const {
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
    } = req.body;

    if (
      !gatewayOrderId ||
      !gatewayPaymentId ||
      !gatewaySignature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Payment
    |--------------------------------------------------------------------------
    */

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Order ID
    |--------------------------------------------------------------------------
    */

    if (payment.gatewayOrderId !== gatewayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Gateway order ID does not match",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Razorpay Signature
    |--------------------------------------------------------------------------
    */

    const valid = verifySignature({
      orderId: gatewayOrderId,
      paymentId: gatewayPaymentId,
      signature: gatewaySignature,
    });

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Capture Payment
    |--------------------------------------------------------------------------
    */

    const capture = await capturePayment({
      paymentId: gatewayPaymentId,
      amount: payment.grossAmount,
      currency: payment.currency,
    });

    /*
    |--------------------------------------------------------------------------
    | Update Payment
    |--------------------------------------------------------------------------
    */

    const now = Date.now();

    payment.gatewayPaymentId = gatewayPaymentId;
    payment.gatewaySignature = gatewaySignature;
    payment.gatewayStatus = capture.status;

    payment.invoiceStatus = "paid";

    payment.paymentStatus = "holding";
    payment.holdingStatus = "holding";

    payment.holdingStartedAt = now;
    payment.holdingEndsAt =
      now + HOLDING_DURATION;

    payment.transactionReference =
      "TXN-" + gatewayPaymentId;

    payment.paymentMethod =
      capture.method;

    payment.updatedAt = now;

    await payment.save();

    /*
    |--------------------------------------------------------------------------
    | Audit Log: Payment Verified
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      paymentId: payment._id,
      action: "Payment Verified",
      details: `Razorpay Signature Verified. Txn ref: ${gatewayPaymentId}`,
    });

    /*
    |--------------------------------------------------------------------------
    | Audit Log: Holding Started
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      paymentId: payment._id,
      action: "Holding Started",
      details:
        "Escrow funds locked in holding. 72-hour countdown dispute timer started.",
    });

    /*
    |--------------------------------------------------------------------------
    | Notification: Brand
    |--------------------------------------------------------------------------
    */

    await createNotification({
      recipientId: payment.brandId,
      senderId: payment.creatorId,
      type: "payment_successful",
      text: `Escrow payment of ₹${payment.grossAmount.toLocaleString()} successful. Ref: ${gatewayPaymentId}`,
      taskId: payment.taskId,
    });

    /*
    |--------------------------------------------------------------------------
    | Notification: Creator
    |--------------------------------------------------------------------------
    */

    await createNotification({
      recipientId: payment.creatorId,
      senderId: payment.brandId,
      type: "payment_secured",
      text: `Escrow payout of ₹${payment.creatorAmount.toLocaleString()} secured in holding.`,
      taskId: payment.taskId,
    });

    /*
    |--------------------------------------------------------------------------
    | Notification: New Payment
    |--------------------------------------------------------------------------
    */

    await createNotification({
      recipientId: payment.brandId,
      senderId: payment.creatorId,
      type: "new_payment",
      text: `New Escrow Payment secured: ₹${payment.grossAmount.toLocaleString()}`,
      taskId: payment.taskId,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error(
      "verifyPaymentSignature:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| 3. RAISE DISPUTE
|
| Convex:
| raiseDispute
|--------------------------------------------------------------------------
*/

export const raiseDispute = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!isValidObjectId(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Dispute only during holding
    |--------------------------------------------------------------------------
    */

    if (payment.paymentStatus !== "holding") {
      return res.status(400).json({
        success: false,
        message:
          "Dispute can only be raised during active escrow holds.",
      });
    }

    const now = Date.now();

    payment.paymentStatus = "disputed";
    payment.holdingStatus = "disputed";
    payment.updatedAt = now;

    await payment.save();

    /*
    |--------------------------------------------------------------------------
    | Audit Log
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      paymentId: payment._id,
      action: "Dispute Raised",
      details:
        "Escrow dispute requested by Brand. Release countdown paused.",
    });

    /*
    |--------------------------------------------------------------------------
    | Notification
    |
    | Same behavior as Convex
    |--------------------------------------------------------------------------
    */

    await createNotification({
      recipientId: payment.brandId,
      senderId: payment.brandId,
      type: "dispute_raised",
      text: `Brand raised dispute on Payment: ${payment._id}`,
      taskId: payment.taskId,
    });

    return res.status(200).json({
      success: true,
      message: "Dispute raised successfully",
    });
  } catch (error) {
    console.error("raiseDispute:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| 4. RAZORPAY WEBHOOK
|
| Convex:
| handleWebhookEvent
|--------------------------------------------------------------------------
*/

export const handleWebhookEvent = async (
  req,
  res
) => {
  const rawBody = req.body;

  try {
    /*
    |--------------------------------------------------------------------------
    | Webhook Signature
    |--------------------------------------------------------------------------
    */

    const signature =
      req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature missing",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Webhook Signature
    |--------------------------------------------------------------------------
    */

    const isValid =
      verifyWebhookSignature({
        rawBody,
        signature,
      });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Parse Body
    |--------------------------------------------------------------------------
    */

    const payloadString =
      Buffer.isBuffer(rawBody)
        ? rawBody.toString()
        : JSON.stringify(rawBody);

    const parsed = JSON.parse(
      payloadString
    );

    const event = parsed.event;
    const now = Date.now();

    /*
    |--------------------------------------------------------------------------
    | Save Webhook Log
    |--------------------------------------------------------------------------
    */

    await WebhookLog.create({
      gateway: "razorpay",
      event,
      payload: payloadString,
      status: "processed",
      createdAt: now,
    });

    /*
    |--------------------------------------------------------------------------
    | Extract Razorpay Entities
    |--------------------------------------------------------------------------
    */

    const payloadObj =
      parsed.payload || parsed;

    const paymentEntity =
      payloadObj?.payment?.entity;

    const orderEntity =
      payloadObj?.order?.entity;

    const refundEntity =
      payloadObj?.refund?.entity;

    const orderId =
      paymentEntity?.order_id ||
      orderEntity?.id;

    /*
    |--------------------------------------------------------------------------
    | PAYMENT SUCCESS
    |--------------------------------------------------------------------------
    */

    if (
      event === "payment.authorized" ||
      event === "payment.captured" ||
      event === "order.paid"
    ) {
      if (orderId) {
        const payment =
          await Payment.findOne({
            gatewayOrderId: orderId,
          });

        if (
          payment &&
          payment.paymentStatus !== "completed" &&
          payment.paymentStatus !== "holding"
        ) {
          const payId =
            paymentEntity?.id ||
            payment.gatewayPaymentId ||
            "pay_webhook";

          payment.gatewayPaymentId =
            payId;

          payment.gatewayStatus =
            paymentEntity?.status ||
            "captured";

          payment.paymentStatus =
            "holding";

          payment.holdingStatus =
            "holding";

          payment.holdingStartedAt =
            now;

          payment.holdingEndsAt =
            now + HOLDING_DURATION;

          payment.paymentMethod =
            paymentEntity?.method ||
            "card";

          payment.updatedAt = now;

          await payment.save();

          await createAuditLog({
            paymentId: payment._id,
            action: "Payment Captured",
            details: `Webhook ${event} captured transaction successfully. Ref: ${payId}`,
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT FAILED
    |--------------------------------------------------------------------------
    */

    else if (
      event === "payment.failed"
    ) {
      if (orderId) {
        const payment =
          await Payment.findOne({
            gatewayOrderId: orderId,
          });

        if (payment) {
          payment.paymentStatus =
            "pending";

          payment.gatewayStatus =
            "failed";

          payment.updatedAt = now;

          await payment.save();

          await createAuditLog({
            paymentId: payment._id,
            action: "Payment Failed",
            details: `Webhook payment.failed received. Reason: ${
              paymentEntity?.error_description ||
              "Unknown error"
            }`,
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | REFUND PROCESSED
    |--------------------------------------------------------------------------
    */

    else if (
      event === "refund.processed"
    ) {
      const gatewayPaymentId =
        refundEntity?.payment_id ||
        paymentEntity?.id;

      if (gatewayPaymentId) {
        const payment =
          await Payment.findOne({
            gatewayPaymentId,
          });

        if (payment) {
          payment.paymentStatus =
            "refunded";

          payment.holdingStatus =
            "refunded";

          payment.refundStatus =
            "processed";

          payment.refundAmount =
            refundEntity?.amount
              ? refundEntity.amount / 100
              : payment.grossAmount;

          payment.updatedAt = now;

          await payment.save();

          await createAuditLog({
            paymentId: payment._id,
            action: "Refund Processed",
            details: `Webhook refund.processed executed. Refund ref: ${
              refundEntity?.id || "N/A"
            }. Funds returned to Brand.`,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(
      "handleWebhookEvent:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Error Webhook Log
    |--------------------------------------------------------------------------
    */

    try {
      const errorPayload =
        Buffer.isBuffer(req.body)
          ? req.body.toString()
          : JSON.stringify(req.body);

      let errorEvent = "unknown";

      try {
        const parsed =
          JSON.parse(errorPayload);

        errorEvent =
          parsed?.event || "unknown";
      } catch {
        // Keep unknown event
      }

      await WebhookLog.create({
        gateway: "razorpay",
        event: errorEvent,
        payload: errorPayload,
        status: "error",
        createdAt: Date.now(),
      });
    } catch (logError) {
      console.error(
        "Webhook logging failed:",
        logError
      );
    }

    return res.status(500).json({
      success: false,
      message:
        "Webhook processing failed",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 5. SAVE CREATOR BANK DETAILS
|
| Convex:
| saveCreatorBankDetails
|--------------------------------------------------------------------------
*/

export const saveCreatorBankDetails = async (
  req,
  res
) => {
  try {
    const {
      fullName,
      phone,
      email,
      bankName,
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifsc,
      upiId,
      panNumber,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Required Fields
    |--------------------------------------------------------------------------
    */

    if (
      !fullName ||
      !phone ||
      !email ||
      !bankName ||
      !accountHolderName ||
      !accountNumber ||
      !confirmAccountNumber ||
      !ifsc ||
      !panNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required bank details are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Account Number Match
    |--------------------------------------------------------------------------
    */

    if (
      accountNumber !==
      confirmAccountNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bank account numbers do not match",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | IFSC Validation
    |--------------------------------------------------------------------------
    */

    if (
      ifsc.trim().length !== 11
    ) {
      return res.status(400).json({
        success: false,
        message:
          "IFSC code must be exactly 11 characters",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAN Validation
    |--------------------------------------------------------------------------
    */

    if (
      panNumber.trim().length !== 10
    ) {
      return res.status(400).json({
        success: false,
        message:
          "PAN Card Number must be exactly 10 characters",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Auth
    |
    | Change req.user.profileId if your
    | auth middleware uses another property.
    |--------------------------------------------------------------------------
    */

    const creatorId =
      req.user?.profileId;

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized user access",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Existing Bank Details
    |--------------------------------------------------------------------------
    */

    const existing =
      await CreatorBankDetails.findOne({
        creatorId,
      });

    const data = {
      creatorId,

      fullName:
        fullName.trim(),

      phone:
        phone.trim(),

      email:
        email.trim(),

      bankName:
        bankName.trim(),

      accountHolderName:
        accountHolderName.trim(),

      accountNumber:
        accountNumber.trim(),

      ifsc:
        ifsc.trim().toUpperCase(),

      upiId:
        upiId?.trim() || undefined,

      panNumber:
        panNumber.trim().toUpperCase(),
    };

    /*
    |--------------------------------------------------------------------------
    | Update Existing
    |--------------------------------------------------------------------------
    */

    if (existing) {
      Object.assign(
        existing,
        data
      );

      await existing.save();

      return res.status(200).json({
        success: true,
        id: existing._id,
        message:
          "Bank details updated successfully",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create New
    |--------------------------------------------------------------------------
    */

    const bankDetails =
      await CreatorBankDetails.create(
        data
      );

    return res.status(200).json({
      success: true,
      id: bankDetails._id,
      message:
        "Bank details saved successfully",
    });
  } catch (error) {
    console.error(
      "saveCreatorBankDetails:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| 6. GET CREATOR BANK DETAILS
|
| Convex:
| getCreatorBankDetails
|--------------------------------------------------------------------------
*/

export const getCreatorBankDetails =
  async (req, res) => {
    try {
      const { creatorId } =
        req.params;

      if (!isValidObjectId(creatorId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid creator ID",
        });
      }

      const bankDetails =
        await CreatorBankDetails.findOne({
          creatorId,
        }).lean();

      return res.status(200).json({
        success: true,
        data: bankDetails,
      });
    } catch (error) {
      console.error(
        "getCreatorBankDetails:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| 7. GET PAYMENTS FOR BRAND
|
| Convex:
| getPaymentsForBrand
|--------------------------------------------------------------------------
*/

export const getPaymentsForBrand =
  async (req, res) => {
    try {
      const { brandId } =
        req.params;

      if (!isValidObjectId(brandId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid brand ID",
        });
      }

      const payments =
        await Payment.find({
          brandId,
        })
          .sort({
            createdAt: -1,
          })
          .populate("campaignId")
          .populate("creatorId")
          .lean();

      const paymentIds =
        payments.map(
          (payment) => payment._id
        );

      const auditLogs =
        paymentIds.length
          ? await PaymentAuditLog.find({
              paymentId: {
                $in: paymentIds,
              },
            }).lean()
          : [];

      const result =
        payments.map(
          (payment) => ({
            ...payment,

            campaign:
              payment.campaignId,

            creator:
              payment.creatorId,

            auditLogs:
              auditLogs.filter(
                (log) =>
                  String(
                    log.paymentId
                  ) ===
                  String(
                    payment._id
                  )
              ),
          })
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "getPaymentsForBrand:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| 8. GET PAYMENTS FOR CREATOR
|
| Convex:
| getPaymentsForCreator
|--------------------------------------------------------------------------
*/

export const getPaymentsForCreator =
  async (req, res) => {
    try {
      const { creatorId } =
        req.params;

      if (!isValidObjectId(creatorId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid creator ID",
        });
      }

      const payments =
        await Payment.find({
          creatorId,
        })
          .sort({
            createdAt: -1,
          })
          .populate("campaignId")
          .populate("brandId")
          .lean();

      const paymentIds =
        payments.map(
          (payment) => payment._id
        );

      const auditLogs =
        paymentIds.length
          ? await PaymentAuditLog.find({
              paymentId: {
                $in: paymentIds,
              },
            }).lean()
          : [];

      const result =
        payments.map(
          (payment) => ({
            ...payment,

            campaign:
              payment.campaignId,

            brand:
              payment.brandId,

            auditLogs:
              auditLogs.filter(
                (log) =>
                  String(
                    log.paymentId
                  ) ===
                  String(
                    payment._id
                  )
              ),
          })
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "getPaymentsForCreator:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| 9. RELEASE SINGLE HOLDING PAYMENT
|
| Convex:
| releaseHoldingPaymentInternal
|--------------------------------------------------------------------------
*/

export const releaseHoldingPayment =
  async (payment) => {
    /*
    |--------------------------------------------------------------------------
    | Get Creator Bank Details
    |--------------------------------------------------------------------------
    */

    const bankDetails =
      await CreatorBankDetails.findOne({
        creatorId:
          payment.creatorId,
      });

    if (!bankDetails) {
      throw new Error(
        "Creator bank details not found"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Payout
    |
    | IMPORTANT:
    | This follows your original Convex behavior.
    | Original Convex createPayout was a MOCK payout.
    |--------------------------------------------------------------------------
    */

    const payout =
      await createPayout({
        bankDetails,
        amount:
          payment.creatorAmount,
      });

    const now =
      Date.now();

    /*
    |--------------------------------------------------------------------------
    | Update Payment
    |--------------------------------------------------------------------------
    */

    payment.paymentStatus =
      "completed";

    payment.holdingStatus =
      "released";

    payment.releasedAt =
      now;

    payment.payoutStatus =
      "processed";

    payment.payoutReference =
      payout.referenceId;

    payment.creatorBankAccountId =
      bankDetails._id;

    payment.updatedAt =
      now;

    await payment.save();

    /*
    |--------------------------------------------------------------------------
    | Audit Log: Released
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      paymentId:
        payment._id,

      action:
        "Released",

      details:
        "Milestone hold cleared. Escrow funds marked Ready to Release.",
    });

    /*
    |--------------------------------------------------------------------------
    | Audit Log: Completed
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      paymentId:
        payment._id,

      action:
        "Completed",

      details:
        `Payout completed to bank account: ref ${payout.referenceId}`,
    });

    /*
    |--------------------------------------------------------------------------
    | Notify Creator
    |--------------------------------------------------------------------------
    */

    await createNotification({
      recipientId:
        payment.creatorId,

      senderId:
        payment.brandId,

      type:
        "payment_released",

      text:
        `Escrow payout of ₹${payment.creatorAmount.toLocaleString()} has been credited to your bank account.`,

      taskId:
        payment.taskId,
    });

    /*
    |--------------------------------------------------------------------------
    | Notify Brand
    |--------------------------------------------------------------------------
    */

    await createNotification({
      recipientId:
        payment.brandId,

      senderId:
        payment.creatorId,

      type:
        "payment_released",

      text:
        `Escrow payment of ₹${payment.grossAmount.toLocaleString()} has been released to Creator.`,

      taskId:
        payment.taskId,
    });

    return payout;
  };

/*
|--------------------------------------------------------------------------
| 10. CHECK AND RELEASE EXPIRED PAYMENTS
|
| Convex:
| checkAndReleasePayments
|--------------------------------------------------------------------------
*/

export const checkAndReleasePayments =
  async () => {
    const now =
      Date.now();

    const payments =
      await Payment.find({
        paymentStatus:
          "holding",

        holdingStatus:
          "holding",

        holdingEndsAt: {
          $lte: now,
        },
      });

    const results = [];

    for (const payment of payments) {
      try {
        const payout =
          await releaseHoldingPayment(
            payment
          );

        results.push({
          paymentId:
            payment._id,

          success:
            true,

          payout,
        });
      } catch (error) {
        console.error(
          `Payout failed for payment ${payment._id}:`,
          error
        );

        payment.payoutStatus =
          "failed";

        payment.updatedAt =
          Date.now();

        await payment.save();

        results.push({
          paymentId:
            payment._id,

          success:
            false,

          error:
            error.message,
        });
      }
    }

    return results;
  };

/*
|--------------------------------------------------------------------------
| 11. REFUND PAYMENT
|
| Convex:
| refundPayment
|--------------------------------------------------------------------------
*/

export const refundPayment =
  async (req, res) => {
    try {
      const { paymentId } =
        req.params;

      const {
        amount,
        reason,
      } = req.body;

      if (!isValidObjectId(paymentId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment ID",
        });
      }

      const payment =
        await Payment.findById(
          paymentId
        );

      if (!payment) {
        return res.status(404).json({
          success: false,
          message:
            "Payment record not found",
        });
      }

      if (!payment.gatewayPaymentId) {
        return res.status(400).json({
          success: false,
          message:
            "Gateway payment ID not available",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Refund Amount
      |--------------------------------------------------------------------------
      */

      const refundAmount =
        amount || payment.grossAmount;

      if (
        Number(refundAmount) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Refund amount must be greater than zero",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Razorpay Refund
      |--------------------------------------------------------------------------
      */

      const refund =
        await refundPaymentService({
          paymentId:
            payment.gatewayPaymentId,

          amount:
            refundAmount,

          reason:
            reason ||
            "Payment refund",
        });

      const now =
        Date.now();

      /*
      |--------------------------------------------------------------------------
      | Update Payment
      |--------------------------------------------------------------------------
      */

      payment.refundStatus =
        "processed";

      payment.refundAmount =
        refund.amount;

      payment.refundReason =
        reason ||
        "Payment refund";

      payment.paymentStatus =
        "refunded";

      payment.holdingStatus =
        "refunded";

      payment.updatedAt =
        now;

      await payment.save();

      /*
      |--------------------------------------------------------------------------
      | Audit Log
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        paymentId:
          payment._id,

        action:
          "Refund Processed",

        details:
          `Refund processed. Refund ref: ${refund.id}`,
      });

      return res.status(200).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      console.error(
        "refundPayment:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };