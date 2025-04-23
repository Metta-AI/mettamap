import {
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";

import clsx from "clsx";

import { Button } from "../Button";
import {
  Cell,
  MapViewer,
} from "../MapViewer";
import { ObjectDetailsFromCell } from "../ObjectDetailsFromCell";
import { MessagesViewer } from "./MessagesViewer";
import { usePlayerReducer } from "./reducer";
import { MettagridSocket } from "./socket";

export const MettaPlayerSession: FC<{ args: string }> = ({ args }) => {
  const [socket, setSocket] = useState<MettagridSocket | null>(null);

  const [state, dispatch] = usePlayerReducer({
    messages: [],
    step: 0,
  });

  const connect = useCallback(() => {
    setSocket((socket) => {
      if (socket) {
        socket.close();
      }
      return new MettagridSocket({
        args,
        onError: (error) => {
          dispatch({
            type: "add_message",
            message: { type: "error", message: "[ERROR] " + error },
          });
        },
        onMessage: (message) => {
          dispatch({ type: "add_message", message });
        },
      });
    });
  }, [dispatch, args]);

  useEffect(() => {
    if (socket) {
      // helps with React strict mode in dev
      return;
    }
    connect();
  }, [connect, socket]);

  // // benchmark: run as fast as possible for 1000 steps
  // useEffect(() => {
  //   if (state.map && socket && state.step < 1000) {
  //     socket.sendCommand({ type: "step" });
  //   }
  // }, [socket, state.step]);

  const [hoveredCell, setHoveredCell] = useState<Cell | undefined>();
  const [selectedCell, setSelectedCell] = useState<Cell | undefined>();

  if (!socket) {
    return null;
  }

  return (
    <div className="grid h-full min-h-0 flex-1 grid-cols-2 gap-4">
      <div className="min-h-0 overflow-auto">
        {state.map && (
          <MapViewer
            grid={state.map}
            onCellHover={setHoveredCell}
            selectedCell={selectedCell}
            onCellSelect={setSelectedCell}
          />
        )}
      </div>
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          {socket.status === "OPEN" ? (
            <div className="flex items-center gap-4">
              <form
                action={() => {
                  socket?.sendCommand({ type: "step" });
                }}
              >
                <Button type="submit">Step</Button>
              </form>
              <div>
                <span className="text-gray-500">#</span>
                <span className="font-medium">{state.step}</span>
              </div>
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-gray-400">
              {socket.status}
            </div>
            <div
              className={clsx(
                "h-3 w-3 rounded-full",
                socket.status === "OPEN"
                  ? "bg-green-500"
                  : socket.status === "CLOSED"
                    ? "bg-red-500"
                    : "bg-amber-400" // For CONNECTING or CLOSING
              )}
            />
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto border-b border-gray-200">
          {state.map && (
            <ObjectDetailsFromCell
              cell={selectedCell}
              grid={state.map}
              title="Selected"
            />
          )}
          {state.map && (
            <ObjectDetailsFromCell
              cell={hoveredCell}
              grid={state.map}
              title="Hovered"
            />
          )}
        </div>
        <div className="flex-1 shrink overflow-y-auto">
          <MessagesViewer messages={state.messages} />
        </div>
      </div>
    </div>
  );
};
