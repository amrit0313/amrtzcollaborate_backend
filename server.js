import http from "http";
import app from "./app.js";
import connectDB from "./database/db.js";
import { initializeSocket } from "./socket/index.js";

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    server.listen(3001, () => console.log("server is running"));
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });
