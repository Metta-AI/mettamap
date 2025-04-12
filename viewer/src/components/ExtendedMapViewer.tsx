import { FC } from 'react';

import { MapFile } from '@/server/types';

import { MapViewer } from './MapViewer';

export const ExtendedMapViewer: FC<{ map: MapFile }> = ({ map }) => {
  return (
    <div className="p-8 flex gap-20">
      <pre className="text-xs">{map.content.frontmatter}</pre>
      <MapViewer data={map.content.data} />
    </div>
  );
};
