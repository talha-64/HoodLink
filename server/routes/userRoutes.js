import express from "express";
import { Router } from "express";
import {
  deleteUser,
  loginUser,
  registerUser,
  userProfile,
  updatePassword,
  viewNeighbors,
  updateProfileInfo,
  updateProfilePhoto,
} from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/authMiddlewares.js";
import { registerUploadProfile, updateUploadProfile } from "../multer.js";

const router = Router();

router.post("/register", registerUploadProfile.single("avatar"), registerUser);

router.post("/login", loginUser);

router.get("/profile", authenticateJWT, userProfile);

router.delete("/deleteUser", authenticateJWT, deleteUser);

router.put("/updateProfile", authenticateJWT, updateProfileInfo);

router.put(
  "/updateProfilePhoto",
  authenticateJWT,
  updateUploadProfile.single("avatar"),
  updateProfilePhoto
);

router.put("/updatePassword", authenticateJWT, updatePassword);

router.get("/viewNeighbors", authenticateJWT, viewNeighbors);

export default router;
