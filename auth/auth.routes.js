import express from "express";
const router = express.Router();
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
  user,
} from "./auth.controller.js";
import { generateAccessToken } from "./auth.service.js";
import passport from "../config/passport.js";
import { authenticate } from "./auth.middleware.js";
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback,
);
router.get("/me", authenticate, user);
export default router;
