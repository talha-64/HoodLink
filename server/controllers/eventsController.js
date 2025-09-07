import express from "express";
import pool from "../db.js";

export const createEvent = async (req, res) => {
  const userId = req.user.id;
  const neighborhood_id = req.user.neighborhood_id;
  const { Title, Description, event_Date, Location } = req.body;

  try {
    const title = Title.trim();
    const description = Description.trim();
    const location = Location.trim();

    if (!title || !description || !location) {
      return res
        .status(400)
        .json({ message: "Title, description and location cannot be empty" });
    }

    if (title.length > 100) {
      return res.status(400).json({ error: "Title too long" });
    }

    if (description.length > 250) {
      return res
        .status(400)
        .json({ error: "Description must be less than 250 characters" });
    }

    const eventDate = new Date(event_Date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ error: "Invalid event date" });
    }
    if (eventDate < new Date()) {
      return res
        .status(400)
        .json({ error: "Event date must be in the future" });
    }

    const eventResult = await pool.query(
      "INSERT INTO events (neighborhood_id, title, description, event_date, location, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [neighborhood_id, title, description, event_Date, location, userId]
    );

    res.status(201).json({
      message: "Event posted successfully",
      event: eventResult.rows[0],
    });
  } catch (err) {
    console.log("Event create error: " + err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const getEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const userNeighborhoodId = req.user.neighborhood_id;

  try {
    const eventNeighborhoodResult = await pool.query(
      `SELECT neighborhood_id FROM events WHERE id = $1`,
      [eventId]
    );

    if (eventNeighborhoodResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (eventNeighborhoodResult.rows[0].neighborhood_id != userNeighborhoodId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to view this event" });
    }

    const eventResult = await pool.query(
      `SELECT e.title, e.description, e.event_date, e.location, e.created_at, u.full_name, u.profile_pic
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = $1 `,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(400).json({ message: "Event not found" });
    }

    const event = eventResult.rows[0];

    res.status(200).json({ event });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const getAllNeighborhoodEvent = async (req, res) => {
  const neighborhood_id = req.user.neighborhood_id;

  try {
    const neighborhoodResult = await pool.query(
      "SELECT * FROM neighborhoods WHERE id = $1",
      [neighborhood_id]
    );

    if (neighborhoodResult.rows.length === 0) {
      return res.status(404).json({ message: "Neighborhood not found." });
    }

    const eventsResult = await pool.query(
      `SELECT e.id, e.title, e.description, e.event_date, e.location, e.created_at, e.user_id, e.neighborhood_id, u.full_name, u.profile_pic 
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.neighborhood_id = $1
      ORDER BY e.event_date ASC`,
      [neighborhood_id]
    );
    console.log("working");
    const events = eventsResult.rows;

    if (events.length === 0) {
      return res.status(200).json({ events: [] });
    }

    res.status(200).json({ events });
  } catch (err) {
    console.log("Get all events error: " + err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const deleteEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;
  try {
    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      eventId,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventAuthor = eventResult.rows[0].user_id;

    if (eventAuthor !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this event" });
    }

    await pool.query("DELETE FROM events WHERE id = $1", [eventId]);

    res.status(200).json({ msg: "Event Deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEventForEdit = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;

  try {
    const eventResult = await pool.query(
      `SELECT e.*, u.full_name, u.profile_pic FROM events e JOIN users u ON e.user_id = u.id WHERE e.id = $1`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = eventResult.rows[0];

    if (event.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this event" });
    }

    return res.status(200).json({ event });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: "Server Error" });
  }
};

export const updateEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;
  const { Title, Description, event_Date, Location } = req.body;

  try {
    const title = Title.trim();
    const description = Description.trim();
    const location = Location.trim();

    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      eventId,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    const event = eventResult.rows[0];

    if (event.user_id !== userId) {
      return res.status(403).json({ message: "You cannot edit this event" });
    }

    if (!title || !description || !event_Date || !location) {
      return res.status(400).json({
        message: "Title, description, date, and location cannot be empty",
      });
    }

    const newEventDate = new Date(event_Date);
    if (isNaN(newEventDate.getTime())) {
      return res.status(400).json({ message: "Invalid event date" });
    }
    if (newEventDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Event date must be in the future" });
    }

    const updatedEvent = await pool.query(
      `UPDATE events SET title = $1, description = $2, event_date = $3, location = $4 WHERE id = $5 RETURNING *`,
      [
        title || event.title,
        description || event.description,
        event_Date || event.event_date,
        location || event.location,
        eventId,
      ]
    );

    res.status(200).json({
      message: "Event Updated Successfully",
      event: updatedEvent.rows[0],
    });
  } catch (err) {
    console.error("updateEvent error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const searchEvent = async (req, res) => {
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
      `SELECT e.id, e.title, e.description, e.event_date, e.location, e.created_at, e.user_id, e.neighborhood_id, u.full_name, u.profile_pic FROM events e JOIN users u ON e.user_id = u.id WHERE to_tsvector('english', e.title || ' ' || e.description) @@ plainto_tsquery($1) AND e.neighborhood_id = $2 ORDER BY e.event_date DESC`,
      [q, neighborhood_id]
    );

    const events = searchQuery.rows;

    if (events.length === 0) {
      return res.status(200).json({ events: [] });
    }

    res.status(200).json({ events });
  } catch (err) {
    console.error("Get Search Event error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
