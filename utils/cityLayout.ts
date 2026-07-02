import { mulberry32, range } from './random';

export const PLATFORM_RADIUS = 7.2;
export const ROAD_WIDTH = 1.6;
export const ROAD_HALF = ROAD_WIDTH / 2;

export const BUILDING_PALETTE = ['#e8c07d', '#d98b6d', '#8fb8de', '#c9a7de', '#9fd6c0', '#e6a6b8'];

export interface BuildingSpec {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  colorIndex: number;
  windowSeed: number;
}

export interface TreeSpec {
  x: number;
  z: number;
  scale: number;
}

export interface StreetLightSpec {
  x: number;
  z: number;
  rotationY: number;
}

export interface CityLayout {
  buildings: BuildingSpec[];
  trees: TreeSpec[];
  streetLights: StreetLightSpec[];
}

function buildQuadrant(
  random: () => number,
  signX: 1 | -1,
  signZ: 1 | -1,
  buildings: BuildingSpec[]
) {
  const cellSize = 2.15;
  const startOffset = ROAD_HALF + 0.55;

  for (let cx = 0; cx < 2; cx++) {
    for (let cz = 0; cz < 2; cz++) {
      const width = range(random, 0.85, 1.35);
      const depth = range(random, 0.85, 1.35);
      const height = range(random, 0.9, 3.2);
      const cellX = startOffset + cx * cellSize + width / 2;
      const cellZ = startOffset + cz * cellSize + depth / 2;

      if (Math.hypot(cellX, cellZ) > PLATFORM_RADIUS - 0.9) continue;

      buildings.push({
        x: cellX * signX,
        z: cellZ * signZ,
        width,
        depth,
        height,
        colorIndex: Math.floor(random() * BUILDING_PALETTE.length),
        windowSeed: Math.floor(random() * 1000) + 1,
      });
    }
  }
}

export function generateCityLayout(): CityLayout {
  const random = mulberry32(20260701);
  const buildings: BuildingSpec[] = [];

  buildQuadrant(random, 1, 1, buildings);
  buildQuadrant(random, -1, 1, buildings);
  buildQuadrant(random, 1, -1, buildings);
  buildQuadrant(random, -1, -1, buildings);

  const trees: TreeSpec[] = [];
  const ringCount = 10;
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2 + 0.3;
    const r = PLATFORM_RADIUS - 0.55;
    trees.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, scale: range(random, 0.8, 1.25) });
  }
  const sidewalk = ROAD_HALF + 0.28;
  for (const along of [-4.6, -2.3, 2.3, 4.6]) {
    trees.push({ x: sidewalk, z: along, scale: range(random, 0.8, 1.1) });
    trees.push({ x: -sidewalk, z: along, scale: range(random, 0.8, 1.1) });
    trees.push({ x: along, z: sidewalk, scale: range(random, 0.8, 1.1) });
    trees.push({ x: along, z: -sidewalk, scale: range(random, 0.8, 1.1) });
  }

  const streetLights: StreetLightSpec[] = [];
  const lampOffset = ROAD_HALF + 0.18;
  for (const along of [-5.6, -1.3, 1.3, 5.6]) {
    streetLights.push({ x: lampOffset, z: along, rotationY: Math.PI / 2 });
    streetLights.push({ x: -lampOffset, z: along, rotationY: -Math.PI / 2 });
    streetLights.push({ x: along, z: lampOffset, rotationY: 0 });
    streetLights.push({ x: along, z: -lampOffset, rotationY: Math.PI });
  }

  return { buildings, trees, streetLights };
}
