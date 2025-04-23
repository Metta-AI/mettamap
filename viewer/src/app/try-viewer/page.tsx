"use client";
import {
  useMemo,
  useState,
} from "react";

import { MapViewer } from "@/components/MapViewer";
import { MettaGrid } from "@/lib/MettaGrid";

export default function TryViewer() {
  const grid = useMemo(
    () =>
      MettaGrid.fromAscii(`
######################
#                    #
#                    #
#                    #
#                    #
#            A       #
#       A            #
#                    #
#                    #
#                    #
#               a    #
#                    #
#     a              #
#                    #
#                    #
#                    #
#                    #
######################`),
    []
  );

  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-10 w-120 overflow-hidden border-10 border-blue-500">
        <MapViewer grid={grid} onCellHover={setHoveredCell} />
      </div>
      {hoveredCell && (
        <div>
          <div>
            {hoveredCell.x}, {hoveredCell.y}
          </div>
          <div>{grid.object(hoveredCell.x, hoveredCell.y)}</div>
        </div>
      )}
    </div>
  );
}
