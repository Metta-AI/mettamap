import {
  Reducer,
  useReducer,
} from "react";

import { MettaGrid } from "@/lib/MettaGrid";

import { MettagridMessage } from "./socket";

export type MessageData = {
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
            messages: [
              ...state.messages,
              { timestamp: new Date(), message: action.message },
            ].slice(-MAX_MESSAGES),
            map: MettaGrid.fromWebsocketObjects(action.message.objects),
          };
        case "step_results":
          return {
            ...state,
            messages: [
              ...state.messages,
              { timestamp: new Date(), message: action.message },
            ].slice(-MAX_MESSAGES),
            map: MettaGrid.fromWebsocketObjects(action.message.objects),
            step: state.step + 1,
          };
        default:
          return state;
      }
  }
};

export function usePlayerReducer(initialState: PlayerState) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  return [state, dispatch] as const;
}
