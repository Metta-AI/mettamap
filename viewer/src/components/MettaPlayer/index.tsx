"use client";

import {
  FC,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { z } from 'zod';

import { Button } from '../Button';
import { MapViewer } from '../MapViewer';
import { objectsToMap } from './objectsToMap';

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("message"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("initial_state"),
    info: z.unknown(),
    objects: z.unknown(),
  }),
  z.object({
    type: z.literal("step_results"),
    info: z.unknown(),
    objects: z.unknown(),
  }),
]);

type Message = z.infer<typeof messageSchema>;

type Command = {
  type: "step";
};

class MettaSocket {
  socket: WebSocket;
  private onError: (error: string) => void;
  private onMessage: (message: Message) => void;

  constructor(params: {
    args: string;
    env: string;
    onError: (error: string) => void;
    onMessage: (message: Message) => void;
  }) {
    this.onError = params.onError;
    this.onMessage = params.onMessage;

    const endpoint = `ws://localhost:8000/ws`;
    const queryParams = new URLSearchParams({
      args: params.args,
      env: params.env,
    });
    const socket = new WebSocket(`${endpoint}?${queryParams.toString()}`);
    socket.onmessage = function (event) {
      const data = messageSchema.parse(JSON.parse(event.data));
      if (data.type === "error") {
        params.onError(data.message);
      } else {
        params.onMessage(data);
      }
    };
    socket.onopen = function () {
      params.onMessage({
        type: "message",
        message: "[local] Connected to WebSocket",
      });
    };
    socket.onclose = function () {
      params.onMessage({
        type: "message",
        message: "[local] Disconnected from WebSocket",
      });
    };

    this.socket = socket;
  }

  sendCommand(command: Command) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      this.onError("[local] Not connected to WebSocket");
    }
    this.socket.send(JSON.stringify(command));
  }

  close() {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }
}

type PlayerState = {
  messages: Message[];
  map?: string;
  step: number;
};

type PlayerAction = {
  type: "add_message";
  message: Message;
};

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
            messages: [...state.messages, action.message].slice(-20),
            map: objectsToMap(action.message.objects),
          };
        case "step_results":
          return {
            ...state,
            messages: [...state.messages, action.message].slice(-20),
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

const MessagesViewer: FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <div>
      {messages.map((message, i) => (
        <p key={i} className="text-xs font-mono">
          {message.type}
        </p>
      ))}
    </div>
  );
};

export const MettaPlayer: FC = () => {
  const [socket, setSocket] = useState<MettaSocket | null>(null);

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
      return new MettaSocket({
        args: "+user=berekuk",
        env: "simple",
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
      // helps with React strict mode
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
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex flex-row gap-4">
        {socket?.socket.readyState === WebSocket.OPEN ? (
          <>
            <form
              action={() => {
                socket?.sendCommand({ type: "step" });
              }}
            >
              <Button type="submit">Step</Button>
            </form>
            <div>Step: {state.step}</div>
          </>
        ) : (
          <div>Connecting...</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="min-h-0">
          {state.map && <MapViewer data={state.map} />}
        </div>
        <div className="overflow-y-auto">
          <MessagesViewer messages={state.messages} />
        </div>
      </div>
    </div>
  );
};
