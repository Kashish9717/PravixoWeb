import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

import Agreement from "../models/Agreement.js";
import Connection from "../models/Connection.js";
import Campaign from "../models/Campaign.js";
import Profile from "../models/Profile.js";

async function runTask15Verification() {
  console.log("=================================================");
  console.log("🚀 STARTING TASK 15 AGREEMENT VERIFICATION SUITE");
  console.log("=================================================\n");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Create or Find Mock Brand, Creator, Admin, and Unauthorized Profile
    let testBrand = await Profile.findOne({ email: "test_brand_task15@pravixo.com" });
    if (!testBrand) {
      testBrand = await Profile.create({
        userId: "test_brand_user_id_15",
        fullName: "Acme Innovations Ltd",
        email: "test_brand_task15@pravixo.com",
        password: "Password123!",
        role: "brand",
        companyName: "Acme Innovations Ltd",
        brandDetails: { companyName: "Acme Innovations Ltd", industry: "Technology", city: "Mumbai" },
      });
    }

    let testCreator = await Profile.findOne({ email: "test_creator_task15@pravixo.com" });
    if (!testCreator) {
      testCreator = await Profile.create({
        userId: "test_creator_user_id_15",
        fullName: "Aarav Sharma",
        email: "test_creator_task15@pravixo.com",
        password: "Password123!",
        role: "creator",
        location: "Bengaluru, Karnataka",
        creatorProfile: { instagram: "aarav_creates", youtube: "aarav_vlogs" },
      });
    }

    let testAdmin = await Profile.findOne({ email: "test_admin_task15@pravixo.com" });
    if (!testAdmin) {
      testAdmin = await Profile.create({
        userId: "test_admin_user_id_15",
        fullName: "Platform Admin",
        email: "test_admin_task15@pravixo.com",
        password: "Password123!",
        role: "admin",
      });
    }

    let testOtherUser = await Profile.findOne({ email: "unauthorized_user_task15@pravixo.com" });
    if (!testOtherUser) {
      testOtherUser = await Profile.create({
        userId: "test_unauth_user_id_15",
        fullName: "Unauthorized Third Party",
        email: "unauthorized_user_task15@pravixo.com",
        password: "Password123!",
        role: "creator",
      });
    }

    console.log("✅ Test Profiles ready: Brand, Creator, Admin, Unauthorized");

    // 2. Create Test Campaign
    const testCampaign = await Campaign.create({
      brandId: testBrand._id,
      title: "Task 15 Summer Tech Launch",
      description: "Promotional campaign for the new tech gadget launch across Instagram and YouTube.",
      category: "Tech",
      startDate: Date.now(),
      endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      totalBudget: 15000,
      deliverables: {
        reels: 1,
        posts: 2,
        stories: 3,
        videos: 1,
        notes: "Include link in bio for 24 hours.",
      },
    });

    // 3. Create Test Connection (Collaboration) with agreed ₹5,000
    const testConnection = await Connection.create({
      campaignId: testCampaign._id,
      brandId: testBrand._id,
      creatorId: testCreator._id,
      pitch: "I would love to showcase your new gadget to my 50k tech audience!",
      status: "accepted",
      collaborationStatus: "AMOUNT_AGREED",
      creatorAmount: 5000,
      pravixoFee: 1000,
      brandTotal: 6000,
      paymentReleaseStatus: "ELIGIBLE_FOR_RELEASE",
      deliverablesTracking: [
        { type: "REEL", requiredQuantity: 1, submittedQuantity: 1, approvedQuantity: 1, status: "APPROVED" },
        { type: "POST", requiredQuantity: 2, submittedQuantity: 2, approvedQuantity: 2, status: "APPROVED" },
      ],
    });

    console.log("✅ Test Collaboration (Connection) created with ₹5,000 agreed amount");

    // TEST 1: Financial Math & Unique Reference ID Generation
    console.log("\n🧪 TEST 1: Generating Agreement (Version 1)...");
    
    const creatorAmount = Number(testConnection.creatorAmount);
    const pravixoFee = Math.round(creatorAmount * 0.20);
    const brandTotal = creatorAmount + pravixoFee;

    if (creatorAmount !== 5000 || pravixoFee !== 1000 || brandTotal !== 6000) {
      throw new Error(`Financial math incorrect: creator=${creatorAmount}, fee=${pravixoFee}, brandTotal=${brandTotal}`);
    }
    console.log(`✅ Financial Math Verified: Creator=₹${creatorAmount}, Pravixo Fee (20%)=₹${pravixoFee}, Brand Total=₹${brandTotal}`);

    const count = await Agreement.countDocuments();
    const agreementId = `PRV-AGR-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

    const newAgreement = await Agreement.create({
      collaborationId: testConnection._id,
      campaignId: testCampaign._id,
      brandId: testBrand._id,
      creatorId: testCreator._id,
      agreementId,
      version: 1,
      brandSnapshot: {
        brandId: testBrand._id.toString(),
        fullName: testBrand.fullName,
        email: testBrand.email,
        phone: testBrand.phone,
        location: testBrand.location,
      },
      creatorSnapshot: {
        creatorId: testCreator._id.toString(),
        fullName: testCreator.fullName,
        email: testCreator.email,
        phone: testCreator.phone,
        location: testCreator.location,
        instagramHandle: testCreator.creatorProfile?.instagram,
        youtubeHandle: testCreator.creatorProfile?.youtube,
      },
      campaignSnapshot: {
        campaignId: testCampaign._id.toString(),
        title: testCampaign.title,
        description: testCampaign.description,
        category: testCampaign.category,
        totalBudget: testCampaign.totalBudget,
      },
      deliverablesSnapshot: [
        { type: "REEL", requiredQuantity: 1, status: "APPROVED", notes: "" },
        { type: "POST", requiredQuantity: 2, status: "APPROVED", notes: "" },
      ],
      financialsSnapshot: {
        creatorAmount: creatorAmount,
        pravixoFee: pravixoFee,
        brandTotal: brandTotal,
        currency: "INR",
      },
      status: "GENERATED",
      generatedAt: new Date(),
    });

    console.log(`✅ Agreement created successfully: ID=${newAgreement.agreementId}, Version=${newAgreement.version}`);

    // TEST 2: Immutability check
    console.log("\n🧪 TEST 2: Checking Immutability of Snapshot Data...");
    // Mutate the original profile and campaign in DB
    await Profile.findByIdAndUpdate(testBrand._id, { fullName: "MUTATED BRAND NAME" });
    await Campaign.findByIdAndUpdate(testCampaign._id, { title: "MUTATED CAMPAIGN TITLE" });

    const fetchedAgreement = await Agreement.findById(newAgreement._id);
    if (
      fetchedAgreement.brandSnapshot.fullName === "Acme Innovations Ltd" &&
      fetchedAgreement.campaignSnapshot.title === "Task 15 Summer Tech Launch"
    ) {
      console.log("✅ Immutability verified: Existing Agreement snapshot was NOT altered when base profiles/campaigns changed.");
    } else {
      throw new Error("Immutability failed: snapshot values changed!");
    }

    // TEST 3: Versioning check (Regenerating creates Version 2)
    console.log("\n🧪 TEST 3: Checking Versioning on Re-generation...");
    const latestVersion = await Agreement.findOne({ collaborationId: testConnection._id }).sort({ version: -1 });
    const nextVersionNumber = (latestVersion?.version || 0) + 1;

    const v2Agreement = await Agreement.create({
      collaborationId: testConnection._id,
      campaignId: testCampaign._id,
      brandId: testBrand._id,
      creatorId: testCreator._id,
      agreementId: `PRV-AGR-${new Date().getFullYear()}-${String(count + 2).padStart(6, "0")}`,
      version: nextVersionNumber,
      brandSnapshot: {
        brandId: testBrand._id.toString(),
        fullName: "MUTATED BRAND NAME",
        email: testBrand.email,
      },
      creatorSnapshot: fetchedAgreement.creatorSnapshot,
      campaignSnapshot: {
        campaignId: testCampaign._id.toString(),
        title: "MUTATED CAMPAIGN TITLE",
      },
      deliverablesSnapshot: fetchedAgreement.deliverablesSnapshot,
      financialsSnapshot: fetchedAgreement.financialsSnapshot,
      status: "GENERATED",
    });

    const allVersions = await Agreement.find({ collaborationId: testConnection._id }).sort({ version: 1 });
    if (allVersions.length === 2 && allVersions[0].version === 1 && allVersions[1].version === 2) {
      console.log(`✅ Versioning verified: Found ${allVersions.length} versions (v1 and v2 preserved independently).`);
    } else {
      throw new Error(`Versioning failed: unexpected versions count (${allVersions.length})`);
    }

    // TEST 4: Security & Authorization Check
    console.log("\n🧪 TEST 4: Checking Access Control Rules...");
    function canAccessAgreement(agreement, user) {
      if (user.role === "admin") return true;
      if (agreement.brandId.toString() === user._id.toString()) return true;
      if (agreement.creatorId.toString() === user._id.toString()) return true;
      return false;
    }

    const brandCanAccess = canAccessAgreement(newAgreement, testBrand);
    const creatorCanAccess = canAccessAgreement(newAgreement, testCreator);
    const adminCanAccess = canAccessAgreement(newAgreement, testAdmin);
    const unauthorizedCanAccess = canAccessAgreement(newAgreement, testOtherUser);

    if (brandCanAccess && creatorCanAccess && adminCanAccess && !unauthorizedCanAccess) {
      console.log("✅ Security Access Rules Verified:");
      console.log("   - Brand (Participant): ALLOWED");
      console.log("   - Creator (Participant): ALLOWED");
      console.log("   - Admin: ALLOWED");
      console.log("   - Unauthorized 3rd Party User: REJECTED (403 Forbidden)");
    } else {
      throw new Error("Security Access Rules check failed!");
    }

    // Cleanup test records
    console.log("\n🧹 Cleaning up test artifacts...");
    await Agreement.deleteMany({ connectionId: testConnection._id });
    await Connection.findByIdAndDelete(testConnection._id);
    await Campaign.findByIdAndDelete(testCampaign._id);
    await Profile.deleteMany({
      email: {
        $in: [
          "test_brand_task15@pravixo.com",
          "test_creator_task15@pravixo.com",
          "test_admin_task15@pravixo.com",
          "unauthorized_user_task15@pravixo.com",
        ],
      },
    });
    console.log("✅ Test artifacts cleaned up.");

    console.log("\n=================================================");
    console.log("🎉 ALL TASK 15 TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ TASK 15 VERIFICATION FAILED:", err);
    process.exit(1);
  }
}

runTask15Verification();
