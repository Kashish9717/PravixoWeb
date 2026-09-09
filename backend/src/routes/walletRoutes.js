import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getMyWallet,
  getMyTransactions,
  requestWithdrawal,
  getMyWithdrawals,
} from "../controllers/walletController.js";

const router = express.Router();

// GET /api/wallet/my-wallet
router.get("/my-wallet", protect, getMyWallet);

// GET /api/wallet/my-transactions
router.get("/my-transactions", protect, getMyTransactions);

// POST /api/wallet/withdraw
router.post("/withdraw", protect, requestWithdrawal);

// GET /api/wallet/my-withdrawals
router.get("/my-withdrawals", protect, getMyWithdrawals);

export default router;
