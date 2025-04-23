"use client";
import {
  FC,
  useState,
} from "react";

import clsx from "clsx";

import { MessageData } from "./reducer";

const Message: FC<{ data: MessageData }> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={clsx(
        "cursor-pointer px-1 font-mono text-xs hover:bg-gray-100",
        expanded && "bg-gray-100"
      )}
      onClick={() => {
        setExpanded(!expanded);
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          {data.message.type === "message"
            ? data.message.message
            : `[${data.message.type}]`}
        </div>
        <div className="text-gray-500">
          {data.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
          })}
        </div>
      </div>
      {expanded && (
        <div className="mt-2 max-h-80 overflow-y-auto">
          <pre className="text-xs">{JSON.stringify(data.message, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export const MessagesViewer: FC<{ messages: MessageData[] }> = ({
  messages,
}) => {
  return (
    <div>
      <header className="mb-1 ml-1 text-sm font-bold text-gray-800">
        WebSocket message log
      </header>
      {messages.toReversed().map((message, i) => (
        <Message key={message.id} data={message} />
      ))}
    </div>
  );
};
