"use client";

import { FC } from 'react';

import { clsx } from 'clsx';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import { type MapFile } from '@/server/types';

export const MapListItem: FC<{ map: MapFile }> = ({ map }) => {
  const segments = useSelectedLayoutSegments();

  return (
    <Link
      key={map.file}
      href={`/map/${map.file}`}
      className={clsx(
        "px-2 py-1 rounded-md text-sm",
        segments.at(-1) === map.file ? "bg-gray-300" : "hover:bg-gray-200"
      )}
    >
      {map.file}
    </Link>
  );
};
