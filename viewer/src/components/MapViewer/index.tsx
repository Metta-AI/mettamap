"use client";
import {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { MettaGrid } from "@/lib/MettaGrid";

import { usePanZoom } from "../../hooks/use-pan-and-zoom";
import { drawGrid } from "./drawMap";
import {
  loadSprites,
  Sprites,
} from "./sprites";

type Props = {
  grid: MettaGrid;
};

export const MapViewer: FC<Props> = ({ grid }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { transform, setContainer, panZoomHandlers, setZoom, setPan, zoom } =
    usePanZoom({
      minZoom: 1,
      maxZoom: 10,
      zoomSensitivity: 0.007,
    });
  const [sprites, setSprites] = useState<Sprites | null>(null);

  const [cellSize, setCellSize] = useState(0);

  const measureCellSize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Calculate new cell size
    const widthBasedSize = Math.floor(containerWidth / grid.width);
    const heightBasedSize = Math.floor(containerHeight / grid.height);

    // large minimal cell size is useful for zoom, but not very effective, could be optimized
    // (e.g. with Factorio-style discrete zoom and pre-rendered sprites for each size)
    const cellSize = Math.max(24, Math.min(widthBasedSize, heightBasedSize));
    setCellSize(cellSize);

    // Set canvas dimensions
    canvasRef.current.width = grid.width * cellSize;
    canvasRef.current.height = grid.height * cellSize;
  }, [grid]);

  useEffect(() => {
    measureCellSize();
  }, [measureCellSize, containerRef.current, canvasRef.current]);

  const draw = useCallback(() => {
    if (!sprites || !canvasRef.current || !cellSize) return;

    console.log("cellSize", cellSize);

    drawGrid({
      grid,
      canvas: canvasRef.current,
      sprites,
      cellSize,
    });
  }, [sprites, grid, cellSize]);

  // Handle window resize
  useEffect(() => {
    // TODO - avoid rendering? (doesn't work yet)
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  // TODO - avoid rendering if not visible
  useEffect(draw, [draw]);

  useEffect(() => {
    loadSprites().then(setSprites);
  }, []);

  // Benchmark: uncomment to redraw 60 frames per second when the canvas is visible on screen
  // useStressTest(draw, canvasRef.current);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current) return;

      // 1. Grab the bounding box AFTER CSS transforms:
      const rect = canvasRef.current.getBoundingClientRect();
      // 2. Compute screen‑relative coords inside that box
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      // 3. Un‑scale to get your logical canvas coords:
      const canvasX = sx / zoom;
      const canvasY = sy / zoom;

      console.log("Canvas coordinates:", canvasX, canvasY);
    },
    [zoom]
  );

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        setContainer(el);
      }}
      {...panZoomHandlers}
      onDoubleClick={() => {
        // Reset on double click
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }}
      onClick={onClick}
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
