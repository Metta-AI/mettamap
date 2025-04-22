const asciiToObjectType = {
  " ": "empty",
  "#": "wall",
  A: "agent",
  C: "converter",
  g: "mine",
  c: "generator",
  a: "altar",
  r: "armory",
  l: "lasery",
  b: "lab",
  f: "factory",
  t: "temple",
  v: "converter",
} as const;

const objectTypes: Record<number, [ObjectType, string]> = {
  0: ["agent", "A"],
  1: ["wall", "#"],
  2: ["mine", "g"],
  3: ["generator", "c"],
  4: ["altar", "a"],
  5: ["armory", "r"],
  6: ["lasery", "l"],
  7: ["lab", "b"],
  8: ["factory", "f"],
  9: ["temple", "t"],
  10: ["converter", "v"],
} as const;

export type ObjectType =
  (typeof asciiToObjectType)[keyof typeof asciiToObjectType];

export type ItemObjectType = Exclude<ObjectType, "wall" | "agent" | "empty">;

function isValidAscii(c: string): c is keyof typeof asciiToObjectType {
  return c in asciiToObjectType;
}

export class MettaGrid {
  constructor(
    private readonly data: {
      width: number;
      height: number;
      objects: ObjectType[][];
    }
  ) {}

  static fromAscii(asciiMap: string) {
    // Parse the data
    const lines = asciiMap.trim().split("\n");
    const width = Math.max(...lines.map((line) => line.length));
    const height = lines.length;
    const objects: ObjectType[][] = [];
    lines.forEach((line, y) => {
      line.split("").forEach((char, x) => {
        if (!isValidAscii(char)) {
          throw new Error(`Invalid character: '${char}' at ${x},${y}`);
        }
        const objectType = asciiToObjectType[char];
        objects[y] ??= [];
        objects[y][x] = objectType;
      });
    });
    return new MettaGrid({ width, height, objects });
  }

  // TODO - make MettaMap data immutable with immutable.js and evolve it by applying objects as a patch
  static fromWebsocketObjects(objects: unknown) {
    // fast parsing; zod is too slow
    if (!objects || typeof objects !== "object") {
      throw new Error("objects is not an object");
    }

    let width = 0,
      height = 0;
    const objectsList: { r: number; c: number; object: ObjectType }[] = [];

    for (const entry of Object.values(objects)) {
      if (!entry || typeof entry !== "object") {
        throw new Error(`objects entry ${entry} is not an object`);
      }
      const type_id = Number(entry["type"]);
      const r = Number(entry["r"]);
      const c = Number(entry["c"]);
      const object = objectTypes[type_id][0];
      width = Math.max(width, c);
      height = Math.max(height, r);
      objectsList.push({ r, c, object });
    }
    width += 1;
    height += 1;

    const map: ObjectType[][] = Array.from({ length: height }, () =>
      Array<ObjectType>(width).fill("empty")
    );

    for (const { r, c, object } of objectsList) {
      map[r][c] = object;
    }

    return new MettaGrid({ width, height, objects: map });
  }

  object(x: number, y: number): ObjectType {
    return this.data.objects[y][x];
  }

  get width(): number {
    return this.data.width;
  }

  get height(): number {
    return this.data.height;
  }
}
