import Blog from "../models/Blog.js";

export const getBlogs = async (req, res) => {
  try {
    const { targetRole, featured, published } = req.query;

    const filter = {};

    if (targetRole) filter.targetRole = targetRole;
    if (featured !== undefined) filter.featured = featured === "true";
    if (published !== undefined) filter.published = published === "true";

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Get blogs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs.",
    });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get blog error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch blog.",
    });
  }
};

export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Create blog error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create blog.",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.blogId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Update blog error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update blog.",
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    console.error("Delete blog error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete blog.",
    });
  }
};