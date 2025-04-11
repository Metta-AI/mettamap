"use client";
import {
  useEffect,
  useRef,
} from 'react';

export const MapViewer = ({ data }: { data: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Parse the data
    const lines = data.trim().split("\n");
    const width = Math.max(...lines.map((line) => line.length));
    const height = lines.length;

    // Set canvas dimensions
    const cellSize = 10; // 10px per cell
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the map
    ctx.fillStyle = "black";
    lines.forEach((line, y) => {
      for (let x = 0; x < line.length; x++) {
        if (line[x] === "#") {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
        // draw characters for non-blank cells
        else if (line[x] !== " ") {
          ctx.fillStyle = "red";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            line[x],
            x * cellSize + cellSize / 2,
            y * cellSize + cellSize / 2
          );
          ctx.fillStyle = "black";
        }
      }
    });

    // Draw grid lines
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;

    // Draw vertical grid lines
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, canvas.height);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(canvas.width, y * cellSize);
      ctx.stroke();
    }
  }, [data]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
    </div>
  );
};
