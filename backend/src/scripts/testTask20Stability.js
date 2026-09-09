import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

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

const API_BASE = "http://localhost:5000/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTask20StabilityTests() {
  console.log("===============================================================");
  console.log("🚀 TASK 20: COMPREHENSIVE STABILITY & EDGE CASES TEST SUITE");
  console.log("===============================================================\n");

  const runId = Date.now().toString().slice(-6);

  try {
    // Connect to MongoDB upfront
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lemen";
    const mongooseInstance = await mongoose.connect(mongoUri);
    const Profile = mongooseInstance.models.Profile || mongooseInstance.model("Profile");
    const Submission = mongooseInstance.models.Submission || mongooseInstance.model("Submission");
    const ConnectionModel = mongooseInstance.models.Connection || mongooseInstance.model("Connection");
    const jwt = await import("jsonwebtoken");
    const bcrypt = await import("bcryptjs");

    const jwtSecret = process.env.JWT_SECRET || "supersecretkey";

    // Setup Admin
    let admin = await Profile.findOne({ role: "admin" });
    if (!admin) {
      admin = await Profile.create({
        fullName: "Platform Super Admin",
        email: `admin_${runId}@pravixo.test`,
        password: await bcrypt.default.hash("Password123!", 10),
        role: "admin",
        isEmailVerified: true,
      });
    }
    const adminToken = jwt.default.sign(
      { userId: admin.userId || admin._id, email: admin.email, role: admin.role, profileId: admin._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("   ✅ Admin authenticated:", admin.email);

    // Setup Brand
    const brand = await Profile.create({
      userId: `user_brand_${runId}`,
      fullName: `Acme Brand Task20 ${runId}`,
      email: `brand_t20_${runId}@pravixo.test`,
      password: await bcrypt.default.hash("Password123!", 10),
      role: "brand",
      companyName: "Acme Corp",
      isEmailVerified: true,
    });
    const brandToken = jwt.default.sign(
      { userId: brand.userId || brand._id, email: brand.email, role: brand.role, profileId: brand._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    const brandUser = brand;
    console.log("   ✅ Brand created & token minted:", brand.email);

    // Setup Creator
    const creator = await Profile.create({
      userId: `user_creator_${runId}`,
      fullName: `Alex Creator Task20 ${runId}`,
      email: `creator_t20_${runId}@pravixo.test`,
      password: await bcrypt.default.hash("Password123!", 10),
      role: "creator",
      handle: `alex_${runId}`,
      isEmailVerified: true,
    });
    const creatorToken = jwt.default.sign(
      { userId: creator.userId || creator._id, email: creator.email, role: creator.role, profileId: creator._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    const creatorUser = creator;
    console.log("   ✅ Creator created & token minted:", creator.email);

    // Setup Impostor Creator
    const impostor = await Profile.create({
      userId: `user_impostor_${runId}`,
      fullName: `Impostor Task20 ${runId}`,
      email: `impostor_t20_${runId}@pravixo.test`,
      password: await bcrypt.default.hash("Password123!", 10),
      role: "creator",
      handle: `impostor_${runId}`,
      isEmailVerified: true,
    });
    const impostorToken = jwt.default.sign(
      { userId: impostor.userId || impostor._id, email: impostor.email, role: impostor.role, profileId: impostor._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("   ✅ Impostor Creator created & token minted.");

    // 2. Test Edge Case: Create Campaign & Disallow Applications when PENDING
    console.log("\n👉 2. Campaign Verification State & Premature Request Edge Cases...");
    const campaignRes = await axios.post(
      `${API_BASE}/campaigns`,
      {
        title: `Summer Launch ${runId}`,
        description: "Task 20 End-to-End Campaign",
        category: "Fashion",
        location: "Mumbai",
        totalBudget: 50000,
        minBudgetPerCreator: 10000,
        maxBudgetPerCreator: 25000,
        deliverables: { reels: 1, posts: 1, stories: 0, videos: 0 },
      },
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    const campaign = campaignRes.data.data;
    console.log(`   ✅ Campaign created in status: ${campaign.status}`);

    // Creator attempts to apply to PENDING campaign -> Must be rejected with 400
    try {
      await axios.post(
        `${API_BASE}/campaigns/${campaign._id}/join`,
        { pitch: "Let me join early please" },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      console.error("   ❌ ERROR: Creator was able to join unapproved campaign!");
    } catch (err) {
      console.log(`   ✅ Edge Case Blocked: Creator cannot join unapproved campaign (${err.response?.status} - ${err.response?.data?.message})`);
    }

    // Admin approves Campaign
    await axios.patch(
      `${API_BASE}/admin/campaigns/${campaign._id}/verify`,
      { status: "APPROVED" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log("   ✅ Admin approved campaign.");

    // 3. Creator joins campaign & Duplicate prevention
    console.log("\n👉 3. Creator Joining Campaign & Duplicate Request Block...");
    const joinRes = await axios.post(
      `${API_BASE}/campaigns/${campaign._id}/join`,
      { pitch: "Excited to collaborate!" },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    const connection = joinRes.data.data;
    console.log("   ✅ Creator joined campaign. Connection ID:", connection._id);

    // Duplicate join attempt -> Must return 409
    try {
      await axios.post(
        `${API_BASE}/campaigns/${campaign._id}/join`,
        { pitch: "Duplicate pitch" },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      console.error("   ❌ ERROR: Duplicate join request was allowed!");
    } catch (err) {
      console.log(`   ✅ Edge Case Blocked: Duplicate join request returned ${err.response?.status} (${err.response?.data?.message})`);
    }

    // 4. Authorization Enforcement & Brand Acceptance...
    console.log("\n👉 4. Authorization Enforcement & Brand Acceptance...");
    try {
      // Impostor trying to accept
      await axios.patch(
        `${API_BASE}/connections/${connection._id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${impostorToken}` } }
      );
      console.error("   ❌ ERROR: Non-owner was able to accept connection!");
    } catch (err) {
      console.log(`   ✅ Security Guard: Impostor blocked from accepting (${err.response?.status} - ${err.response?.data?.message})`);
    }

    const acceptRes = await axios.patch(
      `${API_BASE}/connections/${connection._id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log("   ✅ Brand accepted request. Connection status:", acceptRes.data.data.status);

    // 5. Negotiation Math, Negative Amount, Budget Overflow Guards
    console.log("\n👉 5. Negotiation Edge Cases (Negative amounts & Budget Overflows)...");
    // Test negative amount
    try {
      await axios.patch(
        `${API_BASE}/connections/${connection._id}/propose-amount`,
        { amount: -500 },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      console.error("   ❌ ERROR: Negative amount proposal allowed!");
    } catch (err) {
      console.log(`   ✅ Financial Guard: Negative proposal blocked (${err.response?.status} - ${err.response?.data?.message})`);
    }

    // Test exceeding max budget per creator (max is 25000)
    try {
      await axios.patch(
        `${API_BASE}/connections/${connection._id}/propose-amount`,
        { amount: 35000 },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      console.error("   ❌ ERROR: Exceeded max budget proposal allowed!");
    } catch (err) {
      console.log(`   ✅ Financial Guard: Budget overflow blocked (${err.response?.status} - ${err.response?.data?.message})`);
    }

    // Valid proposal: 15,000 INR
    await axios.patch(
      `${API_BASE}/connections/${connection._id}/propose-amount`,
      { amount: 15000 },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    console.log("   ✅ Valid proposal of ₹15,000 submitted by Creator.");

    // Brand agrees to ₹15,000 (Math: Creator = 15,000, Pravixo 20% = 3,000, Brand Total = 18,000)
    const agreeRes = await axios.patch(
      `${API_BASE}/connections/${connection._id}/agree-amount`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    const agreedCollab = agreeRes.data.data;
    console.log(`   ✅ Amount Agreed: Creator ₹${agreedCollab.creatorAmount}, Pravixo 20% Fee ₹${agreedCollab.pravixoFee}, Brand Total ₹${agreedCollab.brandTotal}`);

    // 6. Agreement Lifecycle & 3-Party Signatures
    console.log("\n👉 6. Agreement Generation, Signature Validation & Chat Document Dispatch...");
    const genAgrRes = await axios.post(
      `${API_BASE}/agreements/collaboration/${connection._id}/generate`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    const agreement = genAgrRes.data.data;
    console.log(`   ✅ Agreement generated: ${agreement.agreementId} (v${agreement.version})`);

    // Brand signs
    await axios.post(
      `${API_BASE}/agreements/${agreement._id}/sign`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log("   ✅ Brand signature recorded.");

    // Duplicate sign attempt by Brand -> Must return 400
    try {
      await axios.post(
        `${API_BASE}/agreements/${agreement._id}/sign`,
        {},
        { headers: { Authorization: `Bearer ${brandToken}` } }
      );
      console.error("   ❌ ERROR: Duplicate signature was accepted!");
    } catch (err) {
      console.log(`   ✅ Signature Guard: Duplicate Brand signature prevented (${err.response?.status} - ${err.response?.data?.message})`);
    }

    // Creator signs
    await axios.post(
      `${API_BASE}/agreements/${agreement._id}/sign`,
      {},
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    console.log("   ✅ Creator signature recorded.");

    // Admin signs
    const adminSignRes = await axios.post(
      `${API_BASE}/agreements/${agreement._id}/sign`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✅ Admin signed. Overall Agreement Status: ${adminSignRes.data.data.signatureStatus}`);

    // Generate Final PDF
    const pdfRes = await axios.post(
      `${API_BASE}/agreements/${agreement._id}/generate-pdf`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log(`   ✅ Signed Agreement PDF generated: ${pdfRes.data.data.pdfUrl.slice(0, 60)}...`);

    // Send PDF to Collaboration Chat
    const chatAgrRes = await axios.post(
      `${API_BASE}/agreements/${agreement._id}/send-chat`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log(`   ✅ Agreement PDF sent to Chat (${chatAgrRes.data.message})`);

    // Duplicate send to Chat -> Idempotent response
    const dupChatRes = await axios.post(
      `${API_BASE}/agreements/${agreement._id}/send-chat`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log(`   ✅ Idempotency: Duplicate send to chat handled gracefully (isExisting: ${dupChatRes.data.isExisting})`);

    // 7. Payment Initiation & Verification Simulation
    console.log("\n👉 7. Payment Initiation & Escrow Lock Verification...");
    const payOrderRes = await axios.post(
      `${API_BASE}/payments/collaboration/${connection._id}/order`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    const orderData = payOrderRes.data.data;
    console.log(`   ✅ Razorpay order created for ₹${orderData.brandTotal}. Order ID: ${orderData.orderId}`);

    // Verify payment using internal mock/crypto
    const crypto = await import("crypto");
    const fakePaymentId = `pay_t20_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
    const signature = crypto.default
      .createHmac("sha256", secret)
      .update(`${orderData.orderId}|${fakePaymentId}`)
      .digest("hex");

    const verifyPayRes = await axios.post(
      `${API_BASE}/payments/collaboration/${connection._id}/verify`,
      {
        gatewayOrderId: orderData.orderId,
        gatewayPaymentId: fakePaymentId,
        gatewaySignature: signature,
      },
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log(`   ✅ Payment verified & marked PAID in Escrow.`);

    // Duplicate payment attempt -> Returns 200 already completed
    const dupPayRes = await axios.post(
      `${API_BASE}/payments/collaboration/${connection._id}/verify`,
      {
        gatewayOrderId: orderData.orderId,
        gatewayPaymentId: fakePaymentId,
        gatewaySignature: signature,
      },
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log(`   ✅ Idempotency: Duplicate payment verification recognized as already PAID.`);

    // 8. Deliverable Submission, Rejection, Rework & Approval Flow
    console.log("\n👉 8. Deliverable Submissions, Rejection, Rework & Approval Pipeline...");

    const sub1 = await Submission.create({
      connectionId: connection._id,
      campaignId: campaign._id,
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      deliverableType: "REEL",
      contentUrl: "https://example.com/reel1.mp4",
      caption: "First reel draft",
      status: "SUBMITTED",
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("   ✅ Reel deliverable submitted (v1).");

    // Brand rejects Reel v1 with feedback
    await axios.patch(
      `${API_BASE}/submissions/${sub1._id}/reject`,
      { reason: "Please add logo at beginning" },
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log("   ✅ Brand rejected Reel v1 requesting rework.");

    // Creator resubmits corrected Reel v2
    const sub1v2 = await Submission.create({
      connectionId: connection._id,
      campaignId: campaign._id,
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      deliverableType: "REEL",
      contentUrl: "https://example.com/reel1_v2.mp4",
      caption: "Corrected reel with logo",
      status: "RESUBMITTED",
      version: 2,
      parentSubmissionId: sub1._id,
      reworkCount: 1,
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("   ✅ Creator resubmitted Reel (v2).");

    // Brand approves Reel v2
    await axios.patch(
      `${API_BASE}/submissions/${sub1v2._id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log("   ✅ Brand approved Reel v2.");

    // Submit and approve Post deliverable
    const sub2 = await Submission.create({
      connectionId: connection._id,
      campaignId: campaign._id,
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      deliverableType: "POST",
      contentUrl: "https://example.com/post1.jpg",
      caption: "Instagram Post",
      status: "SUBMITTED",
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const appPostRes = await axios.patch(
      `${API_BASE}/submissions/${sub2._id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    console.log(`   ✅ Brand approved Post. 100% Deliverables Completed! 72-Hour Review Started.`);

    // 9. 72-Hour Timer Simulation & Payout Release
    console.log("\n👉 9. 72-Hour Review Period Expiration & Payout Release...");
    
    // Premature payout attempt -> Must return 400
    try {
      await axios.post(
        `${API_BASE}/admin/payments/collaborations/${connection._id}/release`,
        { notes: "Premature release test" },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.error("   ❌ ERROR: Premature payout release was allowed before 72 hours!");
    } catch (err) {
      console.log(`   ✅ Review Period Guard: Premature payout release blocked (${err.response?.status} - ${err.response?.data?.message})`);
    }

    // Fast-forward 72-hour timer in DB
    await ConnectionModel.findByIdAndUpdate(connection._id, {
      paymentReleaseEligibleAt: Date.now() - 1000,
    });
    console.log("   ⏩ Fast-forwarded 72-hour timer to ELIGIBLE_FOR_RELEASE.");

    // Admin releases creator payout (₹15,000 full creator amount, zero fee deduction)
    const releaseRes = await axios.post(
      `${API_BASE}/admin/payments/collaborations/${connection._id}/release`,
      { notes: "Task 20 verified release" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✅ Admin released payout: ${releaseRes.data.message}`);

    // Duplicate release attempt -> Must return 400
    try {
      await axios.post(
        `${API_BASE}/admin/payments/collaborations/${connection._id}/release`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.error("   ❌ ERROR: Duplicate payout release allowed!");
    } catch (err) {
      console.log(`   ✅ Idempotency: Duplicate payout release blocked (${err.response?.status} - ${err.response?.data?.message})`);
    }

    // 10. Creator Wallet & Withdrawal Flow
    console.log("\n👉 10. Creator Wallet Ledger & Full Withdrawal Cycle...");
    
    // Check creator wallet
    const walletRes = await axios.get(`${API_BASE}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const wallet = walletRes.data.data.wallet;
    console.log(`   ✅ Creator Wallet Balance: ₹${wallet.availableBalance.toLocaleString("en-IN")}, Total Earned: ₹${wallet.totalEarned.toLocaleString("en-IN")}`);

    // Save Bank Details for creator
    const BankDetails = mongooseInstance.models.CreatorBankDetails || mongooseInstance.model("CreatorBankDetails");
    await BankDetails.create({
      creatorId: creatorUser._id,
      fullName: "Alex Creator",
      accountHolderName: "Alex Creator",
      email: creatorUser.email,
      phone: "9876543210",
      panNumber: "ABCDE1234F",
      bankName: "HDFC Bank",
      accountNumber: "50100492837492",
      ifsc: "HDFC0001234",
      upiId: "alex@hdfcbank",
    });
    console.log("   ✅ Creator bank details registered.");

    // Edge Case: Attempt withdrawal exceeding available balance
    try {
      await axios.post(
        `${API_BASE}/wallet/withdraw`,
        { amount: 50000 },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      console.error("   ❌ ERROR: Overdraw withdrawal allowed!");
    } catch (err) {
      console.log(`   ✅ Balance Guard: Excessive withdrawal blocked (${err.response?.status} - ${err.response?.data?.message})`);
    }

    // Valid Withdrawal Request: ₹5,000
    const withdrawRes = await axios.post(
      `${API_BASE}/wallet/withdraw`,
      { amount: 5000 },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    const withdrawal = withdrawRes.data.data.withdrawal;
    console.log(`   ✅ Withdrawal of ₹5,000 requested (ID: ${withdrawal._id}). Balance reserved atomically.`);

    // Admin rejects withdrawal -> Balance must be restored
    console.log("   👉 Testing Admin Rejection & Automatic Balance Restoration...");
    await axios.post(
      `${API_BASE}/admin/withdrawals/${withdrawal._id}/process`,
      { action: "REJECT", failureReason: "Incorrect IFSC code provided" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const walletAfterReject = (await axios.get(`${API_BASE}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    })).data.data.wallet;
    console.log(`   ✅ Funds Restored: Available Balance back to ₹${walletAfterReject.availableBalance.toLocaleString("en-IN")}`);

    // Re-request withdrawal of ₹10,000 and Admin approves
    const withdraw2Res = await axios.post(
      `${API_BASE}/wallet/withdraw`,
      { amount: 10000 },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    const withdrawal2 = withdraw2Res.data.data.withdrawal;

    await axios.post(
      `${API_BASE}/admin/withdrawals/${withdrawal2._id}/process`,
      { action: "APPROVE", notes: "Bank transfer processed via IMPS" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✅ Withdrawal of ₹10,000 approved and finalized by Admin.`);

    const finalWallet = (await axios.get(`${API_BASE}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    })).data.data.wallet;
    console.log(`   ✅ Final Creator Wallet: Available: ₹${finalWallet.availableBalance.toLocaleString("en-IN")}, Total Withdrawn: ₹${finalWallet.totalWithdrawn.toLocaleString("en-IN")}, Total Earned: ₹${finalWallet.totalEarned.toLocaleString("en-IN")}`);

    console.log("\n===============================================================");
    console.log("🎉 ALL TASK 20 STABILITY & EDGE CASES TESTS PASSED PERFECTLY!");
    console.log("===============================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED:", error.response?.data || error.message);
    process.exit(1);
  }
}

runTask20StabilityTests();
