import express from "express";
import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddlewares.js";
import {
  addComment,
  deleteComment,
  getCommentsForPost,
  updateComment,
} from "../controllers/commentsController.js";

const router = Router();

router.post("/:postId/comments", authenticateJWT, addComment);

router.get("/:postId/comments", authenticateJWT, getCommentsForPost);

router.delete("/comments/:id", authenticateJWT, deleteComment);

router.put("/comments/:id", authenticateJWT, updateComment);

export default router;
