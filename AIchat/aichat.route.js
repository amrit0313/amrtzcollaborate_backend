import express from "express";
import { amrtzAiTalk, getAiMessages } from "./aichat.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
const router = express.Router();

router.use(authenticate);

router.post("/:conversationId", amrtzAiTalk);
router.get("", getAiMessages);

export default router;
