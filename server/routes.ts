import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { RectangleStoreType } from "./ZodSchema";
import { getLastLine, getLines, setLine } from "./redis";
import { updateLine } from "./updateCanvas";
// queue.ts
import PQueue from "p-queue";

// Initialize the queue with concurrency 1 for sequential processing
export const queue = new PQueue({ concurrency: 1 });

const app = express();
const PORT: number = parseInt(process.env.PORT || "3000");

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
  socket.emit("connect ");
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
  socket.on("updateLine", async (data) => {
    await queue.add(async () => {
      console.log("rooms socket.id", socket.rooms);
      const [lastLine, maxLineId] = await getLastLine(
        Array.from(socket.rooms)[0],
        socket.id
      );
      const newLine = updateLine(lastLine, data.x, data.y);
      setLine(
        Array.from(socket.rooms)[0],
        socket.id,
        String(maxLineId),
        newLine
      );
      const lines = await getLines(Array.from(socket.rooms)[0], socket.id);
      io.to(Array.from(socket.rooms)[0]).emit("updateCanvas", lines);
    });
  });
  socket.on("joinRoom", async (roomId) => {
    console.log("joinRoom", roomId);
    socket.rooms.clear();
    socket.join(roomId);
    const lines = await getLines(Array.from(socket.rooms)[0], socket.id);
    io.to(Array.from(socket.rooms)[0]).emit("updateCanvas", lines);
  });
  socket.on("createLine", async () => {
    await queue.add(async () => {
      const lines = await getLines(Array.from(socket.rooms)[0], socket.id);
      const lineCount = lines.length;

      const newLineId = lineCount + 1;
      setLine(Array.from(socket.rooms)[0], socket.id, newLineId.toString(), []);
      io.to(Array.from(socket.rooms)[0]).emit("updateCanvas", lines);
    });
  });
});
//io.to(socket.rooms[socket.id]).emit("updateCanvas", data);
io.listen(4000);
// Define a simple route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
