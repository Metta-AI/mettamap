import { FC } from "react";

import { MettaObject } from "@/lib/MettaGrid";

export const ObjectDetails: FC<{ object: MettaObject }> = ({ object }) => {
  return (
    <pre className="text-xs">{JSON.stringify(object.rawData, null, 2)}</pre>
  );
};
