import { type SearchParams } from 'nuqs/server';

import { ExtendedMapViewer } from '@/components/ExtendedMapViewer';
import { getMaps } from '@/server/getMaps';

import { LoadMoreButton } from './LoadMoreButton';
import { paramsLoader } from './params';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { filter, limit } = await paramsLoader(searchParams);

  console.log(`Filter: ${JSON.stringify(filter)}`);
  console.log(`Limit: ${limit}`);

  const maps = await getMaps(filter ?? undefined);
  console.log(`Loaded ${maps.length} maps`);

  return (
    <div>
      {maps.slice(0, limit).map((map) => (
        <ExtendedMapViewer key={map.file} map={map} />
      ))}
      {maps.length > limit && (
        <div className="mt-8">
          <LoadMoreButton />
        </div>
      )}
    </div>
  );
}
