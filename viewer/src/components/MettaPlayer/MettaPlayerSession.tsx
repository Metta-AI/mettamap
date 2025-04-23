import {
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Button } from "../Button";
import { MapViewer } from "../MapViewer";
import { MessagesViewer } from "./MessagesViewer";
import { ObjectDetails } from "./ObjectDetails";
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

  // // benchmark: run as fast as possible
  // useEffect(() => {
  //   if (state.map && socket) {
  //     socket.sendCommand({ type: "step" });
  //   }
  // }, [socket, state.step]);

  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const hoveredObject = hoveredCell
    ? state.map?.object(hoveredCell.x, hoveredCell.y)
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <div className="min-h-0 overflow-auto">
          {state.map && (
            <MapViewer grid={state.map} onCellHover={setHoveredCell} />
          )}
        </div>
        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex flex-row items-center gap-4">
            {socket?.socket.readyState === WebSocket.OPEN ? (
              <>
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
              </>
            ) : (
              <div>Connecting...</div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto border-b border-gray-200">
            {hoveredObject && <ObjectDetails object={hoveredObject} />}
          </div>
          <div className="flex-1 shrink overflow-y-auto">
            <MessagesViewer messages={state.messages} />
          </div>
        </div>
      </div>
    </div>
  );
};
