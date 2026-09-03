import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Blog from "../models/Blog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

const mockBlogs = [
  {
    title: "10 Proven Marketing Strategies for Beauty Brands",
    content: "## The Power of Visuals\n\nBeauty is inherently visual. To create effective campaigns, brands must focus on high-quality visuals, authentic reviews, and before-after transformations. \n\n### Partnering with the Right Creators\nFind creators whose aesthetic aligns with yours. Instead of looking purely at follower counts, dive into their engagement rates. Micro-influencers often drive the highest ROI for niche beauty products.\n\n### Video Content is King\nShort-form videos (Reels, TikToks, Shorts) demonstrating product application are driving more sales than static posts. Encourage your creators to create authentic, 'get ready with me' (GRWM) style content.",
    coverImageUrl: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=1200&q=80",
    category: "Marketing Strategies",
    targetRole: "brand",
    published: true,
    featured: true,
  },
  {
    title: "How to Increase Gig Performance and Get Re-Hired",
    content: "## Communication is Key\n\nWant to turn a one-off gig into a long-term partnership? Over-communicate. Let the brand know when you receive the product, when you plan to shoot, and when the draft will be ready.\n\n### Under-Promise, Over-Deliver\nIf a brand asks for one TikTok video, throw in 3 high-quality raw photos they can use for their website. This unexpected value-add is the #1 reason creators get re-hired.\n\n### Meet Your Deadlines\nProfessionalism sets you apart from 90% of creators. Always deliver your drafts on or before the agreed-upon deadline.",
    coverImageUrl: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=1200&q=80",
    category: "How to Increase Gig Performance",
    targetRole: "creator",
    published: true,
    featured: true,
  },
  {
    title: "Campaign Best Practices: A Checklist for Brands",
    content: "## Setting Up for Success\n\nBefore launching an influencer campaign, ensure you have a clear objective: Brand Awareness, Lead Generation, or Direct Sales?\n\n- **Clear Briefs:** Provide mood boards, dos and don'ts, but allow creative freedom.\n- **Trackable Links:** Use UTM parameters or unique promo codes to track creator performance.\n- **Usage Rights:** Clearly define where and for how long you plan to use the creator's content (e.g., paid ads, organic social, website).\n\nRemember, treating creators as partners rather than vendors yields the most authentic content.",
    coverImageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80",
    category: "Campaign Best Practices",
    targetRole: "brand",
    published: true,
    featured: false,
  },
  {
    title: "Profile Optimization: Stand Out to Top Brands",
    content: "## First Impressions Matter\n\nYour profile is your digital resume. Brands spend an average of 10 seconds reviewing a profile before making a decision.\n\n### High-Quality Portfolio\nShowcase your best performing posts. Include a mix of static images, videos, and carousel posts.\n\n### Clear Bio & Niche\nDon't be a generalist. 'Vegan Skincare Enthusiast' is much more hireable than 'Lifestyle Creator'. Define your niche clearly so brands know exactly what you bring to the table.",
    coverImageUrl: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=1200&q=80",
    category: "Profile Optimization",
    targetRole: "creator",
    published: true,
    featured: false,
  },
  {
    title: "Creator Selection Tips: Quality over Quantity",
    content: "## The Follower Count Myth\n\nMany brands still chase vanity metrics. However, a creator with 10k highly engaged followers will often outperform a creator with 100k passive followers.\n\n### Analyzing Audience Demographics\nUse our platform tools to ensure the creator's audience matches your target customer demographic. A male fitness influencer might have 500k followers, but if 90% of them are men, they won't be effective at selling women's activewear.\n\n### Vetting Past Collaborations\nLook at their previous sponsored posts. Do they sound authentic, or does it sound like they are reading from a script?",
    coverImageUrl: "https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&q=80",
    category: "Creator Selection Tips",
    targetRole: "brand",
    published: true,
    featured: false,
  },
  {
    title: "Better Content Creation: Lighting and Audio",
    content: "## The Technical Essentials\n\nYou don't need a $2,000 camera to create great content. Your smartphone is powerful enough, provided you master lighting and audio.\n\n### Natural Light is Your Best Friend\nAlways shoot facing a window. If shooting at night, invest in a reliable ring light or softbox. Shadows can distract from the product you are promoting.\n\n### Crisp Audio\nViewers will forgive bad video quality, but they will instantly scroll past bad audio. Use a cheap lavalier microphone or a wireless mic when speaking to the camera.",
    coverImageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",
    category: "Better Content Creation",
    targetRole: "creator",
    published: true,
    featured: false,
  },
  {
    title: "How to Create Effective Campaigns on a Budget",
    content: "## Micro-Influencer Magic\n\nIf you have a tight marketing budget, skip the macro-influencers. Instead, hire 10-15 micro-influencers (5k-20k followers).\n\n### Product Seeding\nAlso known as gifting. Reach out to creators who already love your brand and offer them free products with no strings attached. Often, they will post about it organically.\n\n### User-Generated Content (UGC) Only\nPay creators strictly for content generation, not distribution. You can then run paid ads using their high-converting, authentic content from your brand's own account.",
    coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    category: "How to Create Effective Campaigns",
    targetRole: "brand",
    published: true,
    featured: true,
  },
  {
    title: "Personal Branding: Finding Your Unique Voice",
    content: "## Who Are You?\n\nWith millions of creators online, how do you stand out? The answer is authenticity.\n\n### Document, Don't Create\nInstead of trying to fabricate the perfect lifestyle, simply document your journey. Share your failures, your learnings, and your genuine passions. Relatability builds trust.\n\n### Consistency Across Platforms\nEnsure your handles, profile pictures, and tone of voice are consistent across Instagram, TikTok, and YouTube. A strong personal brand makes you easily recognizable.",
    coverImageUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200&q=80",
    category: "Personal Branding",
    targetRole: "creator",
    published: true,
    featured: false,
  },
  {
    title: "Increase Earnings: Negotiating with Brands",
    content: "## Know Your Worth\n\nMany creators undercharge because they fear losing the deal. Understanding industry standards is crucial.\n\n### The Standard Formula\nA common starting point for pricing is $100 per 10,000 followers, plus additional fees for usage rights, whitelisting, and exclusivity.\n\n### Ask for their Budget First\nWhen a brand reaches out, kindly ask: *\"To ensure I can provide a package that aligns with your goals, do you have a specific budget allocated for this campaign?\"*\n\n### Upselling\nIf a brand asks for one Reels video, offer a package: *\"I can do 1 Reel and 3 Story posts for X amount.\"* Bundling increases your average order value.",
    coverImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80",
    category: "Increase Earnings",
    targetRole: "creator",
    published: true,
    featured: true,
  }
];

const seedBlogs = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Clearing existing blogs...");
    await Blog.deleteMany({});
    console.log("Existing blogs cleared.");

    console.log("Inserting new mock blogs...");
    await Blog.insertMany(mockBlogs);
    console.log(`Successfully inserted ${mockBlogs.length} blogs!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding blogs:", error);
    process.exit(1);
  }
};

seedBlogs();
