import express from "express";

import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getBlogs);

router.get("/:blogId", getBlogById);

router.post("/", createBlog);

router.put("/:blogId", updateBlog);

router.delete("/:blogId", deleteBlog);

export default router;