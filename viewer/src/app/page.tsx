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
      <div className="mb-4 text-sm text-gray-600">
        Total maps: <span className="font-semibold">{maps.length}</span>
      </div>

      <div className="flex flex-col gap-4">
        {maps.slice(0, limit).map((map) => (
          <div
            key={map.file}
            className="border-2 border-gray-300 rounded-md p-4"
          >
            <ExtendedMapViewer map={map} />
          </div>
        ))}
      </div>
      {maps.length > limit && (
        <div className="mt-8">
          <LoadMoreButton />
        </div>
      )}
    </div>
  );
}
