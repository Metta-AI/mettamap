import {
  FC,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";

import { Button } from "../Button";
import { MapViewer } from "../MapViewer";
import { MessagesViewer } from "./MessagesViewer";
import { objectsToMap } from "./objectsToMap";
import {
  MettagridMessage,
  MettagridSocket,
} from "./socket";

type PlayerState = {
  messages: MettagridMessage[];
  map?: string;
  step: number;
};

type PlayerAction = {
  type: "add_message";
  message: MettagridMessage;
};

const MAX_MESSAGES = 20; // would run out of memory in long sessions otherwise

const playerReducer: Reducer<PlayerState, PlayerAction> = (
  state: PlayerState,
  action: PlayerAction
) => {
  switch (action.type) {
    case "add_message":
      switch (action.message.type) {
        case "initial_state":
          return {
            ...state,
            messages: [...state.messages, action.message].slice(-MAX_MESSAGES),
            map: objectsToMap(action.message.objects),
          };
        case "step_results":
          return {
            ...state,
            messages: [...state.messages, action.message].slice(-MAX_MESSAGES),
            map: objectsToMap(action.message.objects),
            step: state.step + 1,
          };
        default:
          return state;
      }
  }
};

function usePlayerReducer(initialState: PlayerState) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  return [state, dispatch] as const;
}

export const MettaPlayerSession: FC<{ args: string }> = ({ args }) => {
  const [socket, setSocket] = useState<MettagridSocket | null>(null);

  const [state, dispatch] = usePlayerReducer({
    messages: [],
    map: "",
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
  }, [dispatch]);

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <div className="min-h-0">
          {state.map && <MapViewer data={state.map} />}
        </div>
        <div className="flex flex-col gap-4">
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
          <div className="overflow-y-auto">
            <MessagesViewer messages={state.messages} />
          </div>
        </div>
      </div>
    </div>
  );
};
