import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import prisma from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("A user connected to sockets");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to connect to the database");
    console.error(error);
    process.exit(1);
  }
}
main();
