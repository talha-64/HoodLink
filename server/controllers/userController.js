import fs from "fs";
import pool from "../db.js";
import bcrypt, { hash } from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { error } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const { full_name, email, password, phone, postal_code } = req.body;
  const avatar = req.savedFileName || null;
  let profile_pic_path = null;

  try {
    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name ,Email or Password cannot be empty" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let neighborhoodResult = await pool.query(
      `SELECT id FROM neighborhoods WHERE postal_code = $1`,
      [postal_code]
    );

    if (avatar) {
      profile_pic_path = `/uploads/profile_pictures/${avatar}`;
    }

    if (neighborhoodResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid postal code" });
    }

    function validateEmail(e) {
      var filter =
        /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
      return String(e).search(filter) != -1;
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const neighborhood_id = neighborhoodResult.rows[0].id;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (full_name, email, password, phone, neighborhood_id, profile_pic) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        full_name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        phone.trim() || null,
        neighborhood_id,
        profile_pic_path || null,
      ]
    );

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    let userResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email.toLowerCase().trim(),
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Invalid Email or Password" });
    }

    const user = userResult.rows[0];

    const hashedPassword = userResult.rows[0].password;

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, neighborhood_id: user.neighborhood_id },
      JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_TTL,
      }
    );

    const userData = {
      full_name: user.full_name,
      profile_pic: user.profile_pic,
    };

    return res
      .status(200)
      .json({ message: "Login Successfull", token, user: userData });
    //
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const userProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const neighborhood_id = req.user.neighborhood_id;
    const user = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.neighborhood_id,  u.   profile_pic, u.created_at, n.postal_code,
          n.name AS neighborhood_name,   
          COUNT(c.id) AS conversation_count
          FROM users u
          LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id
          LEFT JOIN conversations c 
          ON c.user1_id = u.id OR c.user2_id = u.id
          WHERE u.id = $1
          GROUP BY u.id, n.name, n.postal_code  `,
      [id]
    );

    const totalPosts = await pool.query(
      `SELECT * FROM posts WHERE user_id = $1 AND neighborhood_id = $2`,
      [id, neighborhood_id]
    );

    const recentMonthsPosts = await pool.query(
      `SELECT * FROM posts WHERE user_id = $1 
      AND neighborhood_id = $2 
      AND created_at >= NOW() - INTERVAL '1 month'
      ORDER BY created_at DESC`,
      [id, neighborhood_id]
    );

    const recentEvents = await pool.query(
      `SELECT * FROM events WHERE user_id = $1 
      AND neighborhood_id = $2 
      AND created_at >= NOW() - INTERVAL '1 month'
      ORDER BY created_at DESC`,
      [id, neighborhood_id]
    );

    const recentComments = await pool.query(
      `SELECT * FROM comments WHERE user_id = $1
      AND created_at >= NOW() - INTERVAL '1 month'
      ORDER BY created_at DESC`,
      [id]
    );

    const recentPosts = await pool.query(
      `SELECT 
    p.id,
    p.title,
    p.content,
    p.category,
    p.user_id,
    p.neighborhood_id,
    p.created_at,
    u.full_name AS author,
    u.profile_pic,
    COALESCE(
      JSON_AGG(DISTINCT pi.image_path) FILTER (WHERE pi.image_path IS NOT NULL), '[]'
    ) AS images,
    COUNT(DISTINCT c.id) AS comment_count
   FROM posts p
   LEFT JOIN users u ON p.user_id = u.id
   LEFT JOIN post_images pi ON p.id = pi.post_id
   LEFT JOIN comments c ON c.post_id = p.id
   WHERE p.user_id = $1
     AND p.neighborhood_id = $2
   GROUP BY p.id, u.full_name, u.profile_pic
   ORDER BY p.created_at DESC
   LIMIT 2;`,
      [id, neighborhood_id]
    );

    const userEvents = await pool.query(
      `SELECT 
    e.id,
    e.title,
    e.description,
    e.event_date,
    e.created_at,
    e.location,
    u.full_name AS organizer,
    u.profile_pic
   FROM events e
   LEFT JOIN users u ON e.user_id = u.id
   WHERE e.user_id = $1
   ORDER BY e.event_date ASC
   LIMIT 3`,
      [id]
    );

    const userInfo = user.rows[0];

    res.status(200).json({
      message: "Profile page",
      user: userInfo,
      totalPostsCount: totalPosts.rows.length,
      recentMonthPostsCount: recentMonthsPosts.rows.length,
      recentEventsCount: recentEvents.rows.length,
      recentCommentsCount: recentComments.rows.length,
      recentPosts: recentPosts.rows,
      userEvents: userEvents.rows,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.user.id;
  const { password } = req.body;
  try {
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = userResult.rows[0].password;
    const profilePic = userResult.rows[0].profile_pic;

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const oldProfilePic = userResult.rows[0].profile_pic;

    if (oldProfilePic) {
      const oldFilePath = path.join(__dirname, `../..${oldProfilePic}`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    res.status(200).json({ msg: "User Deleted successfully" });
    // res.redirect("/register");
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfileInfo = async (req, res) => {
  const { full_name, email, password, phone, postal_code } = req.body;
  try {
    const id = req.user.id;

    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let neighborhoodResult = await pool.query(
      `SELECT id FROM neighborhoods WHERE postal_code = $1`,
      [postal_code]
    );

    if (neighborhoodResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid postal code" });
    }

    const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const hashedPassword = userResult.rows[0].password;

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const updatedData = await pool.query(
      `UPDATE users SET 
      full_name = $1, 
      email = $2, 
      phone = $3, 
      neighborhood_id = (SELECT id FROM neighborhoods WHERE postal_code = $4)
      WHERE id = $5
      RETURNING full_name, profile_pic, neighborhood_id`,
      [
        full_name.trim(),
        email.toLowerCase().trim(),
        phone.trim() || null,
        postal_code,
        id,
      ]
    );

    res.status(200).json({
      user: updatedData.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfilePhoto = async (req, res) => {
  const id = req.user.id;
  const avatar = req.savedFileName || null;
  let profile_pic_path = null;

  try {
    const userResult = await pool.query(
      "SELECT profile_pic FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldProfilePic = userResult.rows[0].profile_pic;

    if (avatar) {
      profile_pic_path = `/uploads/profile_pictures/${avatar}`;

      // remove old photo if exists
      if (oldProfilePic) {
        const oldFilePath = path.join(__dirname, `../..${oldProfilePic}`);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      const updatedUser = await pool.query(
        `UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING id, full_name, email, profile_pic, phone, created_at`,
        [profile_pic_path, id]
      );

      return res.status(200).json({
        msg: "Profile Picture Updated Successfully",
        user: updatedUser.rows[0],
      });
    }

    if (oldProfilePic) {
      const oldFilePath = path.join(__dirname, `../..${oldProfilePic}`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const updatedUser = await pool.query(
      `UPDATE users SET profile_pic = NULL WHERE id = $1 RETURNING id, full_name, email, profile_pic, phone, created_at`,
      [id]
    );

    return res.status(200).json({
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePassword = async (req, res) => {
  const { newPassword, password } = req.body;
  try {
    const id = req.user.id;

    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = userResult.rows[0].password;

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const samePassword = await bcrypt.compare(newPassword, hashedPassword);

    if (samePassword) {
      return res.status(400).json({
        error: "New password cannot be the same as the old password",
      });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [
      newHashedPassword,
      id,
    ]);

    res.status(200).json({ msg: "Password updated Succesfully" });
    // res.redirect("/register");
  } catch (err) {
    console.log(err.error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const viewNeighbors = async (req, res) => {
  const id = req.user.id;

  try {
    const result = await pool.query(
      "SELECT neighborhood_id FROM users WHERE id = $1",
      [id]
    );

    const neighborhood_id = result.rows[0].neighborhood_id;

    const neighborsResult = await pool.query(
      "SELECT id, full_name, profile_pic FROM users WHERE neighborhood_id = $1 AND id != $2",
      [neighborhood_id, id]
    );

    if (neighborsResult.rows.length === 0) {
      return res.status(200).json({ message: "No neighbors found" });
    }

    const neighbors = neighborsResult.rows;

    res.status(200).json({ neighbors });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const home = async (req, res) => {
  try {
    const userId = req.user.id;
    const neighborhoodId = req.user.neighborhood_id;

    // 1. Neighborhood name
    const neighborhood = await pool.query(
      `SELECT name, city FROM neighborhoods WHERE id = $1`,
      [neighborhoodId]
    );

    // 2. Number of neighbors (users in the same neighborhood)
    const neighbors = await pool.query(
      `SELECT COUNT(*) AS neighbor_count 
       FROM users 
       WHERE neighborhood_id = $1`,
      [neighborhoodId]
    );

    // 3. Number of events for the next week
    const nextWeekEvents = await pool.query(
      `SELECT COUNT(*) AS events_count
       FROM events
       WHERE neighborhood_id = $1
         AND event_date >= NOW()
         AND event_date <= NOW() + INTERVAL '7 days'`,
      [neighborhoodId]
    );

    // 4. Number of conversations for logged-in user
    const conversations = await pool.query(
      `SELECT COUNT(*) AS conversation_count
       FROM conversations
       WHERE user1_id = $1 OR user2_id = $1`,
      [userId]
    );

    // 5. Number of neighborhood posts this month
    const monthPosts = await pool.query(
      `SELECT COUNT(*) AS month_posts_count
       FROM posts
       WHERE neighborhood_id = $1
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [neighborhoodId]
    );

    // 6. Details of 3 recent neighborhood posts
    const recentPosts = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.user_id,
        p.created_at,
        u.profile_pic,
        u.full_name AS author,
        COALESCE(
          JSON_AGG(DISTINCT pi.image_path) FILTER (WHERE pi.image_path IS NOT NULL), '[]'
        ) AS images,
        COUNT(DISTINCT c.id) AS comment_count
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN post_images pi ON p.id = pi.post_id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.neighborhood_id = $1
       GROUP BY p.id, u.full_name, u.profile_pic
       ORDER BY p.created_at DESC
       LIMIT 3`,
      [neighborhoodId]
    );

    // 7. Details of 3 upcoming latest events
    const upcomingEvents = await pool.query(
      `SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.created_at,
        e.location,
        u.full_name AS organizer,
        u.profile_pic
       FROM events e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.neighborhood_id = $1
         AND e.event_date >= NOW()
       ORDER BY e.event_date ASC
       LIMIT 3`,
      [neighborhoodId]
    );

    res.status(200).json({
      neighborhoodName: neighborhood.rows[0]?.name || null,
      neighborhoodCity: neighborhood.rows[0]?.city || null,
      neighborsCount: parseInt(neighbors.rows[0].neighbor_count, 10),
      nextWeekEventsCount: parseInt(nextWeekEvents.rows[0].events_count, 10),
      conversationsCount: parseInt(
        conversations.rows[0].conversation_count,
        10
      ),
      thisMonthPostsCount: parseInt(monthPosts.rows[0].month_posts_count, 10),
      recentPosts: recentPosts.rows,
      upcomingEvents: upcomingEvents.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
