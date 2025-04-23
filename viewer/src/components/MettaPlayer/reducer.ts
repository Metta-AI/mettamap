import {
  Reducer,
  useReducer,
} from "react";

import { MettaGrid } from "@/lib/MettaGrid";

import { MettagridMessage } from "./socket";

export type MessageData = {
  id: number;
  timestamp: Date;
  message: MettagridMessage;
};

type PlayerState = {
  messages: MessageData[];
  map?: MettaGrid;
  step: number;
};

type PlayerAction = {
  type: "add_message";
  message: MettagridMessage;
};

const MAX_MESSAGES = 10; // would run out of memory in long sessions otherwise

const playerReducer: Reducer<PlayerState, PlayerAction> = (
  state: PlayerState,
  action: PlayerAction
) => {
  switch (action.type) {
    case "add_message": {
      const messages = [
        ...state.messages,
        {
          id: (state.messages.at(-1)?.id ?? 0) + 1,
          timestamp: new Date(),
          message: action.message,
        },
      ].slice(-MAX_MESSAGES);

      switch (action.message.type) {
        case "initial_state":
          return {
            ...state,
            messages,
            map: MettaGrid.fromWebsocketObjects(action.message.objects),
          };
        case "step_results":
          return {
            ...state,
            messages,
            map: MettaGrid.fromWebsocketObjects(action.message.objects),
            step: state.step + 1,
          };
        case "message":
          return {
            ...state,
            messages,
          };
        default:
          return state;
      }
    }
  }
};

export type PlayerDispatch = ReturnType<typeof usePlayerReducer>[1];

export function usePlayerReducer(initialState: PlayerState) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  return [state, dispatch] as const;
}
