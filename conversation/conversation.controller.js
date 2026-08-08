import {
  getConversations,
  createConversation,
  addParticipants,
  deleteConversation,
} from "./conversation.service.js";

import catchAsync from "../utils/catchAsync.js";
import AppError from "../errors/AppError.js";

export const getConversationController = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) return next(new AppError("Not authorized", 401));

  const conversation = await getConversations(userId);
  if (!conversation.length) {
    return res.json({ success: true, data: [] });
  }

  res.json({ success: true, data: conversation });
});

export const createConversationController = catchAsync(
  async (req, res, next) => {
    const userId = req.user.id;
    const receiverId =
      req.body.receiverId ?? req.body.receiver?.id ?? req.body.receiver?.userId;

    if (!userId) return next(new AppError("Not authorized", 401));
    if (!receiverId) return next(new AppError("Receiver ID is required", 400));

    const conversation = await createConversation(userId, receiverId);
    res.json({
      success: true,
      data: conversation,
    });
  },
);
