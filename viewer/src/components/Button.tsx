"use client";
import { FC } from "react";

export const Button: FC<{
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
}> = ({ onClick, children, type = "button" }) => {
  return (
    <button
      className="cursor-pointer rounded-md bg-blue-500 px-4 py-1 text-sm text-white hover:bg-blue-600"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};
