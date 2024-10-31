import { RectangleStoreTypeLine, RectangleDrawType } from "../App";
export function calculateAngleFromVertical(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  // Calculate differences in coordinates
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Calculate angle in radians from horizontal (Math.atan2 default)
  const angleFromHorizontal = Math.atan2(dy, dx);

  // Convert to degrees and subtract 90° to make 0° point upward
  // Add 360 and use modulo to ensure result is between 0 and 360
  const angleFromVertical =
    ((angleFromHorizontal * 180) / Math.PI - 90 + 360) % 360;

  return angleFromVertical;
}

export function calculateRectangleDrawType(
  rectangles: RectangleStoreTypeLine
): RectangleDrawType[] {
  if (rectangles.length === 1) return [];
  return rectangles.map((rect, index) => {
    // If this is the last point, use the first point as the next point
    const nextRect =
      index === rectangles.length - 1
        ? rectangles[index - 1]
        : rectangles[index + 1];

    const angleInDegrees = calculateAngleFromVertical(
      { x: rect.x, y: rect.y },
      { x: nextRect.x, y: nextRect.y }
    );

    return {
      ...rect,
      angleInDegrees,
    };
  });
}
