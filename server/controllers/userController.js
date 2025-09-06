import fs from "fs";
import pool from "../db.js";
import bcrypt, { hash } from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const { full_name, email, password, phone, postal_code } = req.body;
  const avatar = req.savedFileName || null;
  let profile_pic_path = null;

  try {
    let neighborhoodResult = await pool.query(
      `SELECT id FROM neighborhoods WHERE postal_code = $1`,
      [postal_code]
    );

    if (avatar) {
      profile_pic_path = `/uploads/profile_pictures/${avatar}`;
    }

    if (neighborhoodResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid postal code" });
    }

    function validateEmail(e) {
      var filter =
        /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
      return String(e).search(filter) != -1;
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid Email" });
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
      user: result.rows[0],
    });
    // res.redirect("/login");
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: "server Error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email.toLowerCase().trim(),
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Invalid Email or Password" });
    }

    const user = userResult.rows[0];

    const hashedPassword = userResult.rows[0].password;

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, neighborhood_id: user.neighborhood_id },
      JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_TTL,
      }
    );

    const { password: _, ...userData } = user;

    return res
      .status(200)
      .json({ message: "Login Successfull", token, user: userData });
    //
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const userProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await pool.query(
      "SELECT id, full_name, email, phone, neighborhood_id, created_at FROM users WHERE id = $1",
      [id]
    );

    const userInfo = user.rows[0];

    res.status(200).json({ message: "Profile page", user: userInfo });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
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
      return res.status(401).json({ message: "Invalid Password" });
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
    res.status(500).json({ error: "Internal Server Error" });
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
      return res.status(404).json({ error: "User not found" });
    }

    let neighborhoodResult = await pool.query(
      `SELECT id FROM neighborhoods WHERE postal_code = $1`,
      [postal_code]
    );

    if (neighborhoodResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid postal code" });
    }

    // function validateEmail(e) {
    //   var filter =
    //     /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
    //   return String(e).search(filter) != -1;
    // }

    const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    const hashedPassword = userResult.rows[0].password;

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    await pool.query(
      `UPDATE users SET full_name = $1, email = $2, phone = $3, neighborhood_id = (
        SELECT id FROM neighborhoods WHERE postal_code = $4
      ) WHERE id = $5`,
      [
        full_name.trim(),
        email.toLowerCase().trim(),
        phone.trim() || null,
        postal_code,
        id,
      ]
    );

    res.status(200).json({ msg: "Personal Info Updated Successfully" });
    // res.redirect("/register");
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
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
      return res.status(404).json({ error: "User not found" });
    }

    const oldProfilePic = userResult.rows[0].profile_pic;

    if (avatar) {
      profile_pic_path = `/uploads/profile_pictures/${avatar}`;

      if (oldProfilePic) {
        const oldFilePath = path.join(__dirname, `../..${oldProfilePic}`);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      await pool.query(`UPDATE users SET profile_pic = $1 WHERE id = $2`, [
        profile_pic_path,
        id,
      ]);

      return res
        .status(200)
        .json({ msg: "Profile Picture Updated Successfully" });
    }

    if (oldProfilePic) {
      const oldFilePath = path.join(__dirname, `../..${oldProfilePic}`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await pool.query(`UPDATE users SET profile_pic = NULL WHERE id = $1`, [id]);
    return res
      .status(200)
      .json({ msg: "Profile Picture Removed Successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
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
      return res.status(401).json({ message: "Invalid Password" });
    }

    const samePassword = await bcrypt.compare(newPassword, hashedPassword);

    if (samePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
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
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
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
      "SELECT full_name, profile_pic FROM users WHERE neighborhood_id = $1 AND id != $2",
      [neighborhood_id, id]
    );

    if (neighborsResult.rows.length === 0) {
      return res.status(401).json({ message: "No neighbors found" });
    }

    const neighbors = neighborsResult.rows;

    res.status(200).json({ users: neighbors });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
