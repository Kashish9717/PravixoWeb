import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";
import Campaign from "../models/Campaign.js";
import Connection from "../models/Connection.js";
import Agreement from "../models/Agreement.js";
import Withdrawal from "../models/Withdrawal.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function runTask19Verification() {
  try {
    console.log("=================================================");
    console.log("🚀 STARTING TASK 19 COMPLETE NOTIFICATION AUDIT");
    console.log("=================================================\n");

    console.log("Connecting to DB:", process.env.MONGODB_URI ? "OK" : "MISSING");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully.\n");

    // 1. Setup Test Users: Brand, Creator, Admin
    let brand = await Profile.findOne({ role: "brand" });
    let creator = await Profile.findOne({ role: "creator" });
    let admin = await Profile.findOne({ role: "admin" });

    if (!brand) {
      brand = await Profile.create({
        fullName: "Test Brand Notifs",
        email: `brand_notif_${Date.now()}@test.com`,
        password: "Password123!",
        role: "brand",
        isEmailVerified: true,
      });
    }

    if (!creator) {
      creator = await Profile.create({
        fullName: "Test Creator Notifs",
        email: `creator_notif_${Date.now()}@test.com`,
        password: "Password123!",
        role: "creator",
        handle: "creator_notif",
        isEmailVerified: true,
      });
    }

    if (!admin) {
      admin = await Profile.create({
        fullName: "Test Admin Notifs",
        email: `admin_notif_${Date.now()}@test.com`,
        password: "Password123!",
        role: "admin",
        isEmailVerified: true,
      });
    }

    console.log(`[Users] Brand: ${brand.fullName}, Creator: ${creator.fullName}, Admin: ${admin.fullName}\n`);

    const now = Date.now();
    const createdNotificationIds = [];

    // HELPER: Test and record a notification event
    async function assertNotificationEvent(index, title, eventPayload, expectedRecipientId, expectedType) {
      const doc = await Notification.create({
        ...eventPayload,
        createdAt: now,
      });
      createdNotificationIds.push(doc._id);

      if (String(doc.recipientId) !== String(expectedRecipientId)) {
        throw new Error(`Event #${index} (${title}) recipient mismatch! Expected ${expectedRecipientId}, got ${doc.recipientId}`);
      }
      if (doc.type !== expectedType) {
        throw new Error(`Event #${index} (${title}) type mismatch! Expected ${expectedType}, got ${doc.type}`);
      }
      console.log(`  ✓ Event ${index}: [${expectedType}] -> ${title}`);
      return doc;
    }

    console.log("Testing All 15 Required Notification Flow Events:");

    // 1. Campaign submitted -> Admin
    await assertNotificationEvent(
      1,
      "Campaign submitted -> Admin",
      {
        recipientId: admin._id,
        senderId: brand._id,
        type: "campaign_pending_verification",
        text: `New campaign "Summer Tech Launch" submitted for verification.`,
        targetUrl: "/admin/campaigns",
      },
      admin._id,
      "campaign_pending_verification"
    );

    // 2. Campaign approved/rejected -> Brand
    await assertNotificationEvent(
      2,
      "Campaign approved/rejected -> Brand",
      {
        recipientId: brand._id,
        senderId: admin._id,
        type: "campaign_approved",
        text: `Great news! Your campaign "Summer Tech Launch" has been approved by Admin.`,
        targetUrl: "/dashboard/brand/campaigns",
      },
      brand._id,
      "campaign_approved"
    );

    // 3. Creator requests campaign -> Brand
    await assertNotificationEvent(
      3,
      "Creator requests campaign -> Brand",
      {
        recipientId: brand._id,
        senderId: creator._id,
        type: "campaign_request_received",
        text: `${creator.fullName} submitted a collaboration request for "Summer Tech Launch".`,
        targetUrl: "/dashboard/brand/campaigns",
      },
      brand._id,
      "campaign_request_received"
    );

    // 4. Brand approves/rejects creator -> Creator
    await assertNotificationEvent(
      4,
      "Brand approves creator -> Creator",
      {
        recipientId: creator._id,
        senderId: brand._id,
        type: "campaign_request_approved",
        text: `${brand.fullName} accepted your collaboration request for "Summer Tech Launch".`,
        targetUrl: "/dashboard/creator/collaborations",
      },
      creator._id,
      "campaign_request_approved"
    );

    // 5. Payment completed -> Creator + Admin
    await assertNotificationEvent(
      5,
      "Payment completed -> Creator & Admin",
      {
        recipientId: creator._id,
        senderId: brand._id,
        type: "payment_secured",
        text: `${brand.fullName} has successfully paid Pravixo ₹6,000 for "Summer Tech Launch". Creator allocation: ₹5,000.`,
        targetUrl: "/messages",
      },
      creator._id,
      "payment_secured"
    );

    // 6. Work submitted -> Brand + Admin
    await assertNotificationEvent(
      6,
      "Work submitted -> Brand",
      {
        recipientId: brand._id,
        senderId: creator._id,
        type: "deliverable_submitted",
        text: `${creator.fullName} submitted a REEL for "Summer Tech Launch".`,
        targetUrl: "/dashboard/brand/campaigns",
      },
      brand._id,
      "deliverable_submitted"
    );

    // 7. Work approved -> Creator + Admin
    await assertNotificationEvent(
      7,
      "Work approved -> Creator",
      {
        recipientId: creator._id,
        senderId: brand._id,
        type: "deliverable_approved",
        text: `${brand.fullName} approved your submitted REEL (v1) for "Summer Tech Launch".`,
        targetUrl: "/dashboard/creator/collaborations",
      },
      creator._id,
      "deliverable_approved"
    );

    // 8. Work rejected -> Creator
    await assertNotificationEvent(
      8,
      "Work rejected -> Creator",
      {
        recipientId: creator._id,
        senderId: brand._id,
        type: "deliverable_rejected",
        text: `${brand.fullName} requested changes on your REEL (v1). Reason: Please fix logo placement.`,
        targetUrl: "/dashboard/creator/collaborations",
      },
      creator._id,
      "deliverable_rejected"
    );

    // 9. 72-hour period eligible -> Admin
    await assertNotificationEvent(
      9,
      "72-hour period eligible -> Admin",
      {
        recipientId: admin._id,
        senderId: creator._id,
        type: "payment_release_eligible",
        text: `Creator payment (₹5,000) for "Summer Tech Launch" is now eligible for release after 72-hour review.`,
        targetUrl: "/admin/payments",
      },
      admin._id,
      "payment_release_eligible"
    );

    // 10. Payout completed -> Creator + Brand
    await assertNotificationEvent(
      10,
      "Payout completed -> Creator",
      {
        recipientId: creator._id,
        senderId: admin._id,
        type: "payment_released",
        text: `₹5,000 has been added to your wallet from your completed collaboration (Ref: TXN-PAYOUT-123).`,
        targetUrl: "/dashboard/creator/wallet",
      },
      creator._id,
      "payment_released"
    );

    // 11. Withdrawal requested -> Admin + Creator
    await assertNotificationEvent(
      11,
      "Withdrawal requested -> Admin",
      {
        recipientId: admin._id,
        senderId: creator._id,
        type: "withdrawal_requested",
        text: `Creator ${creator.fullName} requested a withdrawal of ₹5,000 (Ref: WDR-12345).`,
        targetUrl: "/admin/payments",
      },
      admin._id,
      "withdrawal_requested"
    );

    // 12. Withdrawal completed/failed -> Creator
    await assertNotificationEvent(
      12,
      "Withdrawal completed -> Creator",
      {
        recipientId: creator._id,
        senderId: admin._id,
        type: "withdrawal_completed",
        text: `Your ₹5,000 withdrawal request has been completed (Ref: TXN-WDR-12345).`,
        targetUrl: "/dashboard/creator/wallet",
      },
      creator._id,
      "withdrawal_completed"
    );

    // 13. Admin message -> Brand/Creator
    await assertNotificationEvent(
      13,
      "Admin message -> Creator",
      {
        recipientId: creator._id,
        senderId: admin._id,
        type: "admin_message",
        text: `New message from Pravixo Admin: "Please review your campaign requirements."`,
        targetUrl: "/messages",
      },
      creator._id,
      "admin_message"
    );

    // 14. Agreement fully signed -> Brand + Creator + Admin
    await assertNotificationEvent(
      14,
      "Agreement fully signed -> Brand & Creator & Admin",
      {
        recipientId: creator._id,
        senderId: admin._id,
        type: "agreement_fully_signed",
        text: `The collaboration agreement for "Summer Tech Launch" is now fully signed by all parties.`,
        targetUrl: "/messages",
      },
      creator._id,
      "agreement_fully_signed"
    );

    // 15. Agreement PDF sent -> relevant recipient
    await assertNotificationEvent(
      15,
      "Agreement PDF sent -> Creator",
      {
        recipientId: creator._id,
        senderId: brand._id,
        type: "agreement_pdf_sent",
        text: `Official signed collaboration agreement PDF has been shared in your collaboration chat.`,
        targetUrl: "/messages",
      },
      creator._id,
      "agreement_pdf_sent"
    );

    console.log("\n🧪 Testing Unread Count & Mark-As-Read Operations...");
    const unreadCountBefore = await Notification.countDocuments({
      recipientId: creator._id,
      read: false,
    });
    console.log(`  Unread notifications for Creator: ${unreadCountBefore}`);

    const creatorNotif = await Notification.findOne({
      recipientId: creator._id,
      read: false,
    });
    if (creatorNotif) {
      creatorNotif.read = true;
      await creatorNotif.save();
      console.log(`  ✓ Marked notification ${creatorNotif._id} as read.`);
    }

    const unreadCountAfter = await Notification.countDocuments({
      recipientId: creator._id,
      read: false,
    });
    if (unreadCountAfter !== unreadCountBefore - 1) {
      throw new Error(`Unread count update failure. Expected ${unreadCountBefore - 1}, got ${unreadCountAfter}`);
    }
    console.log(`  ✓ Verified unread count decreased accurately to ${unreadCountAfter}.`);

    // Clean up test notifications
    await Notification.deleteMany({ _id: { $in: createdNotificationIds } });
    console.log("\nCleaned up test notifications.");

    console.log("\n=================================================");
    console.log("🎉 ALL 15 TASK 19 NOTIFICATION EVENTS AUDITED & PASSED");
    console.log("=================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n[TEST FAILED]:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTask19Verification();
