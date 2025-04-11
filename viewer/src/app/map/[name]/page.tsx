import { MapViewer } from '@/components/MapViewer';
import { getMap } from '@/data';

export default async function MapPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const name = (await params).name;
  const map = await getMap(name);
  return (
    <div className="p-8 flex gap-20">
      <pre className="text-xs">{map.content.frontmatter}</pre>
      <MapViewer data={map.content.data} />
    </div>
  );
}
