import { BiomeType, BiomeMapState, ResourceNode, ChargingStation, Depot, HazardTile, GridSize } from '../types/game';
import { BIOME_CATALOG } from '../constants/biomes';

// Deterministic Pseudo-Random Number Generator based on Seed String
function seededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  return function () {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateBiomeMap(biome: BiomeType, seed: string = 'SEED_101'): BiomeMapState {
  const definition = BIOME_CATALOG[biome] || BIOME_CATALOG.MARS_BASIN;
  const rand = seededRandom(`${biome}_${seed}`);

  const gridSize: GridSize = { width: 20, height: 20 };
  const resources: ResourceNode[] = [];
  const hazardTiles: HazardTile[] = [];

  // Initial map starts with 0 stations & 0 depots (Player builds first station & depot for FREE)
  const chargingStations: ChargingStation[] = [];
  const depots: Depot[] = [];

  const reservedTiles = new Set<string>();

  // 1. Generate Environmental Hazard Tiles (Lava, Radiation, Ice)
  if (definition.hazardType !== 'NONE') {
    const hazardCount = 18 + Math.floor(rand() * 10);

    for (let i = 0; i < hazardCount; i++) {
      const hx = Math.floor(rand() * 18) + 1;
      const hy = Math.floor(rand() * 18) + 1;
      const key = `${hx},${hy}`;

      if (!reservedTiles.has(key)) {
        reservedTiles.add(key);
        hazardTiles.push({
          x: hx,
          y: hy,
          type: definition.hazardType,
          damage: definition.hazardDamage,
          name: definition.hazardName,
        });
      }
    }
  }

  // 2. Generate Resource Veins per Biome
  const templates = definition.exclusiveResources;
  const resourceCount = 12 + Math.floor(rand() * 6);

  for (let i = 0; i < resourceCount; i++) {
    const rx = Math.floor(rand() * 18) + 1;
    const ry = Math.floor(rand() * 18) + 1;
    const key = `${rx},${ry}`;

    if (!reservedTiles.has(key)) {
      reservedTiles.add(key);
      const tmpl = templates[Math.floor(rand() * templates.length)];
      const maxAmt = tmpl.rarity === 'LEGENDARY' ? 300 : tmpl.rarity === 'RARE' ? 500 : 800;

      resources.push({
        id: `${biome}-res-${i + 1}`,
        x: rx,
        y: ry,
        type: tmpl.type,
        sku: tmpl.sku,
        name: tmpl.name,
        amount: maxAmt,
        maxAmount: maxAmt,
        rarity: tmpl.rarity,
      });
    }
  }

  return {
    biome,
    name: definition.name,
    seed,
    gridSize,
    resources,
    chargingStations,
    depots,
    hazardTiles,
  };
}

// Respawn a single resource node in a free tile
export function generateSingleRespawnResource(
  biome: BiomeType,
  existingCoords: Set<string>,
  seedStr: string
): ResourceNode | null {
  const definition = BIOME_CATALOG[biome] || BIOME_CATALOG.MARS_BASIN;
  const rand = seededRandom(seedStr);
  const templates = definition.exclusiveResources;
  const tmpl = templates[Math.floor(rand() * templates.length)];

  for (let attempts = 0; attempts < 30; attempts++) {
    const rx = Math.floor(rand() * 18) + 1;
    const ry = Math.floor(rand() * 18) + 1;
    const key = `${rx},${ry}`;

    if (!existingCoords.has(key)) {
      const maxAmt = tmpl.rarity === 'LEGENDARY' ? 300 : tmpl.rarity === 'RARE' ? 500 : 800;
      return {
        id: `respawn-res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        x: rx,
        y: ry,
        type: tmpl.type,
        sku: tmpl.sku,
        name: tmpl.name,
        amount: maxAmt,
        maxAmount: maxAmt,
        rarity: tmpl.rarity,
      };
    }
  }
  return null;
}

export function populateExpandedZone(
  biome: BiomeType,
  prevSize: GridSize,
  newSize: GridSize,
  existingMapState: BiomeMapState,
  seedStr: string
): { newResources: ResourceNode[]; newHazardTiles: HazardTile[] } {
  const definition = BIOME_CATALOG[biome] || BIOME_CATALOG.MARS_BASIN;
  const rand = seededRandom(seedStr);

  const newResources: ResourceNode[] = [];
  const newHazardTiles: HazardTile[] = [];

  const occupied = new Set<string>();
  existingMapState.resources.forEach((r) => occupied.add(`${r.x},${r.y}`));
  existingMapState.chargingStations.forEach((c) => occupied.add(`${c.x},${c.y}`));
  existingMapState.depots.forEach((d) => occupied.add(`${d.x},${d.y}`));
  existingMapState.hazardTiles.forEach((h) => occupied.add(`${h.x},${h.y}`));

  // Helper to get random tile in expanded zone ONLY (x >= prevSize.width OR y >= prevSize.height)
  const getExpandedCoord = (): { x: number; y: number; key: string } | null => {
    for (let attempt = 0; attempt < 50; attempt++) {
      let x = Math.floor(rand() * newSize.width);
      let y = Math.floor(rand() * newSize.height);

      if (rand() > 0.5) {
        x = prevSize.width + Math.floor(rand() * Math.max(1, newSize.width - prevSize.width));
      } else {
        y = prevSize.height + Math.floor(rand() * Math.max(1, newSize.height - prevSize.height));
      }

      x = Math.max(0, Math.min(newSize.width - 1, x));
      y = Math.max(0, Math.min(newSize.height - 1, y));
      const key = `${x},${y}`;

      if (!occupied.has(key)) {
        occupied.add(key);
        return { x, y, key };
      }
    }
    return null;
  };

  // 1. Generate Hazard Tiles in Expanded Zone
  if (definition.hazardType !== 'NONE') {
    const hazardCount = 12 + Math.floor(rand() * 8);
    for (let i = 0; i < hazardCount; i++) {
      const coord = getExpandedCoord();
      if (coord) {
        newHazardTiles.push({
          x: coord.x,
          y: coord.y,
          type: definition.hazardType,
          damage: definition.hazardDamage,
          name: definition.hazardName,
        });
      }
    }
  }

  // 2. Generate Rich Resource Veins in Expanded Zone
  const templates = definition.exclusiveResources;
  const resourceCount = 10 + Math.floor(rand() * 6);
  for (let i = 0; i < resourceCount; i++) {
    const coord = getExpandedCoord();
    if (coord) {
      const tmpl = templates[Math.floor(rand() * templates.length)];
      const maxAmt = tmpl.rarity === 'LEGENDARY' ? 500 : tmpl.rarity === 'RARE' ? 800 : 1200;

      newResources.push({
        id: `${biome}-exp-res-${Date.now()}-${i}`,
        x: coord.x,
        y: coord.y,
        type: tmpl.type,
        sku: tmpl.sku,
        name: `${tmpl.name} (Zengin Damar)`,
        amount: maxAmt,
        maxAmount: maxAmt,
        rarity: tmpl.rarity,
      });
    }
  }

  return { newResources, newHazardTiles };
}
