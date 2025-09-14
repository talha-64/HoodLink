import express from "express";
import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddlewares.js";
import { uploadPost } from "../multer.js";
import {
  createPost,
  deletePost,
  getAllNeighborhoodPosts,
  getPost,
  getPostForEdit,
  updatePost,
  getMyPosts,
  // filterPostByCategory,
  searchPost,
  searchMyPosts,
} from "../controllers/postsController.js";

const router = Router();

router.post("/", authenticateJWT, uploadPost.array("images", 3), createPost);

router.get("/allPosts", authenticateJWT, getAllNeighborhoodPosts);

router.get("/myPosts", authenticateJWT, getMyPosts);

router.get("/search", authenticateJWT, searchPost);

router.get("/searchMyPosts", authenticateJWT, searchMyPosts);

router.get("/:postId", authenticateJWT, getPost);

router.delete("/:postId", authenticateJWT, deletePost);

router.get("/editPost/:postId", authenticateJWT, getPostForEdit);

router.put(
  "/:postId",
  authenticateJWT,
  uploadPost.array("images", 3),
  updatePost
);

// router.get("/:category", authenticateJWT, filterPostByCategory);

export default router;
