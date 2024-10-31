import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { RectangleStoreType } from "./ZodSchema";

const app = express();
const PORT = process.env.PORT || 3000;

const rooms: Record<string, RectangleStoreType> = {};

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

// Add Socket.IO connection handler (add this before your routes)
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
  socket.on("updateCanvas", (data) => {
    console.log("updateCanvas", data);
    io.to(socket.rooms[socket.id]).emit("updateCanvas", data);
  });
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });
});

// Define a simple route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
