import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import AddonService from "../models/AddonService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

const mockServices = [
  {
    name: "Professional Videography Team",
    description: "Hire a 2-person professional videography team for a full day shoot (8 hours). Includes all necessary 4K cameras, professional lighting, and raw footage delivery within 24 hours.",
    price: 15000,
    imageUrl: "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    name: "Podcast Recording Studio",
    description: "Rent our state-of-the-art podcast studio for 4 hours. Includes 4 Shure SM7B microphones, soundproofing, live mixing board, and an on-site audio engineer to ensure perfect recording quality.",
    price: 8000,
    imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    name: "Premium Video Editing (Reels/TikTok)",
    description: "Send us your raw footage and our expert editors will create 5 highly engaging short-form videos (Reels/TikTok/Shorts) with trending audio, professional color grading, and dynamic captions.",
    price: 5000,
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    name: "Verified Profile Badge",
    description: "Fast-track your profile verification. Our team will manually review your portfolio, social links, and identity documents within 24 hours to award you the 'Verified Creator' badge, boosting your visibility to brands.",
    price: 2500,
    imageUrl: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    name: "Dedicated Campaign Manager",
    description: "Running a large campaign? Hire a dedicated campaign manager for 1 month. They will handle all creator outreach, contract negotiations, product shipping logistics, and final content approvals on your behalf.",
    price: 25000,
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    name: "Product Photography Shoot",
    description: "Ship your product to our in-house studio. We will provide 15 ultra-high-resolution, professionally lit, lifestyle and white-background images perfectly formatted for your e-commerce store and social media.",
    price: 12000,
    imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  }
];

const seedAddons = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Clearing existing addon services...");
    await AddonService.deleteMany({});
    console.log("Existing addon services cleared.");

    console.log("Inserting new mock addon services...");
    await AddonService.insertMany(mockServices);
    console.log(`Successfully inserted ${mockServices.length} addon services!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding addon services:", error);
    process.exit(1);
  }
};

seedAddons();
