import { ExtendedMapViewer } from '@/components/ExtendedMapViewer';
import { getMap } from '@/server/getMaps';

export default async function MapPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const name = (await params).name;
  const map = await getMap(name);

  return <ExtendedMapViewer map={map} />;
}
