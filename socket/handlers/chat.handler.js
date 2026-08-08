import { SOCKET_EVENTS } from "../socket.constant.js";
import { createMessage } from "../../message/message.services.js";
import { touchConversation } from "../../conversation/conversation.service.js";

export const registerChatHandler = (io, socket) => {
  // socket.user.id available here — set by authenticateSocket middleware

  socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversationId) => {
    socket.join(conversationId);
  });

  socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload, ack) => {
    try {
      const conversationId = payload?.conversationId;
      const content = payload?.content?.trim();

      if (!conversationId) throw new Error("Conversation ID is required");
      if (!content) throw new Error("Message content is required");

      const message = await createMessage({
        conversationId,
        sender: socket.user.id,
        content,
      });

      await touchConversation(conversationId, content);

      io.to(conversationId).emit(SOCKET_EVENTS.NEW_MESSAGE, {
        ...message.toObject(),
        conversationId,
      });
      if (typeof ack === "function") ack({ status: "ok", message });
    } catch (err) {
      if (typeof ack === "function")
        ack({ status: "error", error: err.message });
    }
  });

  socket.on(SOCKET_EVENTS.TYPING_START, (conversationId) => {
    // broadcast to room EXCEPT sender — don't need to tell yourself you're typing
    socket.to(conversationId).emit(SOCKET_EVENTS.TYPING_START, {
      userId: socket.user.id,
      conversationId,
    });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, (conversationId) => {
    socket.to(conversationId).emit(SOCKET_EVENTS.TYPING_STOP, {
      userId: socket.user.id,
      conversationId,
    });
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    // socket.io auto-removes the socket from all rooms on disconnect —
    // you don't need to manually leave() here
    console.log(`User ${socket.user.id} disconnected`);
  });
};
