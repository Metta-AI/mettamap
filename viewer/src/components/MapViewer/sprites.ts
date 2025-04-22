import {
  ItemObjectType,
  ObjectType,
} from "@/lib/MettaGrid";

const objectTypeToItemTile = {
  converter: [0, 0],
  mine: [14, 2],
  generator: [2, 2],
  altar: [12, 2],
  armory: [6, 3],
  lasery: [5, 5],
  lab: [5, 1],
  factory: [13, 0],
  temple: [7, 2],
} satisfies Record<ItemObjectType, [number, number]>;

export class Sprites {
  wall: HTMLImageElement;
  items: HTMLImageElement;
  monsters: HTMLImageElement;

  constructor(
    wall: HTMLImageElement,
    items: HTMLImageElement,
    monsters: HTMLImageElement
  ) {
    this.wall = wall;
    this.items = items;
    this.monsters = monsters;
  }

  draw(
    item: ObjectType,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    switch (item) {
      case "empty":
        return;
      case "wall":
        ctx.drawImage(this.wall, x, y, size, size);
        break;
      case "agent":
        ctx.drawImage(this.monsters, 0, 0, 16, 16, x, y, size, size);
        break;
      default:
        const [tileX, tileY] = objectTypeToItemTile[item];
        ctx.drawImage(
          this.items,
          tileX * 16,
          tileY * 16,
          16,
          16,
          x,
          y,
          size,
          size
        );
        break;
    }
  }
}

export async function loadSprites(): Promise<Sprites> {
  const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
      return img;
    });
  };
  const [wall, items, monsters] = await Promise.all([
    loadImage("/assets/wall.png"),
    loadImage("/assets/items.png"),
    loadImage("/assets/monsters.png"),
  ]);
  const sprites = new Sprites(wall, items, monsters);
  return sprites;
}
