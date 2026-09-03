import express from "express";

import {
  initiatePaymentOrder,
  verifyPaymentSignatureController,
  refundPayment,
  raiseDispute,
  handleWebhookEvent,
  saveCreatorBankDetails,
  getCreatorBankDetails,
  getPaymentsForBrand,
  getPaymentsForCreator,
} from "../controllers/paymentController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Payment Order
|--------------------------------------------------------------------------
*/

router.post(
  "/:paymentId/order",
  initiatePaymentOrder
);

/*
|--------------------------------------------------------------------------
| Verify Payment
|--------------------------------------------------------------------------
*/

router.post(
  "/:paymentId/verify",
  verifyPaymentSignatureController
);

/*
|--------------------------------------------------------------------------
| Refund Payment
|--------------------------------------------------------------------------
*/

router.post(
  "/:paymentId/refund",
  refundPayment
);

/*
|--------------------------------------------------------------------------
| Dispute
|--------------------------------------------------------------------------
*/

router.post(
  "/:paymentId/dispute",
  raiseDispute
);

/*
|--------------------------------------------------------------------------
| Creator Bank Details
|--------------------------------------------------------------------------
*/

router.post(
  "/bank-details",
  saveCreatorBankDetails
);

router.get(
  "/bank-details/:creatorId",
  getCreatorBankDetails
);

/*
|--------------------------------------------------------------------------
| Payment History
|--------------------------------------------------------------------------
*/

router.get(
  "/brand/:brandId",
  getPaymentsForBrand
);

router.get(
  "/creator/:creatorId",
  getPaymentsForCreator
);

/*
|--------------------------------------------------------------------------
| Razorpay Webhook
|--------------------------------------------------------------------------
*/

router.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  handleWebhookEvent
);

export default router;