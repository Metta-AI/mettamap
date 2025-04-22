"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import usePanZoom from "use-pan-and-zoom";

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

type ObjectType = (typeof asciiToObjectType)[keyof typeof asciiToObjectType];

type ItemObjectType = Exclude<ObjectType, "wall" | "agent">;

const objectTypeToItemTile = {
  converter: [0, 0],
  mine: [14, 2],
  generator: [2, 2],
  altar: [12, 2],
  armory: [6, 3],
  lasery: [5, 5],
  lab: [5, 1],
  factory: [13, 0],
  temple: [7, 2],
} satisfies Record<ItemObjectType, [number, number]>;

function isValidAscii(c: string): c is keyof typeof asciiToObjectType {
  return c in asciiToObjectType;
}

class Sprites {
  wall: HTMLImageElement;
  items: HTMLImageElement;
  monsters: HTMLImageElement;

  constructor(
    wall: HTMLImageElement,
    items: HTMLImageElement,
    monsters: HTMLImageElement
  ) {
    this.wall = wall;
    this.items = items;
    this.monsters = monsters;
  }

  draw(
    item: ObjectType,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    switch (item) {
      case "wall":
        ctx.drawImage(this.wall, x, y, size, size);
        break;
      case "agent":
        ctx.drawImage(this.monsters, 0, 0, 16, 16, x, y, size, size);
        break;
      default:
        const [tileX, tileY] = objectTypeToItemTile[item];
        ctx.drawImage(
          this.items,
          tileX * 16,
          tileY * 16,
          16,
          16,
          x,
          y,
          size,
          size
        );
        break;
    }
  }
}

async function loadImages(): Promise<Sprites> {
  const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
      return img;
    });
  };
  const [wall, items, monsters] = await Promise.all([
    loadImage("/assets/wall.png"),
    loadImage("/assets/items.png"),
    loadImage("/assets/monsters.png"),
  ]);
  const sprites = new Sprites(wall, items, monsters);
  return sprites;
}

export const MapViewer = ({ data }: { data: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { transform, setContainer, panZoomHandlers, setZoom, setPan } =
    usePanZoom({
      minZoom: 1,
      maxZoom: 10,
      zoomSensitivity: 0.007,
    });
  const [sprites, setSprites] = useState<Sprites | null>(null);

  const draw = useCallback(() => {
    if (!sprites) return;
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
  }, [sprites, data]);

  // Handle window resize
  useEffect(() => {
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    loadImages().then(setSprites);
  }, []);

  // Benchmark: uncomment to redraw 60 frames per second when the canvas is visible on screen

  /*
     useEffect(() => {
       let interval: NodeJS.Timeout | null = null;

       // Only redraw if the canvas is visible on screen
       const observer = new IntersectionObserver((entries) => {
         const [entry] = entries;
         if (entry.isIntersecting) {
           console.log("visible");
           // Start animation loop when visible
           interval = setInterval(draw, 1000 / 60);
         } else {
           console.log("hidden");
           if (interval) {
             clearInterval(interval);
           }
           interval = null;
         }
       });

       if (canvasRef.current) {
         observer.observe(canvasRef.current);
       }

       return () => {
         if (canvasRef.current) {
           observer.disconnect();
         }
         if (interval) {
           clearInterval(interval);
         }
       };
     }, [draw]);
     */

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        setContainer(el);
      }}
      {...panZoomHandlers}
      onDoubleClick={() => {
        // Due to the bug in use-pan-and-zoom, we can't do an even number of
        // updates - its useForceUpdate implementation uses a boolean for state,
        // that flips twice and so doesn't re-render.
        // (PS: o4-mini-high is very smart, figured it out in 3 minutes)
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setPan({ x: 0, y: 0 });
      }}
      className="h-full w-full cursor-grab bg-gray-100"
    >
      <canvas
        ref={canvasRef}
        style={{ transform }}
        className="mx-auto max-h-full max-w-full border border-gray-300"
      />
    </div>
  );
};
