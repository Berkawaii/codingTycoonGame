export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type RobotStatus = 'IDLE' | 'MOVING' | 'MINING' | 'CHARGING' | 'ERROR';

export type RarityType = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

export interface Robot {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: Direction;
  status: RobotStatus;
  color: string;
  energy: number;
  maxEnergy: number;
  minedCount: number;
  miningSpeed: number; // multiplier e.g. 1.05 = +5%
  miningLevel: number; // level 1 = 1%
  batteryLevel: number; // level 1 = 1%
  radarRange: number; // radius in tiles, default 5
  radarLevel: number; // level 1 = +1% accuracy/range
  scriptName?: string;
  scriptCode?: string;
  cargoAmount: number;
  maxCargo: number;
  cargoLevel: number;
  cargoSku?: string;
  biomeId?: BiomeType;
  role?: 'MINER' | 'TRANSPORTER' | 'REPAIR_DRONE';
  canMine?: boolean;
  moveSpeed?: number; // 1 = normal, 2 = 2x speed
  health?: number; // 0 to 100
  maxHealth?: number; // default 100
  isDamaged?: boolean;
}

export interface BanditRobot {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  cargoAmount: number;
  maxCargo: number;
  stolenSku?: string;
  state: 'RAIDING' | 'ESCAPING' | 'ATTACKING';
  targetX?: number;
  targetY?: number;
}

export interface TurretBuilding {
  id: string;
  name: string;
  x: number;
  y: number;
  range: number;
  rangeLevel: number;
  damage: number;
  damageLevel: number;
  targetBanditId?: string | null;
  lastFiredTick?: number;
}

export interface HazardEvent {
  id: string;
  type: 'DUST_STORM' | 'VOLCANIC_ERUPTION' | 'QUANTUM_FLARE' | 'BLIZZARD';
  name: string;
  durationTicks: number;
  remainingTicks: number;
  severity: number;
}

export interface RadioMessage {
  id: string;
  senderId: string;
  senderName: string;
  messageType: string; // e.g. 'CARGO_FULL', 'NEED_CHARGE'
  x: number;
  y: number;
  payload?: string;
  timestamp: number;
}

export interface ChargingStation {
  id: string;
  x: number;
  y: number;
  name: string;
  chargeRate: number;
}

export interface Depot {
  id: string;
  x: number;
  y: number;
  name: string;
}

export interface Smelter {
  id: string;
  x: number;
  y: number;
  name: string;
  width: 2;
  height: 2;
  inputBuffer: Record<string, number>;
  outputBuffer: Record<string, number>;
}

export interface Refinery {
  id: string;
  x: number;
  y: number;
  name: string;
  width: 2;
  height: 2;
  inputBuffer: Record<string, number>;
  outputBuffer: Record<string, number>;
}

export interface PowerPlant {
  id: string;
  x: number;
  y: number;
  name: string;
  linkedStationId: string;
  powerBuffer: number;
  maxPowerBuffer: number;
  temperature: number; // 20.0 to 100.0 °C
  overclockRate: number; // 0.5 to 2.0
  isOverheated: boolean;
  overheatTicksRemaining: number;
  scriptCode?: string;
}

export type ResourceType = 'IRON_ORE' | 'COPPER_ORE' | 'GOLD_ORE' | 'CRYSTAL';

export interface SKU {
  sku: string; // E.g., 'SKU-IRON-01'
  name: string;
  type: ResourceType;
  unit: string;
  description: string;
  color: string;
  baseValue: number;
  rarity: RarityType;
}

export interface ResourceNode {
  id: string;
  x: number;
  y: number;
  type: ResourceType;
  sku: string;
  amount: number;
  maxAmount: number;
  name: string;
  rarity: RarityType;
}

export interface RadarTileInfo {
  x: number;
  y: number;
  distance: number;
  tileType: 'RESOURCE' | 'CHARGING_PAD' | 'ROBOT' | 'BANDIT' | 'EMPTY';
  name: string;
  sku?: string;
  amount?: number;
  rarity?: RarityType;
}

export interface BuildingInfo {
  x: number;
  y: number;
  distance: number;
  buildingType: 'CHARGING_PAD' | 'DEPOT' | 'TURRET' | 'ANY';
  name: string;
}

export type InventoryMap = Record<string, number>; // SKU -> quantity

export type BiomeType = 'MARS_BASIN' | 'VOLCANIC' | 'QUANTUM_CAVERN' | 'GLACIER';
export type HazardType = 'NONE' | 'LAVA' | 'RADIATION' | 'ICE';

export interface HazardTile {
  x: number;
  y: number;
  type: HazardType;
  damage: number; // energy damage per tick
  name: string;
}

export interface BiomeMapState {
  biome: BiomeType;
  name: string;
  seed: string;
  gridSize: GridSize;
  resources: ResourceNode[];
  chargingStations: ChargingStation[];
  depots: Depot[];
  hazardTiles: HazardTile[];
  smelters?: Smelter[];
  refineries?: Refinery[];
  powerPlants?: PowerPlant[];
  radioMessages?: RadioMessage[];
  activeBandits?: BanditRobot[];
  turrets?: TurretBuilding[];
  activeHazard?: HazardEvent | null;
}

export interface GameLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface GridSize {
  width: number;
  height: number;
}
