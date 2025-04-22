"use client";
import { MapViewer } from "@/components/MapViewer";
import { MettaGrid } from "@/lib/MettaGrid";

export default function TryViewer() {
  const grid = MettaGrid.fromAscii(`
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
######################`);
  return (
    <div className="mx-auto mt-10 w-120 overflow-hidden border-10 border-blue-500">
      <MapViewer grid={grid} />
    </div>
  );
}
