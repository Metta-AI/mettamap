"use client";
import {
  useEffect,
  useRef,
  useState,
} from 'react';

export const MapViewer = ({ data }: { data: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(10);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Parse the data
    const lines = data.trim().split("\n");
    const width = Math.max(...lines.map((line) => line.length));
    const height = lines.length;

    // Calculate appropriate cell size based on container dimensions
    const calculateCellSize = () => {
      if (!containerRef.current) return 10;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      // Calculate cell size based on both dimensions
      const widthBasedSize = Math.floor(containerWidth / width);
      const heightBasedSize = Math.floor(containerHeight / height);

      // Use the smaller of the two to ensure the map fits in both dimensions
      const newCellSize = Math.min(widthBasedSize, heightBasedSize);

      // Set a minimum cell size to ensure readability
      return Math.max(10, newCellSize);
    };

    // Set initial cell size
    const initialCellSize = calculateCellSize();
    setCellSize(initialCellSize);

    // Set canvas dimensions
    canvas.width = width * initialCellSize;
    canvas.height = height * initialCellSize;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the map
    ctx.fillStyle = "black";
    lines.forEach((line, y) => {
      for (let x = 0; x < line.length; x++) {
        if (line[x] === "#") {
          ctx.fillRect(
            x * initialCellSize,
            y * initialCellSize,
            initialCellSize,
            initialCellSize
          );
        }
        // draw characters for non-blank cells
        else if (line[x] !== " ") {
          ctx.fillStyle = "red";
          ctx.font = `${Math.max(8, initialCellSize * 0.8)}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            line[x],
            x * initialCellSize + initialCellSize / 2,
            y * initialCellSize + initialCellSize / 2
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
      ctx.moveTo(x * initialCellSize, 0);
      ctx.lineTo(x * initialCellSize, canvas.height);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * initialCellSize);
      ctx.lineTo(canvas.width, y * initialCellSize);
      ctx.stroke();
    }
  }, [data]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;

      // Re-render the map with the new cell size
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Parse the data
      const lines = data.trim().split("\n");
      const width = Math.max(...lines.map((line) => line.length));
      const height = lines.length;

      // Calculate new cell size
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const widthBasedSize = Math.floor(containerWidth / width);
      const heightBasedSize = Math.floor(containerHeight / height);

      const newCellSize = Math.max(
        5,
        Math.min(widthBasedSize, heightBasedSize)
      );
      setCellSize(newCellSize);

      // Set canvas dimensions
      canvas.width = width * newCellSize;
      canvas.height = height * newCellSize;

      // Clear canvas
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the map
      ctx.fillStyle = "black";
      lines.forEach((line, y) => {
        for (let x = 0; x < line.length; x++) {
          if (line[x] === "#") {
            ctx.fillRect(
              x * newCellSize,
              y * newCellSize,
              newCellSize,
              newCellSize
            );
          }
          // draw characters for non-blank cells
          else if (line[x] !== " ") {
            ctx.fillStyle = "red";
            ctx.font = `${Math.max(8, newCellSize * 0.8)}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              line[x],
              x * newCellSize + newCellSize / 2,
              y * newCellSize + newCellSize / 2
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
        ctx.moveTo(x * newCellSize, 0);
        ctx.lineTo(x * newCellSize, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal grid lines
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * newCellSize);
        ctx.lineTo(canvas.width, y * newCellSize);
        ctx.stroke();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", maxWidth: "100%" }}
      />
    </div>
  );
};
