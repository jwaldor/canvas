import { socket } from "./socket";

export const createLine = () => {
  console.log("createLine");
  socket.emit("createLine");
};

export const addPoint = ({ x, y }: { x: number; y: number }) => {
  socket.emit("updateLine", {
    x,
    y,
  });
};
