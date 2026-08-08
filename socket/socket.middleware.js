import AppError from "../errors/AppError.js";
import { verifyAccessToken } from "../auth/auth.service.js";

export const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake?.auth.token;
    if (!token) return next(new AppError("Token missing", 401));

    const decoded = verifyAccessToken(token);

    socket.user = { id: decoded.sub, role: decoded.role };

    next();
  } catch (err) {
    next(new AppError("Authentication failed", 401));
  }
};
