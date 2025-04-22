"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePanZoom } from "../../hooks/use-pan-and-zoom";
import { drawMap } from "./drawMap";
import {
  loadSprites,
  Sprites,
} from "./sprites";

export const MapViewer = ({ data }: { data: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { transform, setContainer, panZoomHandlers, setZoom, setPan, pan } =
    usePanZoom({
      minZoom: 1,
      maxZoom: 10,
      zoomSensitivity: 0.007,
    });
  const [sprites, setSprites] = useState<Sprites | null>(null);

  const draw = useCallback(() => {
    if (!sprites) return;
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    drawMap({
      data,
      canvas: canvasRef.current,
      containerWidth,
      containerHeight,
      sprites,
    });
  }, [sprites, data]);

  // Handle window resize
  useEffect(() => {
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  useEffect(() => {
    // TODO - avoid rendering if not visible
    draw();
  }, [draw]);

  useEffect(() => {
    loadSprites().then(setSprites);
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

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current) return;
      const x = e.pageX - canvasRef.current.offsetLeft - pan.x;
      const y = e.pageY - canvasRef.current.offsetTop - pan.y;
      console.log(x, y);
    },
    [pan]
  );

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        setContainer(el);
      }}
      {...panZoomHandlers}
      onDoubleClick={() => {
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
