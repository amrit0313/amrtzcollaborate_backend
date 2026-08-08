import express from "express";
import authRoutes from "./auth/auth.routes.js";
import userRoutes from "./users/user.route.js";
import conversationRoutes from "./conversation/conversation.route.js";
import messageRoutes from "./message/message.route.js";
import aichatRoutes from "./AIchat/aichat.route.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.get("/amrtz", (req, res) => res.json({ message: "Hey! It's Amrit" }));
app.post("/amrtz", (req, res) => {
  let rawdata = "";

  req.on("data", (chunk) => {
    rawdata += chunk;
  });

  req.on("end", () => {
    try {
      console.log(rawdata);
      const body = JSON.parse(rawdata);
      console.log(body);
      res.json({ received: body });
    } catch (err) {
      res.status(400).json({ error: "Invalid JSON" });
    }
  });
  req.on("error", (err) => {
    res.status(400).json({ error: "Request error" });
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use(conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/aichat", aichatRoutes);

// centralized error handler (catches anything thrown outside try/catch, e.g. malformed JSON)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

export default app;
