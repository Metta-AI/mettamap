import { FC } from 'react';

import { getMaps } from '@/server/getMaps';

import { MapListItem } from './MapListItem';

export const MapList: FC = async () => {
  const maps = await getMaps();

  return (
    <div className="flex flex-col gap-1">
      {maps.map((map) => (
        <MapListItem key={map.file} map={map} />
      ))}
    </div>
  );
};
