import express from "express";
import pool from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPost = async (req, res) => {
  const { title, content, category } = req.body;
  const categories = ["help_request", "news", "lost_and_found"];

  try {
    const userId = req.user.id;
    const neighborhood_id = req.user.neighborhood_id;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content cannot be empty" });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    await pool.query("BEGIN");

    const postResult = await pool.query(
      "INSERT INTO posts (user_id, neighborhood_id, title, content,  category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, neighborhood_id, title.trim(), content.trim(), category || null]
    );

    const newPost = postResult.rows[0];
    const postId = newPost.id;

    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(
        (file) => `/uploads/posts/${file.filename}`
      );

      for (const path of imagePaths) {
        await pool.query(
          `INSERT INTO post_images (post_id, image_path) VALUES ($1, $2)`,
          [postId, path]
        );
      }
    }

    const imagesResult = await pool.query(
      `SELECT image_path FROM post_images WHERE post_id = $1`,
      [postId]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      message: "Posted successfully",
      post: {
        ...newPost,
        images: imagesResult.rows.map((row) => row.image_path),
      },
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.log(err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const getPost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const postResult = await pool.query(
      `SELECT p.id, p.title, p.content, p.category, p.created_at, p.user_id, p.neighborhood_id, u.full_name, u.profile_pic
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 `,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(400).json({ message: "Post not found" });
    }

    const post = postResult.rows[0];

    const imagesResult = await pool.query(
      `SELECT image_path FROM post_images WHERE post_id = $1`,
      [postId]
    );

    post.images = imagesResult.rows.map((row) => row.image_path);

    res.status(200).json({ post });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const getAllNeighborhoodPosts = async (req, res) => {
  const neighborhood_id = req.user.neighborhood_id;

  try {
    const neighborhoodResult = await pool.query(
      "SELECT * FROM neighborhoods WHERE id = $1",
      [neighborhood_id]
    );

    if (neighborhoodResult.rows.length === 0) {
      return res.status(404).json({ message: "Neighborhood not found." });
    }

    const postsResult = await pool.query(
      `SELECT p.id, p.title, p.content, p.category, p.created_at, p.user_id, p.neighborhood_id, u.full_name, u.profile_pic FROM posts p JOIN users u ON p.user_id = u.id WHERE p.neighborhood_id = $1 ORDER BY p.created_at DESC`,
      [neighborhood_id]
    );

    const posts = postsResult.rows;

    if (posts.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    const postIds = posts.map((p) => p.id);
    const imagesResult = await pool.query(
      `SELECT post_id, image_path FROM post_images WHERE post_id = ANY($1::int[])`,
      [postIds]
    );

    const imagesByPost = {};
    imagesResult.rows.forEach((row) => {
      if (!imagesByPost[row.post_id]) {
        imagesByPost[row.post_id] = [];
      }
      imagesByPost[row.post_id].push(row.image_path);
    });

    const postsWithImages = posts.map((post) => ({
      ...post,
      images: imagesByPost[post.id] || [],
    }));

    res.status(200).json({ posts: postsWithImages });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const deletePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  try {
    const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postAuthor = postResult.rows[0].user_id;

    if (postAuthor !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this post" });
    }

    const imagesResult = await pool.query(
      "SELECT image_path FROM post_images WHERE post_id = $1",
      [postId]
    );

    const imagePaths = imagesResult.rows.map((row) => row.image_path);

    imagePaths.forEach((picPath) => {
      const oldFilePath = path.join(__dirname, `../..${picPath}`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    });

    await pool.query("DELETE FROM post_images WHERE post_id = $1", [postId]);

    await pool.query(`DELETE FROM posts WHERE id = $1`, [postId]);

    res.status(200).json({ msg: "Post Deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostForEdit = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const postResult = await pool.query(
      `SELECT p.*, u.full_name, u.profile_pic FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postResult.rows[0];

    if (post.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this post" });
    }

    const imagesResult = await pool.query(
      `SELECT image_path FROM post_images WHERE post_id = $1 ORDER BY id ASC`,
      [postId]
    );

    post.images = imagesResult.rows.map((r) => r.image_path);

    return res.status(200).json({ post });
  } catch (err) {
    console.log(err.message);

    res.status(500).json({ Error: "Server Error" });
  }
};

export const updatePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  const categories = ["help_request", "news", "lost_and_found"];
  const { title, content, category } = req.body;

  try {
    const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    const post = postResult.rows[0];

    if (post.user_id !== userId) {
      return res.status(403).json({ message: "You cannot edit this post" });
    }

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content cannot be empty" });
    }
    if (category && !categories.includes(category)) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    const oldImagesResult = await pool.query(
      "SELECT * FROM post_images WHERE post_id = $1",
      [postId]
    );
    const oldImages = oldImagesResult.rows;

    if (oldImages.length > 0) {
      for (const img of oldImages) {
        const oldFilePath = path.join(__dirname, `../..${img.image_path}`);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error(`Failed to delete file: ${oldFilePath}`, err.message);
          }
        }
      }
      await pool.query("DELETE FROM post_images WHERE post_id = $1", [postId]);
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imagePath = `/uploads/posts/${file.filename}`;
        await pool.query(
          "INSERT INTO post_images (post_id, image_path) VALUES ($1, $2)",
          [postId, imagePath]
        );
      }
    }

    const updatedPost = await pool.query(
      `UPDATE posts SET title = $1, content = $2, category = $3 WHERE id = $4`,
      [
        title || post.title,
        content || post.content,
        category || post.category,
        postId,
      ]
    );

    res
      .status(200)
      .json({ msg: "Post Updated Successfully", post: updatedPost.rows[0] });
  } catch (err) {
    console.error("updatePost error:", err.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const filterPostByCategory = async (req, res) => {
  const category = req.params.category;
  const neighborhood_id = req.user.neighborhood_id;
  const categories = ["help_request", "news", "lost_and_found"];

  try {
    const neighborhoodResult = await pool.query(
      "SELECT * FROM neighborhoods WHERE id = $1",
      [neighborhood_id]
    );

    if (neighborhoodResult.rows.length === 0) {
      return res.status(404).json({ message: "Neighborhood not found." });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    const postsResult = await pool.query(
      `SELECT p.id, p.title, p.content, p.category, p.created_at, p.user_id, p.neighborhood_id, u.full_name, u.profile_pic FROM posts p JOIN users u ON p.user_id = u.id WHERE p.neighborhood_id = $1 AND p.category = $2 ORDER BY p.created_at DESC`,
      [neighborhood_id, category]
    );

    const posts = postsResult.rows;

    if (posts.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    const postIds = posts.map((p) => p.id);
    const imagesResult = await pool.query(
      `SELECT post_id, image_path FROM post_images WHERE post_id = ANY($1::int[])`,
      [postIds]
    );

    const imagesByPost = {};
    imagesResult.rows.forEach((row) => {
      if (!imagesByPost[row.post_id]) {
        imagesByPost[row.post_id] = [];
      }
      imagesByPost[row.post_id].push(row.image_path);
    });

    const postsWithImages = posts.map((post) => ({
      ...post,
      images: imagesByPost[post.id] || [],
    }));

    res.status(200).json({ posts: postsWithImages });
  } catch (err) {
    console.error("Get Post by category error:", err.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const searchPost = async (req, res) => {
  const neighborhood_id = req.user.neighborhood_id;
  const { q } = req.query;

  try {
    const neighborhoodResult = await pool.query(
      "SELECT * FROM neighborhoods WHERE id = $1",
      [neighborhood_id]
    );

    if (neighborhoodResult.rows.length === 0) {
      return res.status(404).json({ message: "Neighborhood not found." });
    }

    if (!q) {
      return res.status(400).json({ message: "Missing search query" });
    }

    const searchQuery = await pool.query(
      `SELECT p.id, p.title, p.content, p.category, p.created_at, p.user_id, p.neighborhood_id, u.full_name, u.profile_pic FROM posts p JOIN users u ON p.user_id = u.id WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery($1) AND p.neighborhood_id = $2 ORDER BY p.created_at DESC`,
      [q, neighborhood_id]
    );

    const posts = searchQuery.rows;

    if (posts.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    const postIds = posts.map((p) => p.id);
    const imagesResult = await pool.query(
      `SELECT post_id, image_path FROM post_images WHERE post_id = ANY($1::int[])`,
      [postIds]
    );

    const imagesByPost = {};
    imagesResult.rows.forEach((row) => {
      if (!imagesByPost[row.post_id]) {
        imagesByPost[row.post_id] = [];
      }
      imagesByPost[row.post_id].push(row.image_path);
    });

    const postsWithImages = posts.map((post) => ({
      ...post,
      images: imagesByPost[post.id] || [],
    }));

    res.status(200).json({ posts: postsWithImages });
  } catch (err) {
    console.error("Get Search Post error:", err.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};
