import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    coverImageUrl: {
      type: String,
    },

    category: {
      type: String,
      enum: [
        "How to Create Effective Campaigns",
        "Campaign Best Practices",
        "Creator Selection Tips",
        "Marketing Strategies",
        "How to Increase Gig Performance",
        "Profile Optimization",
        "Better Content Creation",
        "Increase Earnings",
        "Personal Branding",
      ],
      required: true,
    },

    targetRole: {
      type: String,
      enum: ["brand", "creator"],
      required: true,
    },

    published: {
      type: Boolean,
      required: true,
      default: false,
    },

    featured: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;