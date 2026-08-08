import Message from "./message.model.js";

export const createMessage = async ({ conversationId, sender, content }) => {
  const message = await Message.create({ conversationId, sender, content });
  return message.populate("sender", "name email");
};

export const getMessagesByConversationId = async (conversationId) => {
  return await Message.find({ conversationId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });
};
