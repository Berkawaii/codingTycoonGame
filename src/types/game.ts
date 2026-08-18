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
  tileType: 'RESOURCE' | 'CHARGING_PAD' | 'ROBOT' | 'EMPTY';
  name: string;
  sku?: string;
  amount?: number;
  rarity?: RarityType;
}

export interface BuildingInfo {
  x: number;
  y: number;
  distance: number;
  buildingType: 'CHARGING_PAD' | 'DEPOT' | 'ANY';
  name: string;
}

export type InventoryMap = Record<string, number>; // SKU -> quantity

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
