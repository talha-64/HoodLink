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
} from "../controllers/postsController.js";

const router = Router();

router.post(
  "/createPost",
  authenticateJWT,
  uploadPost.array("images", 3),
  createPost
);

router.get("/getPost/:id", authenticateJWT, getPost);

router.get("/getAllPosts", authenticateJWT, getAllNeighborhoodPosts);

router.delete("/deletePost/:id", authenticateJWT, deletePost);

router.get("/editPost/:id", authenticateJWT, getPostForEdit);

router.get(
  "/updatePost/:id",
  authenticateJWT,
  uploadPost.array("images", 3),
  updatePost
);

export default router;
