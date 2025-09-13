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
  home,
} from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/authMiddlewares.js";
import { registerUploadProfile, updateUploadProfile } from "../multer.js";

const router = Router();

router.post("/register", registerUploadProfile.single("avatar"), registerUser);

router.post("/login", loginUser);

router.get("/profile", authenticateJWT, userProfile);

router.get("/", authenticateJWT, home);

router.delete("/user", authenticateJWT, deleteUser);

router.put("/profile", authenticateJWT, updateProfileInfo);

router.put(
  "/profilePhoto",
  authenticateJWT,
  updateUploadProfile.single("profile_pic"),
  updateProfilePhoto
);

router.put("/password", authenticateJWT, updatePassword);

router.get("/neighbors", authenticateJWT, viewNeighbors);

export default router;
