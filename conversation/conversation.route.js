import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../auth/auth.middleware.js";
import {
  getConversationController,
  createConversationController,
} from "./conversation.controller.js";

router.use(authenticate);

router.get("/conversations", getConversationController);
router.post("/conversation", createConversationController);
router.post("/conversations", createConversationController);
// router.post("/addParticipants", addParticipants);

export default router;
