import { MettaGrid } from "@/lib/MettaGrid";

import { Sprites } from "./sprites";

export async function drawGrid({
  grid,
  canvas,
  sprites,
  cellSize,
  // selectedCell,
}: {
  grid: MettaGrid;
  canvas: HTMLCanvasElement;
  sprites: Sprites;
  cellSize: number;
  // selectedCell: { x: number; y: number } | null;
}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = "rgb(6, 24, 24)";
  ctx.fillRect(0, 0, cellSize * grid.width, cellSize * grid.height);

  // Draw grid lines
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 0.5;

  // Draw vertical grid lines
  for (let x = 0; x <= grid.width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = 0; y <= grid.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(canvas.width, y * cellSize);
    ctx.stroke();
  }

  // Draw the map
  ctx.fillStyle = "black";
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const objectType = grid.object(x, y);
      if (objectType === "empty") continue;
      sprites.draw(objectType, ctx, x * cellSize, y * cellSize, cellSize);
    }
  }

  // if (selectedCell) {
  //   ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  //   ctx.fillRect(
  //     selectedCell.x * cellSize,
  //     selectedCell.y * cellSize,
  //     cellSize,
  //     cellSize
  //   );
  // }
}
