"use client";
import { FC } from 'react';

export const Button: FC<{
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
}> = ({ onClick, children, type = "button" }) => {
  return (
    <button
      className="bg-blue-500 text-white px-4 py-1 rounded-md cursor-pointer text-sm hover:bg-blue-600"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};
