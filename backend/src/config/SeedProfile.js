import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// ⚠️ Agar tumhari Profile model file ka path/name different hai,
// sirf neeche wali line change karna.

import Profile from "../models/Profile.js";

const MONGODB_URI = process.env.MONGODB_URI;

// Same password for all DEMO profiles.
// Ye sirf demo profiles ke login ke liye hai.
const DEMO_PASSWORD = "Demo@12345";

const creatorData = [
  {
    userId: "demo_creator_aarav",
    fullName: "Aarav Sharma",
    email: "aarav.demo@pravixo.com",
    role: "creator",
    handle: "@aaravcreates",
    category: "Lifestyle",
    location: "Delhi, India",
    bio: "Lifestyle creator sharing fashion, travel, daily life and brand experiences.",
    startingPrice: 15000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Aarav",

    coverUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80",

    instagramHandle: "aaravcreates",
    instagramFollowers: 85000,

    facebookHandle: "aaravcreates",
    facebookFollowers: 12000,

    linkedinHandle: "aarav-sharma",
    linkedinFollowers: 5000,

    youtubeHandle: "aaravcreates",
    youtubeFollowers: 18000,

    quoraHandle: "Aarav-Sharma",
    quoraFollowers: 3000,

    twitterHandle: "aaravcreates",
    twitterFollowers: 2000,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 2450,
    clicks: 380,
    bookings: 24,
  },

  {
    userId: "demo_creator_riya",
    fullName: "Riya Kapoor",
    email: "riya.demo@pravixo.com",
    role: "creator",
    handle: "@riyakapoor",
    category: "Fashion",
    location: "Mumbai, India",
    bio: "Fashion and beauty creator focused on styling, beauty and lifestyle content.",
    startingPrice: 25000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Riya",

    coverUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80",

    instagramHandle: "riyakapoor",
    instagramFollowers: 180000,

    facebookHandle: "riyakapoor",
    facebookFollowers: 20000,

    linkedinHandle: "riya-kapoor",
    linkedinFollowers: 8000,

    youtubeHandle: "riyakapoor",
    youtubeFollowers: 30000,

    quoraHandle: "Riya-Kapoor",
    quoraFollowers: 4000,

    twitterHandle: "riyakapoor",
    twitterFollowers: 3000,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 4820,
    clicks: 720,
    bookings: 42,
  },

  {
    userId: "demo_creator_piyush",
    fullName: "Piyush Sharma",
    email: "piyush.demo@pravixo.com",
    role: "creator",
    handle: "@piyushcreates",
    category: "Fitness",
    location: "Delhi, India",
    bio: "Fitness and wellness creator creating workout, health and lifestyle content.",
    startingPrice: 12000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Piyush",

    coverUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",

    instagramHandle: "piyushcreates",
    instagramFollowers: 92000,

    facebookHandle: "piyushcreates",
    facebookFollowers: 9000,

    linkedinHandle: "piyush-sharma",
    linkedinFollowers: 3500,

    youtubeHandle: "piyushcreates",
    youtubeFollowers: 22000,

    quoraHandle: "Piyush-Sharma",
    quoraFollowers: 1200,

    twitterHandle: "piyushcreates",
    twitterFollowers: 1800,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 3200,
    clicks: 510,
    bookings: 18,
  },

  {
    userId: "demo_creator_shweta",
    fullName: "Shweta Yadav",
    email: "shweta.demo@pravixo.com",
    role: "creator",
    handle: "@shwetayadav",
    category: "Beauty",
    location: "Jaipur, India",
    bio: "Beauty creator sharing makeup tutorials, skincare routines and lifestyle content.",
    startingPrice: 18000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Shweta",

    coverUrl:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",

    instagramHandle: "shwetayadav",
    instagramFollowers: 145000,

    facebookHandle: "shwetayadav",
    facebookFollowers: 15000,

    linkedinHandle: "shweta-yadav",
    linkedinFollowers: 4200,

    youtubeHandle: "shwetayadav",
    youtubeFollowers: 28000,

    quoraHandle: "Shweta-Yadav",
    quoraFollowers: 1800,

    twitterHandle: "shwetayadav",
    twitterFollowers: 2100,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 6100,
    clicks: 890,
    bookings: 36,
  },

  {
    userId: "demo_creator_nandita",
    fullName: "Nandita Sharma",
    email: "nandita.demo@pravixo.com",
    role: "creator",
    handle: "@nanditasharma",
    category: "Travel",
    location: "Goa, India",
    bio: "Travel and lifestyle creator exploring destinations, hotels, food and experiences.",
    startingPrice: 22000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Nandita",

    coverUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80",

    instagramHandle: "nanditasharma",
    instagramFollowers: 210000,

    facebookHandle: "nanditasharma",
    facebookFollowers: 18000,

    linkedinHandle: "nandita-sharma",
    linkedinFollowers: 6000,

    youtubeHandle: "nanditasharma",
    youtubeFollowers: 42000,

    quoraHandle: "Nandita-Sharma",
    quoraFollowers: 2500,

    twitterHandle: "nanditasharma",
    twitterFollowers: 3200,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 7300,
    clicks: 1100,
    bookings: 48,
  },

  {
    userId: "demo_creator_kashish",
    fullName: "Kashish Saxena",
    email: "kashish.creator@pravixo.com",
    role: "creator",
    handle: "@kashishcreates",
    category: "Fashion",
    location: "Delhi, India",
    bio: "Fashion and lifestyle creator creating outfit ideas, reels, beauty and everyday lifestyle content.",
    startingPrice: 20000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Kashish",

    coverUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",

    instagramHandle: "kashishcreates",
    instagramFollowers: 125000,

    facebookHandle: "kashishcreates",
    facebookFollowers: 11000,

    linkedinHandle: "kashish-saxena",
    linkedinFollowers: 4500,

    youtubeHandle: "kashishcreates",
    youtubeFollowers: 26000,

    quoraHandle: "Kashish-Saxena",
    quoraFollowers: 1700,

    twitterHandle: "kashishcreates",
    twitterFollowers: 2200,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 5200,
    clicks: 760,
    bookings: 31,
  },

  {
    userId: "demo_creator_kanika",
    fullName: "Kanika Madan",
    email: "kanika.demo@pravixo.com",
    role: "creator",
    handle: "@kanikamadan",
    category: "Lifestyle",
    location: "Chandigarh, India",
    bio: "Lifestyle creator covering fashion, travel, home, wellness and everyday moments.",
    startingPrice: 16000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Kanika",

    coverUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",

    instagramHandle: "kanikamadan",
    instagramFollowers: 78000,

    facebookHandle: "kanikamadan",
    facebookFollowers: 8000,

    linkedinHandle: "kanika-madan",
    linkedinFollowers: 3000,

    youtubeHandle: "kanikamadan",
    youtubeFollowers: 15000,

    quoraHandle: "Kanika-Madan",
    quoraFollowers: 900,

    twitterHandle: "kanikamadan",
    twitterFollowers: 1300,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 2800,
    clicks: 410,
    bookings: 19,
  },

  {
    userId: "demo_creator_aarya",
    fullName: "Aarya Sharma",
    email: "aarya.demo@pravixo.com",
    role: "creator",
    handle: "@aaryasharma",
    category: "Entertainment",
    location: "Mumbai, India",
    bio: "Entertainment and lifestyle creator making engaging short-form videos and brand stories.",
    startingPrice: 30000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Aarya",

    coverUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80",

    instagramHandle: "aaryasharma",
    instagramFollowers: 320000,

    facebookHandle: "aaryasharma",
    facebookFollowers: 35000,

    linkedinHandle: "aarya-sharma",
    linkedinFollowers: 7000,

    youtubeHandle: "aaryasharma",
    youtubeFollowers: 65000,

    quoraHandle: "Aarya-Sharma",
    quoraFollowers: 3200,

    twitterHandle: "aaryasharma",
    twitterFollowers: 5400,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 9400,
    clicks: 1500,
    bookings: 67,
  },

  {
    userId: "demo_creator_rahul",
    fullName: "Rahul Verma",
    email: "rahul.demo@pravixo.com",
    role: "creator",
    handle: "@rahulverma",
    category: "Technology",
    location: "Bengaluru, India",
    bio: "Technology creator reviewing gadgets, apps, AI tools and useful digital products.",
    startingPrice: 28000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Rahul",

    coverUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",

    instagramHandle: "rahulverma",
    instagramFollowers: 165000,

    facebookHandle: "rahulverma",
    facebookFollowers: 14000,

    linkedinHandle: "rahul-verma",
    linkedinFollowers: 12000,

    youtubeHandle: "rahulverma",
    youtubeFollowers: 88000,

    quoraHandle: "Rahul-Verma",
    quoraFollowers: 6500,

    twitterHandle: "rahulverma",
    twitterFollowers: 7200,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 6800,
    clicks: 1020,
    bookings: 44,
  },

  {
    userId: "demo_creator_meera",
    fullName: "Meera Malhotra",
    email: "meera.demo@pravixo.com",
    role: "creator",
    handle: "@meeramalhotra",
    category: "Food & Dining",
    location: "Pune, India",
    bio: "Food and lifestyle creator discovering restaurants, recipes, cafes and food brands.",
    startingPrice: 14000,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Meera",

    coverUrl:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",

    instagramHandle: "meeramalhotra",
    instagramFollowers: 110000,

    facebookHandle: "meeramalhotra",
    facebookFollowers: 10000,

    linkedinHandle: "meera-malhotra",
    linkedinFollowers: 2800,

    youtubeHandle: "meeramalhotra",
    youtubeFollowers: 19000,

    quoraHandle: "Meera-Malhotra",
    quoraFollowers: 1100,

    twitterHandle: "meeramalhotra",
    twitterFollowers: 1600,

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 3900,
    clicks: 580,
    bookings: 27,
  },
];


// =====================================================
// 8 BRANDS
// =====================================================

const brandData = [
  {
    userId: "demo_brand_hawai",
    fullName: "Hawai Restaurant",
    email: "hawai.demo@pravixo.com",
    role: "brand",
    handle: "@hawai.restaurant",
    category: "Food & Dining",
    location: "Delhi NCR",

    bio: "Restaurant and food brand looking to collaborate with food, lifestyle and family creators.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Hawai",

    coverUrl:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&q=80",

    companySize: "50 - 200 employees",
    website: "https://www.hawai.restaurant",

    campaignsCount: 14,
    hiredCount: 52,

    prefNiches: "Food, Dining, Family Vlogs, Lifestyle",
    prefBudget: "₹10K - ₹40K per post",
    prefReach: "10K+ followers",
    prefRegions: "Delhi & NCR",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 3200,
    clicks: 460,
    bookings: 52,
  },

  {
    userId: "demo_brand_xpandia",
    fullName: "Xpandia",
    email: "xpandia.demo@pravixo.com",
    role: "brand",
    handle: "@xpandia",
    category: "Travel",
    location: "Mumbai, India",

    bio: "Travel and experiences brand partnering with creators to promote destinations and memorable experiences.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Xpandia",

    coverUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80",

    companySize: "11 - 50 employees",
    website: "https://example.com",

    campaignsCount: 22,
    hiredCount: 76,

    prefNiches: "Travel, Lifestyle, Hotels, Adventure",
    prefBudget: "₹20K - ₹80K per campaign",
    prefReach: "25K+ followers",
    prefRegions: "Pan India",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 5100,
    clicks: 720,
    bookings: 76,
  },

  {
    userId: "demo_brand_aman",
    fullName: "Aman",
    email: "aman.brand@pravixo.com",
    role: "brand",
    handle: "@amanbrand",
    category: "Lifestyle",
    location: "Delhi, India",

    bio: "Lifestyle brand working with creators to build authentic and engaging social campaigns.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Aman",

    coverUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",

    companySize: "11 - 50 employees",
    website: "https://example.com",

    campaignsCount: 18,
    hiredCount: 45,

    prefNiches: "Lifestyle, Fashion, Reels, Content",
    prefBudget: "₹15K - ₹60K per campaign",
    prefReach: "20K+ followers",
    prefRegions: "India",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 2700,
    clicks: 390,
    bookings: 45,
  },

  {
    userId: "demo_brand_hawahawai",
    fullName: "Hawa Hawai",
    email: "hawahawai.demo@pravixo.com",
    role: "brand",
    handle: "@hawahawai",
    category: "Food & Dining",
    location: "Mumbai, India",

    bio: "Popular food and dining brand looking for creators for restaurant visits, reviews and social campaigns.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=HawaHawai",

    coverUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",

    companySize: "50 - 200 employees",
    website: "https://example.com",

    campaignsCount: 31,
    hiredCount: 98,

    prefNiches: "Food, Restaurants, Lifestyle, Family",
    prefBudget: "₹10K - ₹50K per campaign",
    prefReach: "10K+ followers",
    prefRegions: "Mumbai, Delhi, Bengaluru",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 6200,
    clicks: 840,
    bookings: 98,
  },

  {
    userId: "demo_brand_nakshaa",
    fullName: "Nakshaa",
    email: "nakshaa.demo@pravixo.com",
    role: "brand",
    handle: "@nakshaa",
    category: "Fashion",
    location: "Delhi, India",

    bio: "Fashion brand creating contemporary collections and collaborating with fashion and lifestyle creators.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Nakshaa",

    coverUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",

    companySize: "11 - 50 employees",
    website: "https://example.com",

    campaignsCount: 25,
    hiredCount: 84,

    prefNiches: "Fashion, Beauty, Lifestyle, Styling",
    prefBudget: "₹20K - ₹1L per campaign",
    prefReach: "25K+ followers",
    prefRegions: "Pan India",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 5800,
    clicks: 910,
    bookings: 84,
  },

  {
    userId: "demo_brand_kashish",
    fullName: "Kashish Fashion",
    email: "kashish.brand@pravixo.com",
    role: "brand",
    handle: "@kashishfashion",
    category: "Fashion",
    location: "Jaipur, India",

    bio: "Fashion and apparel brand looking for creators for styling videos, reels and product campaigns.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=KashishFashion",

    coverUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",

    companySize: "11 - 50 employees",
    website: "https://example.com",

    campaignsCount: 16,
    hiredCount: 61,

    prefNiches: "Fashion, Clothing, Styling, Lifestyle",
    prefBudget: "₹15K - ₹70K per campaign",
    prefReach: "15K+ followers",
    prefRegions: "India",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 3400,
    clicks: 520,
    bookings: 61,
  },

  {
    userId: "demo_brand_nike",
    fullName: "Nike India",
    email: "nike.demo@pravixo.com",
    role: "brand",
    handle: "@nikeindia",
    category: "Sports",
    location: "Mumbai, India",

    bio: "Sports and lifestyle brand connecting with athletes, fitness creators and sports communities.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=NikeIndia",

    coverUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",

    companySize: "500+ employees",
    website: "https://www.nike.com/in/",

    campaignsCount: 42,
    hiredCount: 180,

    prefNiches: "Sports, Fitness, Fashion, Lifestyle",
    prefBudget: "₹50K - ₹5L per campaign",
    prefReach: "100K+ followers",
    prefRegions: "Pan India",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 12500,
    clicks: 2200,
    bookings: 180,
  },

  {
    userId: "demo_brand_zomato",
    fullName: "Zomato",
    email: "zomato.demo@pravixo.com",
    role: "brand",
    handle: "@zomato",
    category: "Food & Dining",
    location: "Delhi, India",

    bio: "Food discovery and delivery platform collaborating with food, lifestyle and city creators.",

    startingPrice: 0,

    avatarUrl:
      "https://ui-avatars.com/api/?background=random&name=Zomato",

    coverUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80",

    companySize: "500+ employees",
    website: "https://www.zomato.com/",

    campaignsCount: 55,
    hiredCount: 240,

    prefNiches: "Food, Restaurants, Lifestyle, City Guides",
    prefBudget: "₹30K - ₹2L per campaign",
    prefReach: "50K+ followers",
    prefRegions: "Pan India",

    verificationStatus: "verified",
    isSuspended: false,

    profileViews: 15800,
    clicks: 3100,
    bookings: 240,
  },
];


// =====================================================
// SEED FUNCTION
// =====================================================

async function seedProfiles() {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Check your backend .env file."
      );
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB connected");

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const allProfiles = [...creatorData, ...brandData];

    console.log(
      `\nSeeding ${creatorData.length} creators + ${brandData.length} brands...`
    );

    for (const profile of allProfiles) {
      await Profile.findOneAndUpdate(
        {
          userId: profile.userId,
        },
        {
          ...profile,
          password: passwordHash,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(
        `✅ ${profile.role.toUpperCase()} → ${profile.fullName}`
      );
    }

    console.log("\n====================================");
    console.log("🎉 PROFILE SEED COMPLETED");
    console.log("====================================");
    console.log(`Creators: ${creatorData.length}`);
    console.log(`Brands:   ${brandData.length}`);
    console.log(`Total:    ${allProfiles.length}`);
    console.log("------------------------------------");
    console.log("Demo password:", DEMO_PASSWORD);
    console.log("====================================\n");

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ SEED ERROR:");
    console.error(error);

    try {
      await mongoose.disconnect();
    } catch (e) {}

    process.exit(1);
  }
}

seedProfiles();