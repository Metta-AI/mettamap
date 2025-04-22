"use client";
import {
  FC,
  PropsWithChildren,
  useState,
} from "react";

import { Button } from "../Button";
import { TextInput } from "../TextInput";
import { MettaPlayerSession } from "./MettaPlayerSession";

const TopPanel: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid h-16 items-center border-b border-gray-200 bg-gray-100 px-8 py-2">
      {children}
    </div>
  );
};

export const MettaPlayer: FC = () => {
  const [runningState, setRunningState] = useState<
    | {
        mode: "idle";
      }
    | {
        mode: "running";
        args: string;
      }
  >({ mode: "idle" });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopPanel>
        {runningState.mode === "idle" && (
          <form
            action={(formData) => {
              setRunningState({
                mode: "running",
                args: formData.get("args") as string,
              });
            }}
          >
            <div className="flex items-center gap-2">
              <TextInput name="args" placeholder="Hydra args" />
              <Button type="submit">Start</Button>
            </div>
          </form>
        )}
        {runningState.mode === "running" && (
          <div className="flex items-center gap-2">
            <div>
              <span className="text-gray-500">Running with args:</span>{" "}
              <span className="font-medium">{runningState.args}</span>
            </div>
            <Button onClick={() => setRunningState({ mode: "idle" })}>
              Stop
            </Button>
          </div>
        )}
      </TopPanel>
      {runningState.mode === "running" && (
        <div className="flex h-full min-h-0 p-4">
          <MettaPlayerSession args={runningState.args} />
        </div>
      )}
    </div>
  );
};
