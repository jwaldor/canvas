import { RectangleStoreType } from "./ZodSchema";

export const updateLine = (
  lastLine: RectangleStoreType[number],
  x: number,
  y: number
) => {
  if (lastLine.length === 0) {
    lastLine.push({
      x,
      y,
      color: "blue",
      width: 10,
    });
    return lastLine;
  }

  const lastPoint = lastLine[lastLine.length - 1];
  const distance = Math.sqrt(
    Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
  );

  // Only add point if distance is greater than 5 pixels
  if (distance > 2) {
    lastLine.push({
      x,
      y,
      color: "blue",
      width: 10,
    });
  }
  return lastLine;
};
