import { Sprites } from "./sprites";

const asciiToObjectType = {
  "#": "wall",
  A: "agent",
  C: "converter",
  g: "mine",
  c: "generator",
  a: "altar",
  r: "armory",
  l: "lasery",
  b: "lab",
  f: "factory",
  t: "temple",
  v: "converter",
} as const;

export type ObjectType =
  (typeof asciiToObjectType)[keyof typeof asciiToObjectType];

export type ItemObjectType = Exclude<ObjectType, "wall" | "agent">;

function isValidAscii(c: string): c is keyof typeof asciiToObjectType {
  return c in asciiToObjectType;
}

export async function drawMap({
  data,
  canvas,
  containerWidth,
  containerHeight,
  sprites,
}: {
  data: string;
  canvas: HTMLCanvasElement;
  containerWidth: number;
  containerHeight: number;
  sprites: Sprites;
}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Parse the data
  const lines = data.trim().split("\n");
  const width = Math.max(...lines.map((line) => line.length));
  const height = lines.length;

  // Calculate new cell size
  const widthBasedSize = Math.floor(containerWidth / width);
  const heightBasedSize = Math.floor(containerHeight / height);

  const cellSize = Math.max(24, Math.min(widthBasedSize, heightBasedSize));

  // Set canvas dimensions
  canvas.width = width * cellSize;
  canvas.height = height * cellSize;

  // Clear canvas
  ctx.fillStyle = "rgb(6, 24, 24)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  // Draw the map
  ctx.fillStyle = "black";
  lines.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      const char = line[x];
      if (isValidAscii(char)) {
        const objectType = asciiToObjectType[char];
        sprites.draw(objectType, ctx, x * cellSize, y * cellSize, cellSize);
      }
      // else: show error?
    }
  });
}
