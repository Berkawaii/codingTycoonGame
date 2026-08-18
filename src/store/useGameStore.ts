import { create } from 'zustand';
import { Robot, ResourceNode, InventoryMap, GameLog, GridSize, Direction, ChargingStation, Depot } from '../types/game';
import { DEFAULT_C_SHARP_SCRIPT, SKU_CATALOG } from '../constants/skus';
import { soundService } from '../services/soundService';
import { compileAndRunCSharp } from '../services/wasmRunner';

interface GameState {
  gridSize: GridSize;
  credits: number;
  robots: Robot[];
  resources: ResourceNode[];
  chargingStations: ChargingStation[];
  depots: Depot[];
  inventory: InventoryMap;
  selectedRobotId: string;
  scriptCode: string;
  isRunning: boolean;
  tickRate: number; // in milliseconds
  tickCount: number;
  logs: GameLog[];
  isApiModalOpen: boolean;

  // Tutorial Stage System
  isTutorialModeActive: boolean;
  tutorialStepIndex: number;
  tutorialCompleted: number[];
  tutorialProgress: {
    movesCount: number;
    minesCount: number;
    chargesCount: number;
    unloadsCount: number;
  };
  startTutorialStage: (stepId: number) => void;
  exitTutorialMode: () => void;
  setTutorialStepIndex: (index: number) => void;
  markTutorialStepCompleted: (stepId: number) => void;

  // Actions
  setSelectedRobotId: (id: string) => void;
  setScriptCode: (code: string) => void;
  setIsRunning: (running: boolean) => void;
  toggleRunning: () => void;
  setTickRate: (rate: number) => void;
  setApiModalOpen: (open: boolean) => void;
  addLog: (level: GameLog['level'], message: string) => void;
  clearLogs: () => void;
  
  // Tycoon Economy Actions
  sellResource: (sku: string, amount?: number) => void;
  sellAllResources: () => void;
  buyRobot: (name: string, color: string, price: number) => boolean;
  buyChargingStation: (name: string, x: number, y: number, price: number) => boolean;
  buyDepot: (name: string, x: number, y: number, price: number) => boolean;
  upgradeRobotStat: (robotId: string, statType: 'radar' | 'battery' | 'mining' | 'cargo', price: number) => boolean;

  // Game Mechanics Actions
  moveRobot: (robotId: string, direction: Direction) => void;
  mineResource: (robotId: string, targetX?: number, targetY?: number) => void;
  unloadCargo: (robotId: string) => void;
  rotateRobot: (robotId: string, direction: Direction) => void;
  compileAndRunScript: () => Promise<boolean>;
  stepTick: () => void;
  resetGame: () => void;
}

const INITIAL_GRID_SIZE: GridSize = { width: 20, height: 20 };

const INITIAL_CHARGING_STATIONS: ChargingStation[] = [
  { id: 'charge-1', x: 0, y: 0, name: 'Ana Şarj İstasyonu (Kuzey-Batı)', chargeRate: 25 },
];

const INITIAL_DEPOTS: Depot[] = [
  { id: 'depot-1', x: 0, y: 19, name: 'Ana Lojistik Deposu (Güneydoğu)' },
];

const INITIAL_ROBOTS: Robot[] = [
  {
    id: 'robot-1',
    name: 'Rover Alpha',
    x: 2,
    y: 3,
    direction: 'EAST',
    status: 'IDLE',
    color: '#00f2fe',
    energy: 100,
    maxEnergy: 100,
    minedCount: 0,
    miningSpeed: 1,
    miningLevel: 1,
    batteryLevel: 1,
    radarRange: 5,
    radarLevel: 1,
    cargoAmount: 0,
    maxCargo: 50,
    cargoLevel: 1,
    scriptName: 'MineIron.cs',
    scriptCode: DEFAULT_C_SHARP_SCRIPT,
  },
  {
    id: 'robot-2',
    name: 'Rover Beta',
    x: 14,
    y: 12,
    direction: 'NORTH',
    status: 'IDLE',
    color: '#4facfe',
    energy: 85,
    maxEnergy: 100,
    minedCount: 0,
    miningSpeed: 1,
    miningLevel: 1,
    batteryLevel: 1,
    radarRange: 5,
    radarLevel: 1,
    cargoAmount: 0,
    maxCargo: 50,
    cargoLevel: 1,
    scriptName: 'CollectCopper.cs',
    scriptCode: `using System;
using System.Collections.Generic;

public class RobotScript
{
    // Rover Beta - Özel Bakır Toplayıcı & Akıllı Batarya Algoritması
    public void Execute(IRobot robot)
    {
        // 1. Batarya Sorgulama: Batarya %25 altına düşerse Şarj İstasyonuna dön!
        int currentEnergy = robot.GetEnergy();
        int neededEnergy = robot.GetEnergyToNearestStation();

        if (currentEnergy <= 25 || currentEnergy <= neededEnergy + 2)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        // 2. Radardan sadece Bakır Cevheri (SKU-COPPER-01) tarayalım
        List<RadarTileInfo> radarData = robot.GetRadarInfo();
        RadarTileInfo copperNode = null;

        foreach (var info in radarData)
        {
            if (info.SKU == "SKU-COPPER-01" && info.Amount > 0)
            {
                copperNode = info;
                break;
            }
        }

        Tile front = robot.GetTileInfo(Direction.Forward);
        if (front.HasResource && front.Amount > 0)
        {
            robot.Mine();
        }
        else if (copperNode != null)
        {
            // Bakır madeninin koordinatına adımla
            robot.GoTo(copperNode.X, copperNode.Y);
        }
        else
        {
            robot.Move(Direction.Forward);
        }
    }
}`,
  },
];

const INITIAL_RESOURCES: ResourceNode[] = [
  { id: 'res-1', x: 5, y: 3, type: 'IRON_ORE', sku: 'SKU-IRON-01', amount: 150, maxAmount: 150, name: 'Demir Damarı Alpha', rarity: 'COMMON' },
  { id: 'res-2', x: 5, y: 4, type: 'IRON_ORE', sku: 'SKU-IRON-01', amount: 200, maxAmount: 200, name: 'Demir Damarı Beta', rarity: 'COMMON' },
  { id: 'res-3', x: 8, y: 8, type: 'COPPER_ORE', sku: 'SKU-COPPER-01', amount: 120, maxAmount: 120, name: 'Bakır Yuvası #1', rarity: 'UNCOMMON' },
  { id: 'res-4', x: 14, y: 10, type: 'GOLD_ORE', sku: 'SKU-GOLD-01', amount: 60, maxAmount: 60, name: 'Nadir Altın Yatağı', rarity: 'RARE' },
  { id: 'res-5', x: 17, y: 16, type: 'CRYSTAL', sku: 'SKU-CRYSTAL-01', amount: 30, maxAmount: 30, name: 'Kuantum Kristali', rarity: 'LEGENDARY' },
  { id: 'res-6', x: 12, y: 2, type: 'IRON_ORE', sku: 'SKU-IRON-01', amount: 180, maxAmount: 180, name: 'Kuzey Demir Damarı', rarity: 'COMMON' },
];

const INITIAL_INVENTORY: InventoryMap = {
  'SKU-IRON-01': 24,
  'SKU-COPPER-01': 10,
  'SKU-GOLD-01': 2,
  'SKU-CRYSTAL-01': 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  gridSize: INITIAL_GRID_SIZE,
  credits: 500, // Starting cash
  robots: INITIAL_ROBOTS,
  resources: INITIAL_RESOURCES,
  chargingStations: INITIAL_CHARGING_STATIONS,
  depots: INITIAL_DEPOTS,
  inventory: INITIAL_INVENTORY,
  selectedRobotId: 'robot-1',
  scriptCode: DEFAULT_C_SHARP_SCRIPT,
  isRunning: false,
  tickRate: 500,
  tickCount: 0,
  isApiModalOpen: false,
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'C# Scripting Tycoon Simülasyonu & Depo Katmanı başlatıldı.',
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      message: 'Başlangıç kredisi $500 tanımlandı. Şarj İstasyonları ve Depolar haritaya yerleştirildi.',
    },
  ],

  // Tutorial Stage System
  isTutorialModeActive: false,
  tutorialStepIndex: 0,
  tutorialCompleted: [],
  tutorialProgress: {
    movesCount: 0,
    minesCount: 0,
    chargesCount: 0,
    unloadsCount: 0,
  },

  startTutorialStage: (stepId) => {
    const idx = Math.max(0, Math.min(5, stepId - 1));
    soundService.playPurchase();

    let stageRobots: Robot[] = [];
    let stageResources: ResourceNode[] = [];
    let stageStations: ChargingStation[] = [];
    let stageDepots: Depot[] = [];

    if (stepId === 1) {
      // Stage 1: Movement
      stageRobots = [{
        id: 'robot-1', name: 'Rover Alpha', x: 2, y: 5, direction: 'EAST', status: 'IDLE', color: '#00f2fe',
        energy: 100, maxEnergy: 100, minedCount: 0, miningSpeed: 1, miningLevel: 1, batteryLevel: 1, radarRange: 5, radarLevel: 1, cargoAmount: 0, maxCargo: 50, cargoLevel: 1, scriptName: 'Tutorial_Step1.cs', scriptCode: `using System;\n\npublic class RobotScript\n{\n    public void Execute(IRobot robot)\n    {\n        // Görev: Robotu ileri hareket ettirin\n        robot.Move(Direction.Forward);\n    }\n}`
      }];
    } else if (stepId === 2) {
      // Stage 2: Mining
      stageRobots = [{
        id: 'robot-1', name: 'Rover Alpha', x: 2, y: 5, direction: 'EAST', status: 'IDLE', color: '#00f2fe',
        energy: 100, maxEnergy: 100, minedCount: 0, miningSpeed: 1, miningLevel: 1, batteryLevel: 1, radarRange: 5, radarLevel: 1, cargoAmount: 0, maxCargo: 50, cargoLevel: 1, scriptName: 'Tutorial_Step2.cs', scriptCode: `using System;\n\npublic class RobotScript\n{\n    public void Execute(IRobot robot)\n    {\n        Tile frontTile = robot.GetTileInfo(Direction.Forward);\n        if (frontTile.HasResource)\n        {\n            robot.Mine();\n        }\n        else\n        {\n            robot.Move(Direction.Forward);\n        }\n    }\n}`
      }];
      stageResources = [{ id: 'res-tut-1', name: 'Demir Damarı', sku: 'FE_ORE', type: 'IRON_ORE', x: 3, y: 5, amount: 200, maxAmount: 200, rarity: 'COMMON' }];
    } else if (stepId === 3) {
      // Stage 3: Charging
      stageRobots = [{
        id: 'robot-1', name: 'Rover Alpha', x: 5, y: 5, direction: 'NORTH', status: 'IDLE', color: '#00f2fe',
        energy: 20, maxEnergy: 100, minedCount: 0, miningSpeed: 1, miningLevel: 1, batteryLevel: 1, radarRange: 5, radarLevel: 1, cargoAmount: 0, maxCargo: 50, cargoLevel: 1, scriptName: 'Tutorial_Step3.cs', scriptCode: `using System;\n\npublic class RobotScript\n{\n    public void Execute(IRobot robot)\n    {\n        if (robot.GetEnergy() <= 35)\n        {\n            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");\n            robot.GoTo(station.X, station.Y);\n            return;\n        }\n        robot.Move(Direction.Forward);\n    }\n}`
      }];
      stageStations = [{ id: 'cs-tut-1', x: 5, y: 2, name: 'Eğitim Şarj İstasyonu', chargeRate: 25 }];
    } else if (stepId === 4) {
      // Stage 4: Logistics Depot
      stageRobots = [{
        id: 'robot-1', name: 'Rover Alpha', x: 5, y: 5, direction: 'SOUTH', status: 'IDLE', color: '#00f2fe',
        energy: 100, maxEnergy: 100, minedCount: 0, miningSpeed: 1, miningLevel: 1, batteryLevel: 1, radarRange: 5, radarLevel: 1, cargoAmount: 50, maxCargo: 50, cargoSku: 'FE_ORE', cargoLevel: 1, scriptName: 'Tutorial_Step4.cs', scriptCode: `using System;\n\npublic class RobotScript\n{\n    public void Execute(IRobot robot)\n    {\n        if (robot.GetCargo() >= 40)\n        {\n            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");\n            robot.GoTo(depot.X, depot.Y);\n            return;\n        }\n        robot.Move(Direction.Forward);\n    }\n}`
      }];
      stageDepots = [{ id: 'depot-tut-1', x: 5, y: 10, name: 'Eğitim Deposu' }];
    } else if (stepId === 5) {
      // Stage 5: Radar
      stageRobots = [{
        id: 'robot-1', name: 'Rover Alpha', x: 2, y: 2, direction: 'EAST', status: 'IDLE', color: '#00f2fe',
        energy: 100, maxEnergy: 100, minedCount: 0, miningSpeed: 1, miningLevel: 1, batteryLevel: 1, radarRange: 5, radarLevel: 1, cargoAmount: 0, maxCargo: 50, cargoLevel: 1, scriptName: 'Tutorial_Step5.cs', scriptCode: `using System;\nusing System.Collections.Generic;\n\npublic class RobotScript\n{\n    public void Execute(IRobot robot)\n    {\n        List<RadarTileInfo> radarData = robot.GetRadarInfo();\n        foreach (var info in radarData)\n        {\n            if (info.TileType == "RESOURCE" && info.Amount > 0)\n            {\n                robot.GoTo(info.X, info.Y);\n                return;\n            }\n        }\n        robot.Move(Direction.Forward);\n    }\n}`
      }];
      stageResources = [{ id: 'res-tut-2', name: 'Altın Damarı', sku: 'AU_ORE', type: 'GOLD_ORE', x: 6, y: 5, amount: 200, maxAmount: 200, rarity: 'RARE' }];
    } else {
      // Stage 6: Master Autonomous Certification
      stageRobots = INITIAL_ROBOTS;
      stageResources = INITIAL_RESOURCES;
      stageStations = INITIAL_CHARGING_STATIONS;
      stageDepots = INITIAL_DEPOTS;
    }

    set({
      isTutorialModeActive: true,
      tutorialStepIndex: idx,
      robots: stageRobots,
      resources: stageResources.length > 0 ? stageResources : get().resources,
      chargingStations: stageStations.length > 0 ? stageStations : get().chargingStations,
      depots: stageDepots.length > 0 ? stageDepots : get().depots,
      selectedRobotId: 'robot-1',
      scriptCode: stageRobots[0]?.scriptCode || '',
      tutorialProgress: { movesCount: 0, minesCount: 0, chargesCount: 0, unloadsCount: 0 },
      isRunning: false,
    });

    get().addLog('info', `🎓 [EĞİTİM BÖLÜMÜ BAŞLATILDI]: Bölüm ${stepId} Özel Haritası yüklendi. Görevi başarmak için koda rehberlik edin ve Çalıştır'a basın.`);
  },

  exitTutorialMode: () => {
    set({
      isTutorialModeActive: false,
      robots: INITIAL_ROBOTS,
      resources: INITIAL_RESOURCES,
      chargingStations: INITIAL_CHARGING_STATIONS,
      depots: INITIAL_DEPOTS,
      selectedRobotId: 'robot-1',
      scriptCode: INITIAL_ROBOTS[0].scriptCode,
      isRunning: false,
    });
    get().addLog('info', `[SERBEST MOD]: Serbest Tycoon haritasına geri dönüldü.`);
  },

  setTutorialStepIndex: (index) => set({ tutorialStepIndex: index }),

  markTutorialStepCompleted: (stepId) => {
    const { tutorialCompleted, credits } = get();
    if (!tutorialCompleted.includes(stepId)) {
      const updated = [...tutorialCompleted, stepId];
      const bonus = stepId === 6 ? 1000 : 0;

      set({
        tutorialCompleted: updated,
        credits: credits + bonus,
      });

      if (bonus > 0) {
        get().addLog('success', `[AKADEMİ SERTİFİKASI]: Tüm eğitim seviyeleri başarıyla tamamlandı! +$1,000 Bonus Kredi cüzdanınıza aktarıldı.`);
      }
    }
  },

  setSelectedRobotId: (id) => {
    const target = get().robots.find((r) => r.id === id);
    set({
      selectedRobotId: id,
      scriptCode: target?.scriptCode || DEFAULT_C_SHARP_SCRIPT,
    });
  },
  setScriptCode: (code) => {
    const { selectedRobotId } = get();
    set((state) => ({
      scriptCode: code,
      robots: state.robots.map((r) =>
        r.id === selectedRobotId ? { ...r, scriptCode: code } : r
      ),
    }));
  },
  setIsRunning: (running) => set({ isRunning: running }),
  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),
  setTickRate: (rate) => set({ tickRate: rate }),
  setApiModalOpen: (open) => set({ isApiModalOpen: open }),

  addLog: (level, message) => {
    const newLog: GameLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 50),
    }));
  },

  clearLogs: () => set({ logs: [] }),

  // ------------------------------------------------------------------------
  // Tycoon Economy Actions
  // ------------------------------------------------------------------------
  sellResource: (sku, amountToSell) => {
    const { inventory } = get();
    const skuDef = SKU_CATALOG[sku];
    const available = inventory[sku] || 0;
    if (!skuDef || available <= 0) return;

    const count = amountToSell !== undefined ? Math.min(amountToSell, available) : available;
    const earned = count * skuDef.baseValue;

    set((state) => ({
      credits: state.credits + earned,
      inventory: {
        ...state.inventory,
        [sku]: available - count,
      },
    }));

    get().addLog('success', `Pazarda ${count} ${skuDef.unit} ${skuDef.name} satıldı! Gelir: +$${earned.toLocaleString()}`);
  },

  sellAllResources: () => {
    const { inventory } = get();
    let totalEarned = 0;
    const updatedInv = { ...inventory };

    Object.entries(inventory).forEach(([sku, count]) => {
      const skuDef = SKU_CATALOG[sku];
      if (skuDef && count > 0) {
        totalEarned += count * skuDef.baseValue;
        updatedInv[sku] = 0;
      }
    });

    if (totalEarned > 0) {
      set((state) => ({
        credits: state.credits + totalEarned,
        inventory: updatedInv,
      }));
      get().addLog('success', `Tüm stoklar pazarda satıldı! Toplam Gelir: +$${totalEarned.toLocaleString()}`);
    }
  },

  buyRobot: (name, color, price) => {
    const { credits, robots } = get();
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! ${name} satın almak için $${price.toLocaleString()} gerekiyor.`);
      return false;
    }

    const newRobotId = `robot-${robots.length + 1}`;
    const newRobot: Robot = {
      id: newRobotId,
      name,
      x: 0,
      y: 0,
      direction: 'EAST',
      status: 'IDLE',
      color,
      energy: 100,
      maxEnergy: 100,
      minedCount: 0,
      miningSpeed: 1,
      miningLevel: 1,
      batteryLevel: 1,
      radarRange: 5,
      radarLevel: 1,
      cargoAmount: 0,
      maxCargo: 50,
      cargoLevel: 1,
      scriptName: `${name.replace(/\s+/g, '')}.cs`,
      scriptCode: DEFAULT_C_SHARP_SCRIPT,
    };

    set((state) => ({
      credits: state.credits - price,
      robots: [...state.robots, newRobot],
      selectedRobotId: newRobotId,
      scriptCode: DEFAULT_C_SHARP_SCRIPT,
    }));

    get().addLog('success', `Yeni robot '${name}' $${price.toLocaleString()} karşılığında satın alındı!`);
    return true;
  },

  buyChargingStation: (name, x, y, price) => {
    const { credits, chargingStations, gridSize } = get();
    const actualPrice = chargingStations.length === 1 ? 0 : price;

    if (credits < actualPrice) {
      get().addLog('error', `Yetersiz bakiye! Şarj İstasyonu için $${actualPrice.toLocaleString()} gerekiyor.`);
      return false;
    }
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) {
      get().addLog('error', `Geçersiz koordinat! Harita sınırları: (0-${gridSize.width - 1}, 0-${gridSize.height - 1})`);
      return false;
    }

    const newStation: ChargingStation = {
      id: `charge-${chargingStations.length + 1}`,
      x,
      y,
      name,
      chargeRate: 25,
    };

    set((state) => ({
      credits: state.credits - actualPrice,
      chargingStations: [...state.chargingStations, newStation],
    }));

    const priceText = actualPrice === 0 ? 'ÜCRETSİZ' : `$${actualPrice.toLocaleString()}`;
    get().addLog('success', `Yeni '${name}' (${x}, ${y}) konumuna ${priceText} bedelle inşa edildi!`);
    return true;
  },

  buyDepot: (name, x, y, price) => {
    const { credits, depots, gridSize } = get();
    const actualPrice = depots.length === 1 ? 0 : price;

    if (credits < actualPrice) {
      get().addLog('error', `Yetersiz bakiye! Depo için $${actualPrice.toLocaleString()} gerekiyor.`);
      return false;
    }
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) {
      get().addLog('error', `Geçersiz koordinat! Harita sınırları: (0-${gridSize.width - 1}, 0-${gridSize.height - 1})`);
      return false;
    }

    const newDepot: Depot = {
      id: `depot-${depots.length + 1}`,
      x,
      y,
      name,
    };

    set((state) => ({
      credits: state.credits - actualPrice,
      depots: [...state.depots, newDepot],
    }));

    const priceText = actualPrice === 0 ? 'ÜCRETSİZ' : `$${actualPrice.toLocaleString()}`;
    get().addLog('success', `Yeni '${name}' (${x}, ${y}) konumuna ${priceText} bedelle inşa edildi!`);
    return true;
  },

  upgradeRobotStat: (robotId, statType, price) => {
    const { credits, robots } = get();
    const robot = robots.find((r) => r.id === robotId);
    if (!robot || credits < price) {
      get().addLog('error', `Yetersiz bakiye veya robot bulunamadı! Yükseltme ücreti: $${price.toLocaleString()}`);
      return false;
    }

    let newLevel = 1;

    set((state) => ({
      credits: state.credits - price,
      robots: state.robots.map((r) => {
        if (r.id !== robotId) return r;

        if (statType === 'radar') {
          newLevel = r.radarLevel + 1;
          const newRange = 5 + (newLevel - 1); // Lvl 1 = 5 tiles, Lvl 2 = 6 tiles...
          return { ...r, radarLevel: newLevel, radarRange: newRange };
        } else if (statType === 'battery') {
          newLevel = r.batteryLevel + 1;
          const newMax = Math.round(100 * (1 + newLevel * 0.01));
          return { ...r, batteryLevel: newLevel, maxEnergy: newMax, energy: Math.min(newMax, r.energy + 10) };
        } else if (statType === 'mining') {
          newLevel = r.miningLevel + 1;
          const newSpeed = Number((1 + newLevel * 0.01).toFixed(2));
          return { ...r, miningLevel: newLevel, miningSpeed: newSpeed };
        } else if (statType === 'cargo') {
          newLevel = (r.cargoLevel || 1) + 1;
          const newMaxCargo = 50 + (newLevel - 1) * 25; // Lvl 1 = 50kg, Lvl 2 = 75kg, Lvl 3 = 100kg...
          return { ...r, cargoLevel: newLevel, maxCargo: newMaxCargo };
        }

        return r;
      }),
    }));

    soundService.playPurchase();
    get().addLog('success', `${robot.name} için '${statType.toUpperCase()}' Seviye ${newLevel}'e yükseltildi! (-$${price.toLocaleString()})`);
    return true;
  },

  moveRobot: (robotId, direction) => {
    const { robots, gridSize, chargingStations, depots } = get();
    const robot = robots.find((r) => r.id === robotId);
    if (!robot || robot.energy <= 0) return;

    let dx = 0;
    let dy = 0;
    switch (direction) {
      case 'NORTH':
        dy = -1;
        break;
      case 'EAST':
        dx = 1;
        break;
      case 'SOUTH':
        dy = 1;
        break;
      case 'WEST':
        dx = -1;
        break;
    }

    const newX = Math.max(0, Math.min(gridSize.width - 1, robot.x + dx));
    const newY = Math.max(0, Math.min(gridSize.height - 1, robot.y + dy));

    // Collision Check: Is target tile occupied by another robot?
    const isStationOrDepot =
      chargingStations.some((cs) => cs.x === newX && cs.y === newY) ||
      depots.some((d) => d.x === newX && d.y === newY);

    const isOccupiedByRobot = robots.some(
      (r) => r.id !== robotId && r.x === newX && r.y === newY
    );

    if (isOccupiedByRobot && !isStationOrDepot) {
      // Automatic Deadlock Resolution: Try a lateral side-step detour around the blocking robot!
      let detourDirection: Direction | null = null;
      let detourX = robot.x;
      let detourY = robot.y;

      const tryDirections: Direction[] =
        direction === 'NORTH' || direction === 'SOUTH'
          ? ['EAST', 'WEST']
          : ['NORTH', 'SOUTH'];

      for (const d of tryDirections) {
        let tx = robot.x;
        let ty = robot.y;
        if (d === 'NORTH') ty -= 1;
        if (d === 'SOUTH') ty += 1;
        if (d === 'EAST') tx += 1;
        if (d === 'WEST') tx -= 1;

        if (tx < 0 || tx >= gridSize.width || ty < 0 || ty >= gridSize.height) continue;

        const isFree = !robots.some((r) => r.id !== robotId && r.x === tx && r.y === ty);
        if (isFree) {
          detourDirection = d;
          detourX = tx;
          detourY = ty;
          break;
        }
      }

      if (detourDirection) {
        get().addLog(
          'info',
          `${robot.name} çakışmayı önlemek için '${detourDirection}' yönüne otonom yan adım (Detour) attı.`
        );
        soundService.playStep();
        set((state) => ({
          robots: state.robots.map((r) =>
            r.id === robotId
              ? {
                  ...r,
                  x: detourX,
                  y: detourY,
                  direction: detourDirection!,
                  status: 'MOVING',
                  energy: Math.max(0, r.energy - 1),
                }
              : r
          ),
        }));
        return;
      }

      get().addLog('warn', `${robot.name} (${newX}, ${newY}) karesinde çakışma nedeniyle beklemede kaldı.`);
      return;
    }

    soundService.playStep();

    set((state) => {
      const newMoves = state.tutorialProgress.movesCount + 1;
      if (newMoves >= 3) {
        get().markTutorialStepCompleted(1);
      }

      return {
        tutorialProgress: { ...state.tutorialProgress, movesCount: newMoves },
        robots: state.robots.map((r) =>
          r.id === robotId
            ? {
                ...r,
                x: newX,
                y: newY,
                direction,
                status: 'MOVING',
                energy: Math.max(0, r.energy - 1),
              }
            : r
        ),
      };
    });
  },

  mineResource: (robotId, targetX, targetY) => {
    const { robots, resources } = get();
    const robot = robots.find((r) => r.id === robotId);
    if (!robot || robot.energy <= 0) return;

    // Check cargo capacity
    if (robot.cargoAmount >= robot.maxCargo) {
      get().addLog('warn', `${robot.name} kargo deposu tam dolu (${robot.cargoAmount}/${robot.maxCargo} kg)! Depoya boşaltması gerekiyor.`);
      return;
    }

    let tx = targetX;
    let ty = targetY;

    if (tx === undefined || ty === undefined) {
      let dx = 0;
      let dy = 0;
      switch (robot.direction) {
        case 'NORTH':
          dy = -1;
          break;
        case 'EAST':
          dx = 1;
          break;
        case 'SOUTH':
          dy = 1;
          break;
        case 'WEST':
          dx = -1;
          break;
      }
      tx = robot.x + dx;
      ty = robot.y + dy;
    }

    let targetNode = resources.find(
      (res) => res.x === tx && res.y === ty && res.amount > 0
    );

    if (!targetNode) {
      targetNode = resources.find(
        (res) => res.x === robot.x && res.y === robot.y && res.amount > 0
      );
      if (targetNode) {
        tx = robot.x;
        ty = robot.y;
      }
    }

    if (!targetNode) {
      get().addLog('warn', `${robot.name} kazı yapacak yakın bir maden bulamadı.`);
      return;
    }

    const availableCargoSpace = robot.maxCargo - robot.cargoAmount;
    const mineAmount = Math.min(targetNode.amount, Math.min(Math.round(10 * robot.miningSpeed), availableCargoSpace));

    if (mineAmount <= 0) {
      get().addLog('warn', `${robot.name} kargo alanı kalmadığı için kazı yapamadı.`);
      return;
    }

    set((state) => {
      const updatedResources = state.resources.map((res) =>
        res.id === targetNode!.id
          ? { ...res, amount: res.amount - mineAmount }
          : res
      );

      const updatedRobots = state.robots.map((r) =>
        r.id === robotId
          ? {
              ...r,
              x: tx!,
              y: ty!,
              status: 'MINING' as const,
              minedCount: r.minedCount + mineAmount,
              cargoAmount: r.cargoAmount + mineAmount,
              cargoSku: targetNode!.sku,
              energy: Math.max(0, r.energy - 2),
            }
          : r
      );

      const newMines = state.tutorialProgress.minesCount + 1;
      if (newMines >= 1) get().markTutorialStepCompleted(2);
      if (newMines >= 2) get().markTutorialStepCompleted(5);

      return {
        tutorialProgress: { ...state.tutorialProgress, minesCount: newMines },
        resources: updatedResources,
        robots: updatedRobots,
      };
    });

    soundService.playMining();
    get().addLog(
      'success',
      `${robot.name} [${targetNode.name}] madeninden ${mineAmount} birim ${targetNode.sku} kazdı ve kargosuna yükledi! (${robot.cargoAmount + mineAmount}/${robot.maxCargo} kg)`
    );
  },

  unloadCargo: (robotId) => {
    const { robots, inventory } = get();
    const robot = robots.find((r) => r.id === robotId);
    if (!robot || robot.cargoAmount <= 0 || !robot.cargoSku) return;

    const sku = robot.cargoSku;
    const amount = robot.cargoAmount;
    const currentInvCount = inventory[sku] || 0;

    set((state) => {
      const newUnloads = state.tutorialProgress.unloadsCount + 1;
      if (newUnloads >= 1) get().markTutorialStepCompleted(4);
      if (newUnloads >= 2) get().markTutorialStepCompleted(6);

      return {
        tutorialProgress: { ...state.tutorialProgress, unloadsCount: newUnloads },
        inventory: {
          ...state.inventory,
          [sku]: currentInvCount + amount,
        },
        robots: state.robots.map((r) =>
          r.id === robotId
            ? {
                ...r,
                cargoAmount: 0,
                cargoSku: undefined,
              }
            : r
        ),
      };
    });

    soundService.playUnload();
    get().addLog('success', `${robot.name} depoya ${amount} birim ${sku} boşalttı! Ana envantere aktarıldı.`);
  },

  rotateRobot: (robotId, direction) => {
    set((state) => ({
      robots: state.robots.map((r) =>
        r.id === robotId ? { ...r, direction } : r
      ),
    }));
  },

  compileAndRunScript: async () => {
    const state = get();
    const robot = state.robots.find((r) => r.id === state.selectedRobotId);
    if (!robot) return false;

    const result = await compileAndRunCSharp(
      robot.scriptCode || state.scriptCode || DEFAULT_C_SHARP_SCRIPT,
      {
        id: robot.id,
        name: robot.name,
        x: robot.x,
        y: robot.y,
        direction: robot.direction,
      },
      state.resources,
      state.gridSize,
      state.chargingStations
    );

    if (!result.success) {
      get().addLog('error', `Derleme Başarısız (${result.diagnostics.length} Hata):`);
      result.diagnostics.forEach((diag) => get().addLog('error', diag));
      set((prev) => ({
        robots: prev.robots.map((r) => (r.id === robot.id ? { ...r, status: 'ERROR' } : r)),
      }));
      return false;
    }

    result.logs.forEach((log) => {
      if (log.action === 'MINE') {
        let tx: number | undefined;
        let ty: number | undefined;
        try {
          if (log.payload && log.payload.startsWith('{')) {
            const parsed = JSON.parse(log.payload);
            tx = parsed.x;
            ty = parsed.y;
          }
        } catch {}
        get().mineResource(robot.id, tx, ty);
      } else if (log.action === 'MOVE') {
        get().moveRobot(robot.id, log.payload as Direction);
      }
    });

    return true;
  },

  stepTick: async () => {
    const state = get();
    const nextTick = state.tickCount + 1;
    set({ tickCount: nextTick });

    const currentRobots = get().robots;
    const currentResources = get().resources;
    const currentGridSize = get().gridSize;

    for (const robot of currentRobots) {
      if (robot.status === 'ERROR') continue;

      // 1. Check if robot is on a charging station
      const stationOnTile = state.chargingStations.find(
        (cs) => cs.x === robot.x && cs.y === robot.y
      );

      if (stationOnTile && robot.energy < robot.maxEnergy) {
        const newEnergy = Math.min(robot.maxEnergy, robot.energy + 30);
        set((prev) => {
          const newCharges = prev.tutorialProgress.chargesCount + 1;
          if (newCharges >= 1) get().markTutorialStepCompleted(3);

          return {
            tutorialProgress: { ...prev.tutorialProgress, chargesCount: newCharges },
            robots: prev.robots.map((r) =>
              r.id === robot.id
                ? {
                    ...r,
                    energy: newEnergy,
                    status: newEnergy >= robot.maxEnergy ? ('IDLE' as const) : ('CHARGING' as const),
                  }
                : r
            ),
          };
        });
        soundService.playCharging();
        get().addLog('info', `${robot.name} [${stationOnTile.name}] istasyonunda şarj oldu (+30 Enerji -> ${newEnergy}/${robot.maxEnergy})!`);
        if (newEnergy < robot.maxEnergy) continue;
      }

      // 2. Check if robot is on a Depot tile (Auto-Unload Cargo)
      const depotOnTile = state.depots.find(
        (d) => d.x === robot.x && d.y === robot.y
      );

      if (depotOnTile && robot.cargoAmount > 0) {
        get().unloadCargo(robot.id);
      }

      // 3. Run Robot's C# Script
      const codeToRun = robot.scriptCode || state.scriptCode || DEFAULT_C_SHARP_SCRIPT;

      const result = await compileAndRunCSharp(
        codeToRun,
        {
          id: robot.id,
          name: robot.name,
          x: robot.x,
          y: robot.y,
          direction: robot.direction,
          energy: robot.energy,
          maxEnergy: robot.maxEnergy,
          cargoAmount: robot.cargoAmount,
          maxCargo: robot.maxCargo,
        },
        currentResources,
        currentGridSize,
        state.chargingStations,
        state.depots
      );

      if (!result.success) {
        get().addLog('error', `Roslyn Derleme Hatası (${robot.name}):`);
        result.diagnostics.forEach((diag) => get().addLog('error', diag));
        set((prev) => ({
          robots: prev.robots.map((r) => (r.id === robot.id ? { ...r, status: 'ERROR' as const } : r)),
        }));
        continue;
      }

      result.logs.forEach((log) => {
        if (log.action === 'MINE') {
          let tx: number | undefined;
          let ty: number | undefined;
          try {
            if (log.payload && log.payload.startsWith('{')) {
              const parsed = JSON.parse(log.payload);
              tx = parsed.x;
              ty = parsed.y;
            }
          } catch {}
          get().mineResource(robot.id, tx, ty);
        } else if (log.action === 'MOVE') {
          get().moveRobot(robot.id, log.payload as Direction);
        }
      });
    }
  },

  resetGame: () => {
    set({
      credits: 500,
      robots: INITIAL_ROBOTS,
      resources: INITIAL_RESOURCES,
      chargingStations: INITIAL_CHARGING_STATIONS,
      depots: INITIAL_DEPOTS,
      inventory: INITIAL_INVENTORY,
      tickCount: 0,
      isRunning: false,
      logs: [
        {
          id: `log-reset-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'warn',
          message: 'Simülasyon sıfırlandı. Tüm robotlar, depolar ve madenler varsayılan konuma getirildi.',
        },
      ],
    });
  },
}));
