import express from "express";
const router = express.Router();
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  searchUsers,
  listUsers,
  getUserById,
} from "./user.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

// all routes below require a valid access token
router.use(authenticate);

router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.post("/me/change-password", changePassword);
router.delete("/me", deleteAccount);
router.get("/search", searchUsers);

// admin-only
router.get("/", authorize("admin"), listUsers);
router.get("/:id", authorize("admin"), getUserById);

export default router;
