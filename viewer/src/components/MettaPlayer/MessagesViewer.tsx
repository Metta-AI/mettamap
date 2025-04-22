"use client";
import { FC } from "react";

import { MettagridMessage } from "./socket";

export const MessagesViewer: FC<{ messages: MettagridMessage[]; }> = ({ messages }) => {
  return (
    <div>
      {messages.map((message, i) => (
        <p key={i} className="font-mono text-xs">
          {message.type}
        </p>
      ))}
    </div>
  );
};
