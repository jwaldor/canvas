import { useRef, useEffect, useState } from 'react';
import { z } from 'zod';
import { postSchema } from '../ZodSchema';
import { calculateRectangleDrawType } from './services/canvasEngine';
import { socket } from './services/socket';
import { addPoint, createLine } from './services/updateEngine';
import { useParams } from 'react-router-dom';
const LINE_HEIGHT = 28;
export type RectangleDrawType = { x: number, y: number, angleInDegrees: number, color: string, width: number }
export type RectangleStoreType = Extract<z.infer<typeof postSchema>['artform'], { type: 'Canvas' }>['parameters']['users'][number]['lines']
export type RectangleStoreTypeLine = RectangleStoreType[number]


export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rectangles, setRectangles] = useState<RectangleStoreTypeLine[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const { roomId } = useParams();
    console.log("roomId", roomId);
    useEffect(() => {
        console.log("joinRoom", roomId);
        socket.emit("joinRoom", roomId);
    }, [roomId]);
    // Add mouse event handlers
    useEffect(() => {
        socket.on("updateCanvas", (lines: RectangleStoreTypeLine[]) => {
            console.log("updateCanvas", lines);
            setRectangles(lines);
        });
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Set canvas size to fill the entire screen

        const handleMouseDown = () => {
            setIsDrawing(true);
            createLine();
        };
        const handleMouseUp = () => setIsDrawing(false);
        const handleMouseMove = (event: MouseEvent) => {
            if (!isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            addPoint({ x, y });

        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [isDrawing]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        else {
            // Function to draw a rotated rectangle
            function drawRotatedRectangle(rectangle: RectangleDrawType) {
                // Convert degrees to radians
                const angleInRadians = rectangle.angleInDegrees * (Math.PI / 180);

                // Save the current canvas state
                ctx.save();

                // Translate to the center of the rectangle
                ctx.translate(rectangle.x, rectangle.y);

                // Rotate the canvas
                ctx.rotate(angleInRadians);

                // Draw the rectangle
                ctx.fillStyle = rectangle.color;
                ctx.fillRect(-rectangle.width / 2, -LINE_HEIGHT / 2, rectangle.width, LINE_HEIGHT);

                // Restore the canvas state
                ctx.restore();
            }
            // Clear the canvas before drawing
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            rectangles.forEach(line => {
                const drawRectangles = calculateRectangleDrawType(line);
                drawRectangles.forEach(drawRotatedRectangle);
            });
        }
        // Draw multiple rectangles with different positions and rotations
        // drawRotatedRectangle({ x: 100, y: 100, angleInDegrees: 20, color: 'blue', width: 10 });
        // drawRotatedRectangle({ x: 200, y: 200, angleInDegrees: 45, color: 'red', width: 10 });
        // drawRotatedRectangle({ x: 300, y: 150, angleInDegrees: 60, color: 'green', width: 10 });
        // drawRotatedRectangle({ x: 250, y: 300, angleInDegrees: 15, color: 'purple', width: 10 });
    }, [rectangles]);
    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
    }, []);

    return <canvas ref={canvasRef} ></canvas>;
}

