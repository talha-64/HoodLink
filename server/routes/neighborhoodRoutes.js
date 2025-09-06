import express from "express";
import { Router } from "express";
import { getAllNeighborhoods } from "../controllers/neighborhoodController.js";

const router = Router();

router.get("/getAllNeighborhoods", getAllNeighborhoods);

export default router;
