import {
  FC,
  Fragment,
} from "react";

import { MettaObject } from "@/lib/MettaGrid";

export const ObjectDetails: FC<{ object: MettaObject }> = ({ object }) => {
  return (
    <div className="grid w-fit grid-cols-2 gap-x-4 font-mono text-xs">
      <span className="font-bold text-gray-500">ID:</span>
      <span>{object.id}</span>

      <span className="font-bold text-gray-500">Type:</span>
      <span>{object.type}</span>

      <span className="font-bold text-gray-500">Position:</span>
      <span>
        ({object.r}, {object.c})
      </span>

      {Object.entries(object.other).map(([k, v]) => {
        let value = String(v);
        if (k === "agent:orientation") {
          // orientation: 0 = Up, 1 = Down, 2 = Left, 3 = Right
          value = value + " (" + ["N", "S", "W", "E"][Number(v)] + ")";
        }
        return (
          <Fragment key={k}>
            <span className="font-bold text-gray-500">{k}:</span>
            <span>{value}</span>
          </Fragment>
        );
      })}
    </div>
  );
};
