import { z } from "zod";

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

export type MettagridMessage = z.infer<typeof messageSchema>;

type MettagridCommand = {
  type: "step";
};

export class MettagridSocket {
  socket: WebSocket;
  private onError: (error: string) => void;
  private onMessage: (message: MettagridMessage) => void;

  constructor(params: {
    args: string;
    env: string;
    onError: (error: string) => void;
    onMessage: (message: MettagridMessage) => void;
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

  sendCommand(command: MettagridCommand) {
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
