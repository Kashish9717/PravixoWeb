import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ProTip from "../models/ProTip.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

const mockProTips = [
  {
    title: "Always Use Trackable Links",
    content: "When providing links to creators for their bios or stories, always use UTM parameters or trackable short links. This ensures you can accurately measure the ROI of the campaign and attribute sales properly.",
    category: "brand",
    iconName: "Lightbulb",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Define Clear Content Rights",
    content: "Before the creator starts shooting, explicitly state where you intend to use the content (e.g., paid ads, website, organic social). Negotiating these rights upfront prevents expensive legal misunderstandings later.",
    category: "brand",
    iconName: "Compass",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Focus on Micro-Influencers for Niche Products",
    content: "If you sell a highly specific product (e.g., specialized climbing gear), don't waste budget on generic macro-influencers. A creator with 10k highly targeted followers will yield a better conversion rate.",
    category: "brand",
    iconName: "Award",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Send Mood Boards, Not Scripts",
    content: "Creators know their audience better than you do. Instead of giving them a rigid word-for-word script, provide a mood board and a list of key talking points. Let them adapt the message to their unique voice.",
    category: "brand",
    iconName: "Lightbulb",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Establish Long-Term Partnerships",
    content: "One-off posts rarely drive massive sales. If a creator performs well, lock them into a 3-6 month ambassadorship. The repeated exposure to their audience builds trust and significantly increases conversions.",
    category: "brand",
    iconName: "Award",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Under-Promise and Over-Deliver",
    content: "If a brand asks for one TikTok video, surprise them by also providing 3 high-quality raw photos they can use on their website. This unexpected value-add is the #1 way to get re-hired for future campaigns.",
    category: "creator",
    iconName: "Award",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Niche Down Your Portfolio",
    content: "Brands are looking for specialists, not generalists. If you want to work with skincare brands, make sure your portfolio highlights your skincare content, rather than burying it under unrelated lifestyle posts.",
    category: "creator",
    iconName: "Compass",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Master Your Lighting",
    content: "You don't need a $3,000 camera to create professional content. Always shoot facing a natural light source (like a window) or invest in a reliable softbox. Poor lighting can ruin an otherwise perfect product showcase.",
    category: "creator",
    iconName: "Lightbulb",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Always Ask for the Budget First",
    content: "When negotiating, try to get the brand to reveal their budget before you name your price. Ask: 'To ensure I can provide a package that aligns with your goals, do you have a specific budget allocated?'",
    category: "creator",
    iconName: "Compass",
    author: "System Admin",
    isPublished: true,
  },
  {
    title: "Provide Analytics Promptly",
    content: "Don't wait for the brand to chase you down for results. 48 hours after a post goes live, proactively email the brand with screenshots of the reach, impressions, and engagement metrics.",
    category: "creator",
    iconName: "Award",
    author: "System Admin",
    isPublished: true,
  }
];

const seedProTips = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Clearing existing pro tips...");
    await ProTip.deleteMany({});
    console.log("Existing pro tips cleared.");

    console.log("Inserting new mock pro tips...");
    await ProTip.insertMany(mockProTips);
    console.log(`Successfully inserted ${mockProTips.length} pro tips!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding pro tips:", error);
    process.exit(1);
  }
};

seedProTips();
