import fs from 'fs/promises';
import yaml from 'js-yaml';

const MAP_DIR = "../../metta/deps/mettagrid/maps";

export type MapFile = {
  file: string;
  content: {
    frontmatter: string;
    data: string;
  };
};

function parseMapFile(map: string): MapFile["content"] {
  const [frontmatter, ...rest] = map.split("---");
  const mapData = rest.join("---").trim();

  // OmegaConf output format is a bit messy, so we need to clean it up
  const updatedFrontmatter = yaml.dump(yaml.load(frontmatter));

  return {
    frontmatter: updatedFrontmatter,
    data: mapData,
  };
}

export async function getMaps(): Promise<MapFile[]> {
  // read all files from ./maps folder
  const mapFiles = await fs.readdir(MAP_DIR);

  // load each file as json
  const maps = mapFiles.map(async (file) => {
    const map = await fs.readFile(`${MAP_DIR}/${file}`, "utf8");
    const content = parseMapFile(map);
    return {
      file,
      content,
    };
  });

  return Promise.all(maps);
}

export async function getMap(file: string): Promise<MapFile> {
  const maps = await getMaps();
  const map = maps.find((map) => map.file === file);
  if (!map) {
    throw new Error(`Map file ${file} not found`);
  }
  return map;
}
