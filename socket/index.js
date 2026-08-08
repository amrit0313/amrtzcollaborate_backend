import { Server } from "socket.io";
import { authenticateSocket } from "./socket.middleware.js";
import { registerChatHandler } from "./handlers/chat.handler.js";
import { SOCKET_EVENTS } from "./socket.constant.js";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });
  io.use(authenticateSocket); //runs for every incoming socket

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`user ${socket.user.id} connected to: socket ${socket.id}`);
    registerChatHandler(io, socket);
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
