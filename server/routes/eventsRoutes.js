import express from "express";
import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddlewares.js";
import {
  createEvent,
  deleteEvent,
  getAllNeighborhoodEvent,
  getEvent,
  getEventForEdit,
  updateEvent,
  searchEvent,
} from "../controllers/eventsController.js";

const router = Router();

router.post("/", authenticateJWT, createEvent);

router.get("/allEvents", authenticateJWT, getAllNeighborhoodEvent);

router.get("/search", authenticateJWT, searchEvent);

router.get("/editEvent/:eventId", authenticateJWT, getEventForEdit);

router.get("/:eventId", authenticateJWT, getEvent);

router.put("/:eventId", authenticateJWT, updateEvent);

router.delete("/:eventId", authenticateJWT, deleteEvent);

export default router;
