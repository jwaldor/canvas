import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
export const joinRoom = (roomId: string) => {
  socket.emit("joinRoom", roomId);
};

socket.on("updateCanvas", (data) => {
  console.log("updateCanvas", data);
});
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});
