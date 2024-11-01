import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
export const joinRoom = () => {
  socket.emit("joinRoom");
};

joinRoom();
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
