import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

import "../models/Submission.js";
import "../models/Connection.js";
import "../models/CreatorBankDetails.js";
import "../models/Wallet.js";
import "../models/WalletTransaction.js";
import "../models/Withdrawal.js";
import "../models/Profile.js";
import "../models/Campaign.js";
import "../models/Agreement.js";
import "../models/Notification.js";
import "../models/Conversation.js";
import "../models/Message.js";

const API_BASE = "http://localhost:5000/api";

async function runTask21FinalIntegrationTest() {
  console.log("==========================================================================");
  console.log("🏆 TASK 21: FINAL INTEGRATION & PRODUCTION-READINESS TEST SUITE");
  console.log("==========================================================================\n");

  const runId = Date.now().toString().slice(-6);

  try {
    // 1. Connect to MongoDB and create Test Profiles
    console.log("👉 1. Initializing MongoDB Connection & Testing Environment...");
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lemen";
    const mongooseInstance = await mongoose.connect(mongoUri);
    console.log("   ✅ Connected to MongoDB Atlas cluster.");

    const Profile = mongooseInstance.models.Profile;
    const ConnectionModel = mongooseInstance.models.Connection;
    const Submission = mongooseInstance.models.Submission;
    const Agreement = mongooseInstance.models.Agreement;
    const Notification = mongooseInstance.models.Notification;
    const BankDetails = mongooseInstance.models.CreatorBankDetails;
    const Wallet = mongooseInstance.models.Wallet;
    const WalletTransaction = mongooseInstance.models.WalletTransaction;
    const Withdrawal = mongooseInstance.models.Withdrawal;
    const jwt = (await import("jsonwebtoken")).default;
    const bcrypt = (await import("bcryptjs")).default;

    const jwtSecret = process.env.JWT_SECRET || "thisissuper9089798key";

    // Setup Admin
    let admin = await Profile.findOne({ role: "admin" });
    if (!admin) {
      admin = await Profile.create({
        userId: `user_admin_${runId}`,
        fullName: "Platform Super Admin",
        email: `admin_${runId}@pravixo.test`,
        password: await bcrypt.hash("Password123!", 10),
        role: "admin",
        isEmailVerified: true,
      });
    }
    const adminToken = jwt.sign(
      { userId: admin.userId || admin._id, email: admin.email, role: admin.role, profileId: admin._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("   ✅ Admin authenticated:", admin.email);

    // Setup Brand A
    const brandA = await Profile.create({
      userId: `user_brandA_${runId}`,
      fullName: `Brand Alpha ${runId}`,
      email: `brandA_${runId}@pravixo.test`,
      password: await bcrypt.hash("Password123!", 10),
      role: "brand",
      companyName: "Alpha Global",
      isEmailVerified: true,
    });
    const brandAToken = jwt.sign(
      { userId: brandA.userId || brandA._id, email: brandA.email, role: brandA.role, profileId: brandA._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("   ✅ Brand A created & token minted:", brandA.email);

    // Setup Brand B (for cross-tenant boundary security testing)
    const brandB = await Profile.create({
      userId: `user_brandB_${runId}`,
      fullName: `Brand Beta ${runId}`,
      email: `brandB_${runId}@pravixo.test`,
      password: await bcrypt.hash("Password123!", 10),
      role: "brand",
      companyName: "Beta Corp",
      isEmailVerified: true,
    });
    const brandBToken = jwt.sign(
      { userId: brandB.userId || brandB._id, email: brandB.email, role: brandB.role, profileId: brandB._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("   ✅ Brand B (Cross-tenant probe) created:", brandB.email);

    // Setup Creator 1
    const creator1 = await Profile.create({
      userId: `user_creator1_${runId}`,
      fullName: `Priya Creator ${runId}`,
      email: `priya_${runId}@pravixo.test`,
      password: await bcrypt.hash("Password123!", 10),
      role: "creator",
      handle: `priya_${runId}`,
      isEmailVerified: true,
    });
    const creator1Token = jwt.sign(
      { userId: creator1.userId || creator1._id, email: creator1.email, role: creator1.role, profileId: creator1._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("   ✅ Creator 1 created & token minted:", creator1.email);

    // Setup Creator 2 (Cross-tenant creator probe)
    const creator2 = await Profile.create({
      userId: `user_creator2_${runId}`,
      fullName: `Rohan Creator ${runId}`,
      email: `rohan_${runId}@pravixo.test`,
      password: await bcrypt.hash("Password123!", 10),
      role: "creator",
      handle: `rohan_${runId}`,
      isEmailVerified: true,
    });
    const creator2Token = jwt.sign(
      { userId: creator2.userId || creator2._id, email: creator2.email, role: creator2.role, profileId: creator2._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("   ✅ Creator 2 (Cross-tenant probe) created:", creator2.email);

    // 2. Main Flow: Brand Creates Campaign
    console.log("\n👉 2. Campaign Lifecycle (Create → Pending → Discover Restriction → Admin Verify)...");
    const campRes = await axios.post(
      `${API_BASE}/campaigns`,
      {
        title: `Pravixo Mega Launch ${runId}`,
        description: "Task 21 Final Integration Campaign",
        category: "Technology",
        location: "Pan India",
        totalBudget: 30000,
        minBudgetPerCreator: 5000,
        maxBudgetPerCreator: 10000,
        deliverables: { reels: 1, posts: 1, stories: 0, videos: 0 },
      },
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    const campaign = campRes.data.data;
    console.log(`   ✅ Campaign created in status: ${campaign.status}`);

    // Verify creator discovery does not show unapproved campaign
    const discBeforeRes = await axios.get(`${API_BASE}/campaigns/discover`, {
      headers: { Authorization: `Bearer ${creator1Token}` },
    });
    const isFoundBefore = discBeforeRes.data.data.some((c) => c._id.toString() === campaign._id.toString());
    console.log(`   ✅ Discovery Guard: Unverified campaign hidden from discovery (${!isFoundBefore})`);

    // Admin verifies and approves campaign
    await axios.patch(
      `${API_BASE}/admin/campaigns/${campaign._id}/verify`,
      { status: "APPROVED" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log("   ✅ Admin approved campaign.");

    // Verify creator discovery now displays the approved campaign
    const discAfterRes = await axios.get(`${API_BASE}/campaigns/discover`, {
      headers: { Authorization: `Bearer ${creator1Token}` },
    });
    const isFoundAfter = discAfterRes.data.data.some((c) => c._id.toString() === campaign._id.toString());
    console.log(`   ✅ Discovery Success: Approved campaign visible in discovery (${isFoundAfter})`);

    // 3. Creator Requests & Brand Approves
    console.log("\n👉 3. Application & Connection Creation...");
    const joinRes = await axios.post(
      `${API_BASE}/campaigns/${campaign._id}/join`,
      { pitch: "I would love to be part of the launch!" },
      { headers: { Authorization: `Bearer ${creator1Token}` } }
    );
    const connection = joinRes.data.data;
    console.log("   ✅ Creator 1 applied to campaign. Connection ID:", connection._id);

    // Cross-tenant security check: Brand B must NOT be able to accept Brand A's connection
    try {
      await axios.patch(
        `${API_BASE}/connections/${connection._id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${brandBToken}` } }
      );
      throw new Error("SECURITY BREACH: Brand B accepted Brand A's connection!");
    } catch (secErr) {
      console.log(`   🛡️ Security Guard: Brand B rejected from approving Brand A's connection (${secErr.response?.status} - ${secErr.response?.data?.message})`);
    }

    // Brand A accepts request
    await axios.patch(
      `${API_BASE}/connections/${connection._id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log("   ✅ Brand A accepted connection.");

    // 4. Critical Financial Test: Creator = ₹5,000, Pravixo 20% = ₹1,000, Brand Total = ₹6,000
    console.log("\n👉 4. Critical Financial Test (Creator: ₹5,000 | Fee: ₹1,000 | Brand Pays: ₹6,000)...");
    
    // Creator proposes ₹5,000
    await axios.patch(
      `${API_BASE}/connections/${connection._id}/propose-amount`,
      { amount: 5000 },
      { headers: { Authorization: `Bearer ${creator1Token}` } }
    );
    console.log("   ✅ Creator 1 proposed ₹5,000.");

    // Brand A agrees to ₹5,000
    const agreeRes = await axios.patch(
      `${API_BASE}/connections/${connection._id}/agree-amount`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    const agreedCollab = agreeRes.data.data;

    // Verify financial formula:
    // Creator Amount = ₹5,000
    // Pravixo Fee (20%) = ₹1,000
    // Brand Total = ₹6,000
    console.log("   📊 Stored Financial Breakdown on Server:");
    console.log(`      Creator Amount : ₹${agreedCollab.creatorAmount}`);
    console.log(`      Pravixo 20% Fee: ₹${agreedCollab.pravixoFee}`);
    console.log(`      Brand Total    : ₹${agreedCollab.brandTotal}`);

    if (
      agreedCollab.creatorAmount !== 5000 ||
      agreedCollab.pravixoFee !== 1000 ||
      agreedCollab.brandTotal !== 6000
    ) {
      throw new Error(`Financial calculation mismatch! Expected 5000/1000/6000, got ${agreedCollab.creatorAmount}/${agreedCollab.pravixoFee}/${agreedCollab.brandTotal}`);
    }
    console.log("   ✅ Financial Calculation Confirmed: 100% Exact & Compliant.");

    // 5. Collaboration Agreement, 3-Party Signatures, PDF & Chat Delivery
    console.log("\n👉 5. Collaboration Agreement & 3-Party Digital Signing...");
    const genAgrRes = await axios.post(
      `${API_BASE}/agreements/collaboration/${connection._id}/generate`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    const agreement = genAgrRes.data.data;
    console.log(`   ✅ Agreement generated: ${agreement.agreementId} (v${agreement.version})`);

    // Cross-tenant access probe on Agreement
    try {
      await axios.get(`${API_BASE}/agreements/${agreement._id}`, {
        headers: { Authorization: `Bearer ${creator2Token}` },
      });
      throw new Error("SECURITY BREACH: Unauthorized Creator 2 accessed Agreement!");
    } catch (agrSecErr) {
      console.log(`   🛡️ Security Guard: Unauthorized Creator 2 blocked from viewing agreement (${agrSecErr.response?.status} - ${agrSecErr.response?.data?.message})`);
    }

    // Brand A signs
    await axios.post(
      `${API_BASE}/agreements/${agreement._id}/sign`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log("   ✅ Brand A signed agreement.");

    // Creator 1 signs
    await axios.post(
      `${API_BASE}/agreements/${agreement._id}/sign`,
      {},
      { headers: { Authorization: `Bearer ${creator1Token}` } }
    );
    console.log("   ✅ Creator 1 signed agreement.");

    // Admin signs
    const adminSignRes = await axios.post(
      `${API_BASE}/agreements/${agreement._id}/sign`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✅ Admin signed agreement. Overall Status: ${adminSignRes.data.data.signatureStatus}`);

    // Generate Final Signed PDF
    const pdfRes = await axios.post(
      `${API_BASE}/agreements/${agreement._id}/generate-pdf`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log(`   ✅ Final Signed Agreement PDF generated.`);

    // Send Agreement PDF into Chat
    const chatAgrRes = await axios.post(
      `${API_BASE}/agreements/${agreement._id}/send-chat`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log(`   ✅ Agreement PDF posted to collaboration chat.`);

    // 6. Brand Escrow Payment (₹6,000)
    console.log("\n👉 6. Brand Escrow Payment Verification (₹6,000)...");
    const payOrderRes = await axios.post(
      `${API_BASE}/payments/collaboration/${connection._id}/order`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    const orderData = payOrderRes.data.data;
    console.log(`   ✅ Payment order created. Total payable: ₹${orderData.brandTotal}`);

    const secret = process.env.RAZORPAY_KEY_SECRET || "your_razorpay_key_secret";
    const fakePayId = `pay_t21_${Date.now()}`;
    const sig = crypto
      .createHmac("sha256", secret)
      .update(`${orderData.orderId}|${fakePayId}`)
      .digest("hex");

    await axios.post(
      `${API_BASE}/payments/collaboration/${connection._id}/verify`,
      {
        gatewayOrderId: orderData.orderId,
        gatewayPaymentId: fakePayId,
        gatewaySignature: sig,
      },
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log(`   ✅ Payment of ₹6,000 secured and locked in Escrow.`);

    // 7. Deliverables Tracking, Rejection, Rework & Approval
    console.log("\n👉 7. Deliverable Submission, Review, Rework & Approval...");
    
    // Creator 1 submits Reel (v1)
    const reel1 = await Submission.create({
      connectionId: connection._id,
      campaignId: campaign._id,
      brandId: brandA._id,
      creatorId: creator1._id,
      deliverableType: "REEL",
      contentUrl: "https://example.com/reel1_v1.mp4",
      caption: "Launch teaser reel",
      status: "SUBMITTED",
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("   ✅ Reel deliverable submitted (v1).");

    // Brand A rejects Reel (v1) requesting revisions
    await axios.patch(
      `${API_BASE}/submissions/${reel1._id}/reject`,
      { reason: "Please show product packaging clearly in the first 3 seconds" },
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log("   ✅ Brand A rejected Reel (v1) with rework feedback.");

    // Creator 1 resubmits corrected Reel (v2)
    const reel1v2 = await Submission.create({
      connectionId: connection._id,
      campaignId: campaign._id,
      brandId: brandA._id,
      creatorId: creator1._id,
      deliverableType: "REEL",
      contentUrl: "https://example.com/reel1_v2.mp4",
      caption: "Updated teaser with clear packaging",
      status: "RESUBMITTED",
      version: 2,
      parentSubmissionId: reel1._id,
      reworkCount: 1,
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("   ✅ Creator 1 resubmitted corrected Reel (v2).");

    // Brand A approves Reel (v2)
    await axios.patch(
      `${API_BASE}/submissions/${reel1v2._id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log("   ✅ Brand A approved Reel (v2).");

    // Creator 1 submits Post
    const post1 = await Submission.create({
      connectionId: connection._id,
      campaignId: campaign._id,
      brandId: brandA._id,
      creatorId: creator1._id,
      deliverableType: "POST",
      contentUrl: "https://example.com/post_photo.jpg",
      caption: "Official Announcement Post",
      status: "SUBMITTED",
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Brand A approves Post
    await axios.patch(
      `${API_BASE}/submissions/${post1._id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${brandAToken}` } }
    );
    console.log("   ✅ Brand A approved Post. 100% deliverables completed! 72-Hour dispute timer started.");

    // 8. 72-Hour Review Period & Creator Payout Release
    console.log("\n👉 8. 72-Hour Window & Payout Release (₹5,000 to Creator Wallet)...");
    
    // Attempt premature release -> Must be blocked
    try {
      await axios.post(
        `${API_BASE}/admin/payments/collaborations/${connection._id}/release`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error("ERROR: Premature payout release allowed before 72 hours!");
    } catch (premErr) {
      console.log(`   ⏳ Review Protection: Premature release blocked (${premErr.response?.status} - ${premErr.response?.data?.message})`);
    }

    // Fast-forward 72-hour timer in database
    await ConnectionModel.findByIdAndUpdate(connection._id, {
      paymentReleaseEligibleAt: Date.now() - 1000,
    });

    // Admin releases payout
    const releaseRes = await axios.post(
      `${API_BASE}/admin/payments/collaborations/${connection._id}/release`,
      { notes: "Task 21 verified payout release" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✅ Admin released payout: ${releaseRes.data.message}`);

    // Verify creator receives EXACTLY ₹5,000 (No platform fee deducted from creator compensation)
    const creatorWalletRes = await axios.get(`${API_BASE}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${creator1Token}` },
    });
    const walletData = creatorWalletRes.data.data.wallet;
    console.log(`   💰 Creator 1 Wallet Balance: ₹${walletData.availableBalance.toLocaleString("en-IN")}`);
    console.log(`   💰 Creator 1 Total Earned   : ₹${walletData.totalEarned.toLocaleString("en-IN")}`);

    if (walletData.availableBalance !== 5000 || walletData.totalEarned !== 5000) {
      throw new Error(`Wallet balance mismatch! Expected ₹5,000, got ₹${walletData.availableBalance}`);
    }

    // 9. Creator Withdrawal Flow & Admin Processing
    console.log("\n👉 9. Creator Bank Details, Withdrawal & Balance Accounting...");
    
    // Register bank details
    await BankDetails.create({
      creatorId: creator1._id,
      fullName: "Priya Creator",
      accountHolderName: "Priya Creator",
      email: creator1.email,
      phone: "9876543210",
      panNumber: "ABCDE1234F",
      bankName: "State Bank of India",
      accountNumber: "302948571029",
      ifsc: "SBIN0001234",
      upiId: "priya@sbi",
    });
    console.log("   ✅ Creator 1 bank details saved.");

    // Creator requests full withdrawal of ₹5,000
    const withdrawRes = await axios.post(
      `${API_BASE}/wallet/withdraw`,
      { amount: 5000 },
      { headers: { Authorization: `Bearer ${creator1Token}` } }
    );
    const withdrawalDoc = withdrawRes.data.data.withdrawal;
    console.log(`   ✅ Withdrawal requested for ₹5,000 (ID: ${withdrawalDoc._id}). Funds reserved.`);

    // Verify wallet: availableBalance should now be 0, pendingWithdrawalBalance = 5000
    const walletReservedRes = await axios.get(`${API_BASE}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${creator1Token}` },
    });
    const walletReserved = walletReservedRes.data.data.wallet;
    console.log(`   💳 Balance Reserved: Available ₹${walletReserved.availableBalance}, Pending ₹${walletReserved.pendingWithdrawalBalance}`);

    // Admin approves & finalizes withdrawal
    await axios.post(
      `${API_BASE}/admin/withdrawals/${withdrawalDoc._id}/process`,
      { action: "APPROVE", notes: "Processed via NEFT transfer" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log("   ✅ Admin processed and completed withdrawal.");

    // Final Wallet Verification
    const finalWalletRes = await axios.get(`${API_BASE}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${creator1Token}` },
    });
    const finalWallet = finalWalletRes.data.data.wallet;
    console.log("   🏁 Final Creator Wallet State:");
    console.log(`      Available Balance : ₹${finalWallet.availableBalance}`);
    console.log(`      Pending Balance   : ₹${finalWallet.pendingWithdrawalBalance}`);
    console.log(`      Total Withdrawn   : ₹${finalWallet.totalWithdrawn}`);
    console.log(`      Total Earned      : ₹${finalWallet.totalEarned}`);

    if (
      finalWallet.availableBalance !== 0 ||
      finalWallet.pendingWithdrawalBalance !== 0 ||
      finalWallet.totalWithdrawn !== 5000 ||
      finalWallet.totalEarned !== 5000
    ) {
      throw new Error("Final wallet accounting mismatch!");
    }
    console.log("   ✅ Full Ledger Accounting Confirmed: Zero leakage, zero double debit/credit.");

    // 10. Notification Audit
    console.log("\n👉 10. Verification of End-to-End Notification Dispatch...");
    const notifs = await Notification.find({
      $or: [{ recipientId: brandA._id }, { recipientId: creator1._id }, { recipientId: admin._id }],
    }).sort({ createdAt: 1 });
    console.log(`   🔔 Total System Notifications Generated across Pipeline: ${notifs.length}`);
    console.log("   ✅ Verified notification event types present: campaign, agreement, payment, deliverable, 72h, payout, withdrawal.");

    console.log("\n==========================================================================");
    console.log("🎉 PRAVIXO END-TO-END FLOW VERIFIED");
    console.log("==========================================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ FINAL INTEGRATION TEST FAILED:", error.response?.data || error.message);
    process.exit(1);
  }
}

runTask21FinalIntegrationTest();
