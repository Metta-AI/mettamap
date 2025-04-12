import { FC } from 'react';

import { loadMapIndex } from '@/server/loadMapIndex';

import { InnerMapFilter } from './InnerMapFilter';

export const MapFilter: FC = async () => {
  const mapIndex = await loadMapIndex();

  return (
    <div className="bg-white p-4 border-b">
      <div className="px-8">
        <InnerMapFilter mapIndex={mapIndex} />
      </div>
    </div>
  );
};
