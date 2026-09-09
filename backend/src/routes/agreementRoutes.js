import express from "express";
import { protect } from "../middleware/auth.js";
import {
  generateAgreement,
  getAgreementByCollaboration,
  getAgreementVersions,
  getAgreementById,
  signAgreement,
  getAgreementSignatures,
  generateAgreementPdf,
  getAgreementPdf,
  sendAgreementPdfToChat,
} from "../controllers/agreementController.js";

const router = express.Router();

// Generate or retrieve agreement for a collaboration
router.post("/collaboration/:connectionId/generate", protect, generateAgreement);

// Get latest agreement for a collaboration
router.get("/collaboration/:connectionId", protect, getAgreementByCollaboration);

// Get all versions for a collaboration
router.get("/collaboration/:connectionId/versions", protect, getAgreementVersions);

// Sign / Accept agreement
router.post("/:agreementId/sign", protect, signAgreement);

// Get signatures for agreement
router.get("/:agreementId/signatures", protect, getAgreementSignatures);

// Generate / retrieve final signed PDF for agreement
router.post("/:agreementId/generate-pdf", protect, generateAgreementPdf);

// Send final signed PDF to collaboration chat
router.post("/:agreementId/send-chat", protect, sendAgreementPdfToChat);

// Get / view signed PDF for agreement
router.get("/:agreementId/pdf", protect, getAgreementPdf);

// Get agreement by unique Agreement ID or MongoDB ID
router.get("/:agreementId", protect, getAgreementById);

export default router;


