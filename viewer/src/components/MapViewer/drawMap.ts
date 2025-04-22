import { MettaMap } from "@/lib/MettaMap";

import { Sprites } from "./sprites";

export async function drawMap({
  map,
  canvas,
  containerWidth,
  containerHeight,
  sprites,
}: {
  map: MettaMap;
  canvas: HTMLCanvasElement;
  containerWidth: number;
  containerHeight: number;
  sprites: Sprites;
}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Calculate new cell size
  const widthBasedSize = Math.floor(containerWidth / map.width);
  const heightBasedSize = Math.floor(containerHeight / map.height);

  const cellSize = Math.max(24, Math.min(widthBasedSize, heightBasedSize));

  // Set canvas dimensions
  canvas.width = map.width * cellSize;
  canvas.height = map.height * cellSize;

  // Clear canvas
  ctx.fillStyle = "rgb(6, 24, 24)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 0.5;

  // Draw vertical grid lines
  for (let x = 0; x <= map.width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = 0; y <= map.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(canvas.width, y * cellSize);
    ctx.stroke();
  }

  // Draw the map
  ctx.fillStyle = "black";
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const objectType = map.object(x, y);
      if (objectType === "empty") continue;
      sprites.draw(objectType, ctx, x * cellSize, y * cellSize, cellSize);
    }
  }
}
