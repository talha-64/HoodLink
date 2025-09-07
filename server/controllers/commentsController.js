import express from "express";
import pool from "../db.js";

export const addComment = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  const { content } = req.body;

  try {
    const trimmedContent = content.trim();

    if (trimmedContent == "" || trimmedContent.length > 250) {
      return res.status(400).json({ message: "Invalid content" });
    }

    const userResult = await pool.query(
      `SELECT neighborhood_id FROM users WHERE id = $1`,
      [userId]
    );

    const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (
      userResult.rows[0].neighborhood_id !== postResult.rows[0].neighborhood_id
    ) {
      return res
        .status(401)
        .json({ message: "You don't have permission to comment on this post" });
    }

    await pool.query(
      `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)`,
      [postId, userId, trimmedContent]
    );

    return res.status(200).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error("Create Comment error:", err.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCommentsForPost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const userResult = await pool.query(
      `SELECT neighborhood_id FROM users WHERE id = $1`,
      [userId]
    );

    const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (
      userResult.rows[0].neighborhood_id !== postResult.rows[0].neighborhood_id
    ) {
      return res.status(401).json({
        message: "You don't have permission to view comments on this post",
      });
    }

    const commentsResults = await pool.query(
      `SELECT c.id, c.content, u.full_name, u.profile_pic, updated_at FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1`,
      [postId]
    );

    if (commentsResults.rows.length === 0) {
      return res.status(200).json({ comments: [] });
    }

    return res.status(200).json({ comments: commentsResults.rows });
  } catch (err) {
    console.error("Create Comment error:", err.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.id;
  try {
    const commentResult = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentResult.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this comment" });
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    res.status(200).json({ msg: "Comment Deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateComment = async (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.id;
  const { content } = req.body;
  try {
    const trimmedContent = content.trim();

    if (trimmedContent == "" || trimmedContent.length > 250) {
      return res.status(400).json({ message: "Invalid content" });
    }

    const commentResult = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentResult.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this comment" });
    }

    const updatedComment = await pool.query(
      `UPDATE comments SET content = $1 WHERE id = $2 RETURNING *`,
      [trimmedContent, commentId]
    );

    res.status(200).json({
      msg: "Comment updated Successfully",
      comment: updatedComment.rows[0],
    });
  } catch (err) {
    console.log(`comment error: ` + err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
