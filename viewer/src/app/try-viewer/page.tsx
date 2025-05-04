"use client";
import {
  useMemo,
  useState,
} from "react";

import { MapViewer } from "@/components/MapViewer";
import { MettaGrid } from "@/lib/MettaGrid";

import { ObjectDetailsFromCell } from "../../components/ObjectDetailsFromCell";

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

  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  }>();

  const [hoveredCell, setHoveredCell] = useState<
    | {
        x: number;
        y: number;
      }
    | undefined
  >();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-10 w-120 overflow-hidden border-10 border-blue-500">
        <MapViewer
          grid={grid}
          onCellHover={setHoveredCell}
          onCellSelect={setSelectedCell}
          selectedCell={selectedCell}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-16">
        <ObjectDetailsFromCell cell={hoveredCell} grid={grid} title="Hovered" />
        <ObjectDetailsFromCell
          cell={selectedCell}
          grid={grid}
          title="Selected"
        />
      </div>
      <div className="mt-10 h-30 w-60 border">
        <MapViewer grid={grid} />
      </div>
      <div className="mt-10 h-60 w-30 border">
        <MapViewer grid={grid} />
      </div>
    </div>
  );
}
