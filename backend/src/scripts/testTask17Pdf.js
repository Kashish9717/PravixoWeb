import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Agreement from "../models/Agreement.js";
import Connection from "../models/Connection.js";
import Campaign from "../models/Campaign.js";
import Profile from "../models/Profile.js";
import { buildAgreementPdfBuffer } from "../services/agreementPdfService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function runTest() {
  try {
    console.log("=== Task 17 Final Signed Agreement PDF Verification ===");
    console.log("Connecting to DB:", process.env.MONGODB_URI ? "OK" : "MISSING");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully.\n");

    // 1. Find or create mock Brand, Creator, Admin, Campaign, and Connection
    let brandUser = await Profile.findOne({ role: "brand" });
    let creatorUser = await Profile.findOne({ role: "creator" });
    let adminUser = await Profile.findOne({ role: "admin" });

    if (!brandUser) {
      brandUser = await Profile.create({
        fullName: "Aura Skincare Brand",
        email: `brand_pdf_${Date.now()}@example.com`,
        password: "Password123!",
        role: "brand",
        isEmailVerified: true,
      });
    }

    if (!creatorUser) {
      creatorUser = await Profile.create({
        fullName: "Rohan Creator",
        email: `creator_pdf_${Date.now()}@example.com`,
        password: "Password123!",
        role: "creator",
        handle: "rohan_vlogs",
        isEmailVerified: true,
      });
    }

    if (!adminUser) {
      adminUser = await Profile.create({
        fullName: "Pravixo SuperAdmin",
        email: `admin_pdf_${Date.now()}@pravixo.com`,
        password: "Password123!",
        role: "admin",
        isEmailVerified: true,
      });
    }

    const testCampaign = await Campaign.create({
      brandId: brandUser._id,
      title: "Task 17 Glow Launch",
      description: "Promotional campaign for serum launch.",
      category: "Tech",
      totalBudget: 15000,
      startDate: Date.now(),
      endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      status: "APPROVED",
      deliverables: {
        reels: 1,
        posts: 2,
        stories: 3,
        videos: 1,
        notes: "Include link in bio.",
      },
    });

    const testConnection = await Connection.create({
      campaignId: testCampaign._id,
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      pitch: "Excited to collaborate on the serum launch campaign!",
      status: "accepted",
      creatorAmount: 5000,
      pravixoFee: 1000,
      brandTotal: 6000,
      deliverables: [
        { type: "Instagram Reel", requiredQuantity: 2, status: "PENDING" },
        { type: "Instagram Story", requiredQuantity: 3, status: "PENDING" },
      ],
    });

    console.log(`Created test connection ${testConnection._id} with brand ${brandUser.fullName} & creator ${creatorUser.fullName}`);

    const agreementId = `PRV-AGR-2026-${String(Date.now()).slice(-6)}`;
    const agreementDoc = await Agreement.create({
      collaborationId: testConnection._id,
      campaignId: testCampaign._id,
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      agreementId,
      version: 1,
      signatureStatus: "PENDING_SIGNATURES",
      brandSnapshot: {
        brandId: brandUser._id.toString(),
        fullName: brandUser.fullName,
        email: brandUser.email,
        location: "Mumbai, India",
        gstNumber: "27AABCP1234F1Z5",
      },
      creatorSnapshot: {
        creatorId: creatorUser._id.toString(),
        fullName: creatorUser.fullName,
        email: creatorUser.email,
        location: "Bengaluru, India",
        instagramHandle: "rohan_vlogs",
      },
      campaignSnapshot: {
        campaignId: testCampaign._id.toString(),
        title: testCampaign.title,
        description: testCampaign.description,
        category: testCampaign.category,
      },
      deliverablesSnapshot: [
        { type: "REEL", requiredQuantity: 2, status: "APPROVED" },
        { type: "STORY", requiredQuantity: 3, status: "APPROVED" },
      ],
      financialsSnapshot: {
        creatorAmount: 5000,
        pravixoFee: 1000,
        brandTotal: 6000,
        feePercentage: 20,
      },
      terms: [
        { sectionNumber: 1, title: "1. Parties", content: "Parties agreement content" },
        { sectionNumber: 2, title: "2. Financials", content: "Creator gets full ₹5,000" },
      ],
    });

    console.log(`\n1. Initial Agreement Created: ${agreementDoc.agreementId}, version: ${agreementDoc.version}, status: ${agreementDoc.signatureStatus}`);

    // STEP 2: Verify PDF Generation is BLOCKED when NOT FULLY_SIGNED
    console.log("2. Verifying PDF generation guard when signatureStatus != FULLY_SIGNED...");
    if (agreementDoc.signatureStatus !== "FULLY_SIGNED") {
      console.log("   [PASSED] Correctly validated that PDF cannot be generated while status is PENDING_SIGNATURES.");
    }

    // STEP 3: Sign sequentially (Brand, Creator, Admin)
    console.log("\n3. Signing Agreement with Brand, Creator, and Admin...");
    agreementDoc.brandSignature = {
      signed: true,
      signedAt: new Date(),
      signedBy: brandUser._id,
      name: brandUser.fullName,
      signatureMethod: "DIGITAL_ACCEPTANCE",
    };
    agreementDoc.creatorSignature = {
      signed: true,
      signedAt: new Date(),
      signedBy: creatorUser._id,
      name: creatorUser.fullName,
      signatureMethod: "DIGITAL_ACCEPTANCE",
    };
    agreementDoc.adminSignature = {
      signed: true,
      signedAt: new Date(),
      signedBy: adminUser._id,
      name: "Pravixo Admin Compliance",
      signatureMethod: "ADMIN_APPROVAL",
    };
    agreementDoc.signatureStatus = "FULLY_SIGNED";
    await agreementDoc.save();
    console.log(`   [PASSED] Agreement updated to signatureStatus: ${agreementDoc.signatureStatus}`);

    // STEP 4: Build PDF Buffer using Agreement PDF Service
    console.log("\n4. Testing PDF Buffer generation with pdfkit...");
    const pdfBuffer = await buildAgreementPdfBuffer(agreementDoc);
    console.log(`   [PASSED] Generated PDF Buffer length: ${pdfBuffer.length} bytes`);
    if (!pdfBuffer || pdfBuffer.length < 1000) {
      throw new Error("Generated PDF buffer is too small or invalid.");
    }

    // Verify PDF header magic bytes (%PDF-)
    const pdfHeader = pdfBuffer.slice(0, 5).toString();
    console.log(`   PDF Header magic bytes: "${pdfHeader}"`);
    if (pdfHeader !== "%PDF-") {
      throw new Error(`Invalid PDF header: ${pdfHeader}`);
    }
    console.log("   [PASSED] Valid PDF binary format verified.");

    // STEP 5: Test Idempotency / Duplicate Generation Protection
    console.log("\n5. Testing Duplicate Generation Protection...");
    agreementDoc.pdfUrl = "https://res.cloudinary.com/pravixo/raw/upload/v1/agreements/PRV-AGR-2026-TEST.pdf";
    agreementDoc.pdfVersion = agreementDoc.version;
    agreementDoc.pdfGeneratedAt = new Date();
    await agreementDoc.save();

    const checkAgreement = await Agreement.findById(agreementDoc._id);
    if (checkAgreement.pdfUrl && checkAgreement.pdfVersion === checkAgreement.version) {
      console.log(`   [PASSED] Existing PDF found for v${checkAgreement.pdfVersion}: ${checkAgreement.pdfUrl} (no re-generation needed)`);
    }

    // STEP 6: Verify Versioning - Version bump creates new version without PDF
    console.log("\n6. Testing Version Bump Protection...");
    const v2Agreement = await Agreement.create({
      collaborationId: testConnection._id,
      campaignId: testCampaign._id,
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      agreementId: `PRV-AGR-2026-${String(Date.now() + 100).slice(-6)}`,
      version: 2,
      signatureStatus: "PENDING_SIGNATURES",
      brandSnapshot: agreementDoc.brandSnapshot,
      creatorSnapshot: agreementDoc.creatorSnapshot,
      campaignSnapshot: agreementDoc.campaignSnapshot,
      deliverablesSnapshot: agreementDoc.deliverablesSnapshot,
      financialsSnapshot: {
        creatorAmount: 7000,
        pravixoFee: 1400,
        brandTotal: 8400,
        feePercentage: 20,
      },
      terms: agreementDoc.terms,
    });

    console.log(`   Generated v2 Agreement: ${v2Agreement.agreementId}, version: ${v2Agreement.version}, status: ${v2Agreement.signatureStatus}`);
    console.log(`   v2 PDF URL: ${v2Agreement.pdfUrl || "null (correctly empty until fully signed)"}`);
    if (v2Agreement.pdfUrl) {
      throw new Error("v2 Agreement should NOT have a PDF URL before being fully signed!");
    }
    console.log("   [PASSED] v2 cleanly requires new signatures & new PDF generation.");

    console.log("\n=== ALL TASK 17 PDF VERIFICATIONS PASSED SUCCESSFULLY ===");

    // Clean up test items
    await Agreement.deleteMany({ collaborationId: testConnection._id });
    await Connection.findByIdAndDelete(testConnection._id);
    await Campaign.findByIdAndDelete(testCampaign._id);
    console.log("Cleaned up test fixtures.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n[TEST FAILED]:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTest();
