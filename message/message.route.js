import express from "express";
const router = express.Router();

import { authenticate } from "../auth/auth.middleware.js";
import { getMessagesController } from "./message.controller.js";

router.use(authenticate);

router.get("/:conversationId", getMessagesController);

export default router;
