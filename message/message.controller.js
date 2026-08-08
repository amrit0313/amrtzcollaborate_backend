import catchAsync from "../utils/catchAsync.js";
import AppError from "../errors/AppError.js";
import { getMessagesByConversationId } from "./message.services.js";

export const getMessagesController = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  if (!req.user?.id) return next(new AppError("Not authorized", 401));
  if (!conversationId)
    return next(new AppError("Conversation ID is required", 400));

  const messages = await getMessagesByConversationId(conversationId);
  res.json({ success: true, data: messages });
});
