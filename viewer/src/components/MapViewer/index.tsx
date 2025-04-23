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
  onCellHover?: (cell: { x: number; y: number } | null) => void;
};

const Overlay: FC<{
  cellSize: number;
  selectedCell: {
    x: number;
    y: number;
  } | null;
}> = ({ cellSize, selectedCell }) => {
  if (!selectedCell) return null;
  return (
    <div
      className="pointer-events-none absolute border border-red-500"
      style={{
        left: selectedCell?.x * cellSize,
        top: selectedCell?.y * cellSize,
        width: cellSize + 2,
        height: cellSize + 2,
      }}
    ></div>
  );
};

export const MapViewer: FC<Props> = ({ grid, onCellHover }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { transform, setContainer, panZoomHandlers, setZoom, setPan, zoom } =
    usePanZoom({
      minZoom: 1,
      maxZoom: 10,
      zoomSensitivity: 0.007,
    });
  const [sprites, setSprites] = useState<Sprites | null>(null);

  // Cell size used for drawing the grid.
  // This is in internal canvas pixels, not pixels on the screen. (canvas.width, not clientWidth)
  const [cellSize, setCellSize] = useState(0);

  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const measureCellSize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Calculate new cell size
    const widthBasedSize = Math.floor(containerWidth / grid.width);
    const heightBasedSize = Math.floor(containerHeight / grid.height);

    // Large minimal cell size is useful for zoom, but not very effective, could be optimized.
    // This results in 3k * 3k canvas for 120x120 grid.
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

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      // 1. Grab the bounding box AFTER CSS transforms:
      const rect = canvasRef.current.getBoundingClientRect();

      // 2. Compute screen‑relative coords inside that box
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      // // 3. Un‑scale to get your logical canvas coords:
      // const canvasX = sx / zoom;
      // const canvasY = sy / zoom;

      const x = sx * (grid.width / rect.width);
      const y = sy * (grid.height / rect.height);

      setSelectedCell({
        x: Math.floor(x),
        y: Math.floor(y),
      });
      onCellHover?.({ x: Math.floor(x), y: Math.floor(y) });
    },
    [zoom, cellSize, grid]
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
      className="h-full w-full cursor-grab bg-gray-100"
    >
      <div
        className="position-relative mx-auto max-h-full max-w-full"
        style={{ transform }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={onMouseMove}
          onMouseLeave={() => {
            setSelectedCell(null);
            onCellHover?.(null);
          }}
          className="max-h-full max-w-full border border-gray-300"
        />
        <div className="pointer-events-none absolute inset-0 z-10">
          {canvasRef.current && selectedCell && (
            <Overlay
              cellSize={canvasRef.current?.clientWidth / grid.width}
              selectedCell={selectedCell}
            />
          )}
        </div>
      </div>
    </div>
  );
};
