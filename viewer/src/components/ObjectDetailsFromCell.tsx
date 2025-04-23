"use client";
import { FC } from "react";

import { ObjectDetails } from "@/components/ObjectDetails";
import { MettaGrid } from "@/lib/MettaGrid";

export const ObjectDetailsFromCell: FC<{
  cell: { x: number; y: number } | undefined;
  grid: MettaGrid;
  title: string;
}> = ({ cell, grid, title }) => {
  if (!cell) return <div></div>;
  const object = grid.object(cell.x, cell.y);
  if (!object) return <div></div>;
  return (
    <div>
      <header className="text-sm font-bold">{title}</header>
      <ObjectDetails object={object} />
    </div>
  );
};
