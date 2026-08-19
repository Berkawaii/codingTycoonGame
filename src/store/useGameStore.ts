import { create } from 'zustand';
import {
  Direction,
  Robot,
  ResourceNode,
  GridSize,
  ChargingStation,
  Depot,
  GameLog,
  InventoryMap,
  BiomeType,
  HazardTile,
  BiomeMapState,
  Smelter,
  Refinery,
  PowerPlant,
  RadioMessage,
  BanditRobot,
  TurretBuilding,
  HazardEvent,
} from '../types/game';
import { DEFAULT_C_SHARP_SCRIPT, DEFAULT_POWER_PLANT_C_SHARP_SCRIPT, DEFAULT_TRANSPORTER_C_SHARP_SCRIPT, DEFAULT_REPAIR_DRONE_C_SHARP_SCRIPT, SKU_CATALOG } from '../constants/skus';
import { compileAndRunCSharp, compileAndRunPowerPlantCSharp } from '../services/wasmRunner';
import { soundService } from '../services/soundService';
import { logoutUser, saveGameStateToFirestore, fetchGameStateFromFirestore, auth } from '../services/firebaseService';
import { BIOME_CATALOG } from '../constants/biomes';
import { generateBiomeMap, generateSingleRespawnResource, populateExpandedZone } from '../services/mapGenerator';
import { translations, TranslationKey, Language } from '../i18n/translations';

interface GameState {
  gridSize: GridSize;
  credits: number;
  robots: Robot[];
  resources: ResourceNode[];
  chargingStations: ChargingStation[];
  depots: Depot[];
  smelters: Smelter[];
  refineries: Refinery[];
  powerPlants: PowerPlant[];
  inventory: InventoryMap;
  selectedRobotId: string;
  scriptCode: string;
  powerPlantScriptCode: string;
  isRunning: boolean;
  tickRate: number; // in milliseconds
  tickCount: number;
  logs: GameLog[];
  isApiModalOpen: boolean;
  isAcademyModalOpen: boolean;
  editorSizeMode: 'normal' | 'expanded' | 'hidden';
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;

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
  // Phase 5: Biome, Multi-Map Travel & Hazard System
  currentBiome: BiomeType;
  unlockedBiomes: BiomeType[];
  hazardTiles: HazardTile[];
  biomeMaps: Partial<Record<BiomeType, BiomeMapState>>;
  unlockBiome: (biome: BiomeType) => boolean;
  switchBiome: (biome: BiomeType) => void;
  generateNewSeedMap: (seed?: string) => void;
  transferRobotToBiome: (robotId: string, targetBiome: BiomeType) => void;
  expandMapGridSize: (biome?: BiomeType) => boolean;

  // Actions
  setSelectedRobotId: (id: string) => void;
  setScriptCode: (code: string) => void;
  setPowerPlantScriptCode: (code: string) => void;
  setIsRunning: (running: boolean) => void;
  toggleRunning: () => void;
  setTickRate: (rate: number) => void;
  setApiModalOpen: (open: boolean) => void;
  setAcademyModalOpen: (open: boolean) => void;
  setEditorSizeMode: (mode: 'normal' | 'expanded' | 'hidden') => void;
  addLog: (level: GameLog['level'], message: string) => void;
  clearLogs: () => void;
  
  // Tycoon Economy Actions
  sellResource: (sku: string, amount?: number) => void;
  sellAllResources: () => void;
  buyRobot: (name: string, color: string, price: number) => boolean;
  buyChargingStation: (name: string, x: number, y: number, price: number) => boolean;
  buyDepot: (name: string, x: number, y: number, price: number) => boolean;
  buySmelter: (name: string, x: number, y: number, price?: number) => boolean;
  buyRefinery: (name: string, x: number, y: number, price?: number) => boolean;
  buyPowerPlant: (name: string, x: number, y: number, price?: number) => boolean;
  upgradeRobotStat: (robotId: string, statType: 'radar' | 'battery' | 'mining' | 'cargo', price: number) => boolean;
  buyEmergencyCharge: (robotId: string, price: number) => boolean;

  // Phase 6: Factory Automation Actions
  depositRawMaterial: (robotId: string) => boolean;
  processMaterial: (robotId: string) => boolean;
  collectProcessedProduct: (robotId: string) => boolean;
  burnPowerPlantFuel: (plantId: string, fuelSku: string) => boolean;

  // Phase 7/8: Transporter Carrier & Radio Swarm Actions
  radioMessages: RadioMessage[];
  buyTransporterRobot: (name: string, color: string) => boolean;
  sendRadioMessage: (robotId: string, messageType: string, x: number, y: number, payload?: string) => void;
  collectCargoFromRobot: (transporterId: string, targetMinerId?: string) => boolean;
  transferCargoToRobot: (minerId: string, targetTransporterId?: string) => boolean;

  // Phase 9: Environmental Hazards & Defense System
  activeBandits?: BanditRobot[];
  turrets?: TurretBuilding[];
  activeHazard?: HazardEvent | null;
  buyRepairDrone: (name?: string, color?: string) => boolean;
  buyTurret: (x: number, y: number) => boolean;
  upgradeTurretRange: (turretId: string) => boolean;
  upgradeTurretDamage: (turretId: string) => boolean;
  repairRobot: (droneId: string, targetId: string) => void;
  coolPowerPlant: (droneId: string, plantId: string) => void;

  // User Auth & Anonymous Session State
  authUser: any | null;
  userRole: 'admin' | 'user';
  isAnonymousPlayer: boolean;
  userDisplayName: string;
  startAnonymousSession: () => void;
  logout: () => Promise<void>;
  loadGameStateFromCloud: (userId: string) => Promise<void>;
  saveGameStateToCloud: () => Promise<void>;
  
  // Admin & Simulation Testing Console Actions
  isAdminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  isLeaderboardOpen: boolean;
  setLeaderboardOpen: (open: boolean) => void;
  isMarketplaceOpen: boolean;
  setMarketplaceOpen: (open: boolean) => void;
  isWelcomeOpen: boolean;
  setWelcomeOpen: (open: boolean) => void;
  addCredits: (amount: number) => void;
  spawnBandit: (x?: number, y?: number) => void;
  clearBandits: () => void;
  triggerHazard: (type?: 'DUST_STORM' | 'VOLCANIC_ERUPTION' | 'QUANTUM_FLARE' | 'BLIZZARD') => void;
  clearHazard: () => void;
  healAllRobots: () => void;
  coolAllPowerPlants: () => void;
  fillAllDepots: () => void;

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

const INITIAL_CHARGING_STATIONS: ChargingStation[] = [];
const INITIAL_DEPOTS: Depot[] = [];
const INITIAL_ROBOTS: Robot[] = [];

const INITIAL_RESOURCES: ResourceNode[] = [
  { id: 'res-1', x: 5, y: 3, type: 'IRON_ORE', sku: 'SKU-IRON-01', amount: 150, maxAmount: 150, name: 'Demir Damarı Alpha', rarity: 'COMMON' },
  { id: 'res-2', x: 5, y: 4, type: 'IRON_ORE', sku: 'SKU-IRON-01', amount: 200, maxAmount: 200, name: 'Demir Damarı Beta', rarity: 'COMMON' },
  { id: 'res-3', x: 8, y: 8, type: 'COPPER_ORE', sku: 'SKU-COPPER-01', amount: 120, maxAmount: 120, name: 'Bakır Yuvası #1', rarity: 'UNCOMMON' },
  { id: 'res-4', x: 14, y: 10, type: 'GOLD_ORE', sku: 'SKU-GOLD-01', amount: 60, maxAmount: 60, name: 'Nadir Altın Yatağı', rarity: 'RARE' },
  { id: 'res-5', x: 17, y: 16, type: 'CRYSTAL', sku: 'SKU-CRYSTAL-01', amount: 30, maxAmount: 30, name: 'Kuantum Kristali', rarity: 'LEGENDARY' },
  { id: 'res-6', x: 12, y: 2, type: 'IRON_ORE', sku: 'SKU-IRON-01', amount: 180, maxAmount: 180, name: 'Kuzey Demir Damarı', rarity: 'COMMON' },
  { id: 'res-7', x: 2, y: 5, type: 'IRON_ORE', sku: 'COAL_ORE', amount: 250, maxAmount: 250, name: 'Zengin Kömür Yatağı #1', rarity: 'COMMON' },
  { id: 'res-8', x: 3, y: 5, type: 'IRON_ORE', sku: 'COAL_ORE', amount: 250, maxAmount: 250, name: 'Zengin Kömür Yatağı #2', rarity: 'COMMON' },
];

const INITIAL_INVENTORY: InventoryMap = {
  'SKU-IRON-01': 24,
  'COAL_ORE': 30,
  'SKU-COPPER-01': 10,
  'SKU-GOLD-01': 2,
  'SKU-CRYSTAL-01': 0,
};

const getMapDataForBiome = (state: GameState, biome: BiomeType) => {
  if (biome === state.currentBiome) {
    return {
      gridSize: state.gridSize,
      resources: state.resources,
      chargingStations: state.chargingStations,
      depots: state.depots,
      smelters: state.smelters || [],
      refineries: state.refineries || [],
      powerPlants: state.powerPlants || [],
      hazardTiles: state.hazardTiles,
    };
  } else {
    const mapState = state.biomeMaps[biome] || generateBiomeMap(biome);
    return {
      gridSize: mapState.gridSize || INITIAL_GRID_SIZE,
      resources: mapState.resources || [],
      chargingStations: mapState.chargingStations || [],
      depots: mapState.depots || [],
      smelters: mapState.smelters || [],
      refineries: mapState.refineries || [],
      powerPlants: mapState.powerPlants || [],
      hazardTiles: mapState.hazardTiles || [],
    };
  }
};

const updateMapDataForBiome = (
  state: GameState,
  biome: BiomeType,
  updater: (map: BiomeMapState) => Partial<BiomeMapState>
): Partial<GameState> => {
  const isCurrent = biome === state.currentBiome;
  const currentMap: BiomeMapState = isCurrent
    ? {
        biome,
        name: BIOME_CATALOG[biome]?.name || 'Harita',
        seed: state.biomeMaps[biome]?.seed || 'SEED_ACTIVE',
        gridSize: state.gridSize,
        resources: state.resources,
        chargingStations: state.chargingStations,
        depots: state.depots,
        smelters: state.smelters || [],
        refineries: state.refineries || [],
        powerPlants: state.powerPlants || [],
        hazardTiles: state.hazardTiles,
      }
    : state.biomeMaps[biome] || generateBiomeMap(biome);

  const updated = updater(currentMap);
  const updatedMapState: BiomeMapState = { ...currentMap, ...updated };

  if (isCurrent) {
    return {
      gridSize: updatedMapState.gridSize,
      resources: updatedMapState.resources,
      chargingStations: updatedMapState.chargingStations,
      depots: updatedMapState.depots,
      smelters: updatedMapState.smelters || [],
      refineries: updatedMapState.refineries || [],
      powerPlants: updatedMapState.powerPlants || [],
      hazardTiles: updatedMapState.hazardTiles,
      biomeMaps: {
        ...state.biomeMaps,
        [biome]: updatedMapState,
      },
    };
  } else {
    return {
      biomeMaps: {
        ...state.biomeMaps,
        [biome]: updatedMapState,
      },
    };
  }
};

export const useGameStore = create<GameState>()((set, get) => ({
  gridSize: INITIAL_GRID_SIZE,
  credits: 1500,
  robots: INITIAL_ROBOTS,
  resources: INITIAL_RESOURCES,
  chargingStations: INITIAL_CHARGING_STATIONS,
  depots: INITIAL_DEPOTS,
  smelters: [],
  refineries: [],
  powerPlants: [],
  radioMessages: [],
  activeBandits: [],
  turrets: [],
  activeHazard: null,
  inventory: INITIAL_INVENTORY,
  selectedRobotId: '',
  scriptCode: DEFAULT_C_SHARP_SCRIPT,
  powerPlantScriptCode: DEFAULT_POWER_PLANT_C_SHARP_SCRIPT,
  isRunning: false,
  tickRate: 500,
  tickCount: 0,
  language: (localStorage.getItem('syntax_factory_lang') as Language) || 'tr',
  setLanguage: (lang: Language) => {
    localStorage.setItem('syntax_factory_lang', lang);
    set({ language: lang });
  },
  t: (key: TranslationKey, params?: Record<string, string | number>) => {
    const lang = get().language || 'tr';
    let text: string = translations[lang]?.[key] || translations['tr'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  },
  // Auth & User Profile State
  authUser: null,
  userRole: 'user',
  isAnonymousPlayer: !localStorage.getItem('syntax_factory_user_id'),
  userDisplayName: localStorage.getItem('syntax_factory_user_name') || 'Mühendis Oyuncu',

  startAnonymousSession: () => {
    let anonName = localStorage.getItem('syntax_factory_user_name');
    let anonId = localStorage.getItem('syntax_factory_user_id');

    if (!anonId) {
      anonId = `anon-${Math.floor(1000 + Math.random() * 9000)}`;
      anonName = `Anonim_Mühendis_${Math.floor(100 + Math.random() * 900)}`;
      localStorage.setItem('syntax_factory_user_id', anonId);
      localStorage.setItem('syntax_factory_user_name', anonName);
    }

    set({
      isAnonymousPlayer: true,
      userDisplayName: anonName || 'Anonim Mühendis',
      isWelcomeOpen: false,
    });
    get().addLog('info', `[OTURUM]: '${anonName}' çağrı adıyla Anonim Misafir Seansı başlatıldı. Skor kaydedilebilir, Cloud Save için Giriş Yapın.`);
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch {}
    localStorage.removeItem('syntax_factory_user_id');
    localStorage.removeItem('syntax_factory_user_name');
    set({
      authUser: null,
      isAnonymousPlayer: true,
      userDisplayName: 'Mühendis Oyuncu',
      isWelcomeOpen: true,
    });
    get().addLog('info', '[OTURUM]: Oturum kapatıldı.');
  },

  saveGameStateToCloud: async () => {
    const user = auth.currentUser;
    const userId = user?.uid || localStorage.getItem('syntax_factory_user_id');
    if (!userId) return;

    const state = get();
    const stateToSave = {
      credits: state.credits,
      robots: state.robots,
      resources: state.resources,
      chargingStations: state.chargingStations,
      depots: state.depots,
      smelters: state.smelters,
      refineries: state.refineries,
      powerPlants: state.powerPlants,
      turrets: state.turrets,
      inventory: state.inventory,
      unlockedBiomes: state.unlockedBiomes,
      currentBiome: state.currentBiome,
      biomeMaps: state.biomeMaps,
      scriptCode: state.scriptCode,
      powerPlantScriptCode: state.powerPlantScriptCode,
      isTutorialModeActive: state.isTutorialModeActive,
      tutorialStepIndex: state.tutorialStepIndex,
      tutorialCompleted: state.tutorialCompleted,
      tutorialProgress: state.tutorialProgress,
    };

    await saveGameStateToFirestore(userId, stateToSave);
  },

  loadGameStateFromCloud: async (userId: string) => {
    if (!userId) return;
    const cloudData = await fetchGameStateFromFirestore(userId);
    if (cloudData) {
      set((state) => ({
        credits: typeof cloudData.credits === 'number' ? cloudData.credits : state.credits,
        robots: Array.isArray(cloudData.robots) ? cloudData.robots : state.robots,
        resources: Array.isArray(cloudData.resources) ? cloudData.resources : state.resources,
        chargingStations: Array.isArray(cloudData.chargingStations) ? cloudData.chargingStations : state.chargingStations,
        depots: Array.isArray(cloudData.depots) ? cloudData.depots : state.depots,
        smelters: Array.isArray(cloudData.smelters) ? cloudData.smelters : state.smelters,
        refineries: Array.isArray(cloudData.refineries) ? cloudData.refineries : state.refineries,
        powerPlants: Array.isArray(cloudData.powerPlants) ? cloudData.powerPlants : state.powerPlants,
        turrets: Array.isArray(cloudData.turrets) ? cloudData.turrets : state.turrets,
        inventory: cloudData.inventory || state.inventory,
        unlockedBiomes: Array.isArray(cloudData.unlockedBiomes) ? cloudData.unlockedBiomes : state.unlockedBiomes,
        currentBiome: cloudData.currentBiome || state.currentBiome,
        biomeMaps: cloudData.biomeMaps || state.biomeMaps,
        scriptCode: cloudData.scriptCode || state.scriptCode,
        powerPlantScriptCode: cloudData.powerPlantScriptCode || state.powerPlantScriptCode,
        isTutorialModeActive: typeof cloudData.isTutorialModeActive === 'boolean' ? cloudData.isTutorialModeActive : state.isTutorialModeActive,
        tutorialStepIndex: typeof cloudData.tutorialStepIndex === 'number' ? cloudData.tutorialStepIndex : state.tutorialStepIndex,
        tutorialCompleted: Array.isArray(cloudData.tutorialCompleted) ? cloudData.tutorialCompleted : state.tutorialCompleted,
        tutorialProgress: cloudData.tutorialProgress || state.tutorialProgress,
      }));
      get().addLog('success', '☁️ [CLOUD SYNCRONIZED]: Tüm fabrika durumu, madenler, C# Akademi ilerlemesi ve betikler Cloud Firestore sunucusundan senkronize edildi.');
    }
  },

  isApiModalOpen: false,
  isAdminModalOpen: false,
  isLeaderboardOpen: false,
  isMarketplaceOpen: false,
  isWelcomeOpen: true,
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Syntax Factory C# Otomasyon Motoru Başlatıldı.',
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      message: 'Test modu için başlangıç bakiye $99,999 tanımlandı. Tüm biyomlar ve yükseltmeler test edilebilir.',
    },
  ],
  // Phase 5 Biomes & Multi-Map Travel State
  currentBiome: 'MARS_BASIN',
  unlockedBiomes: ['MARS_BASIN'],
  hazardTiles: [],
  biomeMaps: {
    MARS_BASIN: {
      biome: 'MARS_BASIN',
      name: 'Mars Çöl Havzası',
      seed: 'SEED_INITIAL',
      gridSize: INITIAL_GRID_SIZE,
      resources: INITIAL_RESOURCES,
      chargingStations: INITIAL_CHARGING_STATIONS,
      depots: INITIAL_DEPOTS,
      hazardTiles: [],
    },
  },

  unlockBiome: (biome) => {
    const { unlockedBiomes, credits, biomeMaps } = get();
    if (unlockedBiomes.includes(biome)) return true;

    const def = BIOME_CATALOG[biome];
    if (!def || credits < def.unlockPrice) return false;

    const newCredits = credits - def.unlockPrice;
    const newMapState = generateBiomeMap(biome, `SEED_${Date.now()}`);
    const updatedUnlocked = [...unlockedBiomes, biome];
    const updatedMaps = { ...biomeMaps, [biome]: newMapState };

    set({
      credits: newCredits,
      unlockedBiomes: updatedUnlocked,
      biomeMaps: updatedMaps,
    });

    soundService.playPurchase();
    get().addLog('success', `🎉 [BİYOM AÇILDI]: ${def.name} haritası $${def.unlockPrice.toLocaleString()} karşılığında açıldı! Harita seçiciden seyahat edebilirsiniz.`);
    return true;
  },

  switchBiome: (targetBiome) => {
    const { currentBiome, unlockedBiomes, biomeMaps, resources, chargingStations, depots, hazardTiles, gridSize } = get();
    if (!unlockedBiomes.includes(targetBiome) || targetBiome === currentBiome) return;

    // 1. Save current map state (Buildings & Resources stay on current map)
    const currentMapState: BiomeMapState = {
      biome: currentBiome,
      name: BIOME_CATALOG[currentBiome].name,
      seed: biomeMaps[currentBiome]?.seed || 'SEED_PREV',
      gridSize,
      resources,
      chargingStations,
      depots,
      hazardTiles,
    };

    // 2. Retrieve or generate target map state
    let targetMapState = biomeMaps[targetBiome];
    if (!targetMapState) {
      targetMapState = generateBiomeMap(targetBiome, `SEED_${Date.now()}`);
    }

    const updatedMaps = {
      ...biomeMaps,
      [currentBiome]: currentMapState,
      [targetBiome]: targetMapState,
    };

    // 3. Switch active map state (Robots travel with player to target map!)
    set({
      currentBiome: targetBiome,
      resources: targetMapState.resources,
      chargingStations: targetMapState.chargingStations,
      depots: targetMapState.depots,
      hazardTiles: targetMapState.hazardTiles,
      biomeMaps: updatedMaps,
    });

    soundService.playPurchase();
    get().addLog('info', `🌍 [HARİTA SEYAHATİ]: ${targetMapState.name} haritasına geçiş yapıldı. Robot filonuz yeni haritada göreve başladı!`);
  },

  generateNewSeedMap: (customSeed) => {
    const { currentBiome } = get();
    const seed = customSeed || `SEED_${Date.now()}`;
    const newMapState = generateBiomeMap(currentBiome, seed);

    set((state) => ({
      resources: newMapState.resources,
      chargingStations: newMapState.chargingStations,
      depots: newMapState.depots,
      hazardTiles: newMapState.hazardTiles,
      biomeMaps: {
        ...state.biomeMaps,
        [currentBiome]: newMapState,
      },
    }));

    get().addLog('info', `🌱 [PROSEDÜREL HARİTA]: ${newMapState.name} haritası '${seed}' tohumu (seed) ile yeniden oluşturuldu.`);
  },

  transferRobotToBiome: (robotId, targetBiome) => {
    const { robots, unlockedBiomes } = get();
    if (!unlockedBiomes.includes(targetBiome)) return;

    const robot = robots.find((r) => r.id === robotId);
    if (!robot) return;

    set((state) => ({
      robots: state.robots.map((r) =>
        r.id === robotId ? { ...r, biomeId: targetBiome, x: 2, y: 2 } : r
      ),
    }));

    soundService.playPurchase();
    get().addLog('info', `🛩️ [ROBOT TRANSFERİ]: ${robot.name} robotu '${BIOME_CATALOG[targetBiome].name}' haritasına transfer edildi.`);
  },

  expandMapGridSize: (targetBiome) => {
    const { currentBiome, credits, gridSize, biomeMaps } = get();
    const biome = targetBiome || currentBiome;
    const currentSize = biomeMaps[biome]?.gridSize?.width || gridSize.width || 20;

    let upgradeCost = 3000;
    let nextSize = 30;

    if (currentSize === 30) {
      upgradeCost = 8000;
      nextSize = 40;
    } else if (currentSize === 40) {
      upgradeCost = 18000;
      nextSize = 50;
    } else if (currentSize >= 50) {
      get().addLog('warn', `Harita zaten maksimum boyutta (50x50).`);
      return false;
    }

    if (credits < upgradeCost) {
      get().addLog('error', `Yetersiz bakiye! Haritayı ${nextSize}x${nextSize} boyutuna büyütmek için $${upgradeCost.toLocaleString()} gerekiyor.`);
      return false;
    }

    const newGridSize: GridSize = { width: nextSize, height: nextSize };

    set((state) => {
      const isCurrent = biome === state.currentBiome;
      const currentBiomeState = state.biomeMaps[biome] || generateBiomeMap(biome);

      const activeResources = isCurrent ? state.resources : (currentBiomeState.resources || []);
      const activeHazards = isCurrent ? state.hazardTiles : (currentBiomeState.hazardTiles || []);

      const mapDataForGen: BiomeMapState = {
        ...currentBiomeState,
        gridSize: { width: currentSize, height: currentSize },
        resources: activeResources,
        hazardTiles: activeHazards,
      };

      const { newResources, newHazardTiles } = populateExpandedZone(
        biome,
        { width: currentSize, height: currentSize },
        newGridSize,
        mapDataForGen,
        `EXPAND_${nextSize}_${Date.now()}`
      );

      const combinedResources = [...activeResources, ...newResources];
      const combinedHazards = [...activeHazards, ...newHazardTiles];

      const updatedBiomeState: BiomeMapState = {
        ...currentBiomeState,
        gridSize: newGridSize,
        resources: combinedResources,
        hazardTiles: combinedHazards,
      };

      return {
        credits: state.credits - upgradeCost,
        gridSize: isCurrent ? newGridSize : state.gridSize,
        resources: isCurrent ? combinedResources : state.resources,
        hazardTiles: isCurrent ? combinedHazards : state.hazardTiles,
        biomeMaps: {
          ...state.biomeMaps,
          [biome]: updatedBiomeState,
        },
      };
    });

    soundService.playPurchase();
    get().addLog('success', `🧱 [HARİTA BÜYÜTÜLDÜ]: ${BIOME_CATALOG[biome].name} haritası ${nextSize}x${nextSize} boyutuna genişletildi! Yeni bölgede +${10} zengin maden damarı ve +${12} tehlike karosu belirdi! (-$${upgradeCost.toLocaleString()})`);
    return true;
  },

  isAcademyModalOpen: false,
  editorSizeMode: 'normal',
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

  markTutorialStepCompleted: (stepId: number) => {
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
  setAcademyModalOpen: (open) => set({ isAcademyModalOpen: open }),
  setEditorSizeMode: (mode) => set({ editorSizeMode: mode }),

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
    const { credits, robots, currentBiome } = get();
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
      biomeId: currentBiome,
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

  buyTransporterRobot: (name, color) => {
    const { credits, robots, currentBiome } = get();
    const price = 4000;
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! ${name} Lojistik Transporter satın almak için $${price.toLocaleString()} gerekiyor.`);
      return false;
    }

    const newRobotId = `transporter-${robots.length + 1}`;
    const newRobot: Robot = {
      id: newRobotId,
      name,
      x: 0,
      y: 0,
      direction: 'EAST',
      status: 'IDLE',
      color,
      energy: 120,
      maxEnergy: 120,
      minedCount: 0,
      miningSpeed: 1,
      miningLevel: 1,
      batteryLevel: 1,
      radarRange: 7,
      radarLevel: 1,
      cargoAmount: 0,
      maxCargo: 200, // 200kg high capacity!
      cargoLevel: 1,
      role: 'TRANSPORTER',
      canMine: false, // Cannot mine
      moveSpeed: 2, // 2x speed!
      scriptName: `${name.replace(/\s+/g, '')}.cs`,
      scriptCode: DEFAULT_TRANSPORTER_C_SHARP_SCRIPT,
      biomeId: currentBiome,
    };

    set((state) => ({
      credits: state.credits - price,
      robots: [...state.robots, newRobot],
      selectedRobotId: newRobotId,
      scriptCode: DEFAULT_TRANSPORTER_C_SHARP_SCRIPT,
    }));

    soundService.playPurchase();
    get().addLog('success', `🚚 [LOJİSTİK TRANSPORT ER]: Yeni Kargocu Robot '${name}' (200kg Kargo, 2x Hız) $${price.toLocaleString()} ile filoya katıldı!`);
    return true;
  },

  sendRadioMessage: (robotId, messageType, x, y, payload) => {
    const { robots } = get();
    const sender = robots.find((r) => r.id === robotId);
    if (!sender) return;

    const newMsg: RadioMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      senderId: robotId,
      senderName: sender.name,
      messageType,
      x,
      y,
      payload,
      timestamp: Date.now(),
    };

    set((state) => ({
      radioMessages: [newMsg, ...(state.radioMessages || [])].slice(0, 30),
    }));

    get().addLog('info', get().language === 'en'
      ? `📡 [RADIO BROADCAST]: ${sender.name} broadcasted '${messageType}' radio signal on frequency! (${x}, ${y})`
      : `📡 [RADYO YAYINI]: ${sender.name} şebekeye '${messageType}' radyo sinyali yaydı! (${x}, ${y})`);
  },

  collectCargoFromRobot: (transporterId, targetMinerId) => {
    const { robots } = get();
    const transporter = robots.find((r) => r.id === transporterId);
    if (!transporter) return false;

    const miner = targetMinerId
      ? robots.find((r) => r.id === targetMinerId)
      : robots.find(
          (r) =>
            r.id !== transporterId &&
            r.cargoAmount > 0 &&
            Math.abs(r.x - transporter.x) <= 1 &&
            Math.abs(r.y - transporter.y) <= 1
        );

    if (!miner || miner.cargoAmount <= 0) {
      get().addLog('warn', `${transporter.name} etrafında kargosu dolu madenci bulunamadı.`);
      return false;
    }

    const availableSpace = transporter.maxCargo - transporter.cargoAmount;
    if (availableSpace <= 0) {
      get().addLog('warn', `${transporter.name} kargo haznesi tamamen dolu (${transporter.cargoAmount}/${transporter.maxCargo} kg).`);
      return false;
    }

    const amountTransferred = Math.min(miner.cargoAmount, availableSpace);
    const cargoSku = miner.cargoSku || 'FE_ORE';
    const newMinerCargo = miner.cargoAmount - amountTransferred;

    set((state) => ({
      robots: state.robots.map((r) => {
        if (r.id === miner.id) {
          return {
            ...r,
            cargoAmount: newMinerCargo,
            cargoSku: newMinerCargo > 0 ? r.cargoSku : undefined,
          };
        }
        if (r.id === transporter.id) {
          return {
            ...r,
            cargoAmount: r.cargoAmount + amountTransferred,
            cargoSku: cargoSku,
          };
        }
        return r;
      }),
    }));

    soundService.playUnload();
    get().addLog(
      'success',
      `🚚 [SAHADA KARGO DEVRİ]: ${transporter.name}, ${miner.name} robottan ${amountTransferred} kg ${cargoSku} devraldı! Madenci kesintisiz kazıya devam ediyor.`
    );
    return true;
  },

  transferCargoToRobot: (minerId, targetTransporterId) => {
    return get().collectCargoFromRobot(targetTransporterId || '', minerId);
  },

  buyChargingStation: (name, x, y, price) => {
    const { credits, chargingStations, gridSize } = get();
    const actualPrice = chargingStations.length === 0 ? 0 : price;

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
    const actualPrice = depots.length === 0 ? 0 : price;

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

  buySmelter: (name, x, y, price = 5000) => {
    const { credits, currentBiome, gridSize, resources, chargingStations, depots, smelters = [], refineries = [], hazardTiles } = get();
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! Dökümhane (2x2) inşası için $${price.toLocaleString()} gerekiyor.`);
      return false;
    }

    if (x < 0 || y < 0 || x + 1 >= gridSize.width || y + 1 >= gridSize.height) {
      get().addLog('error', `Geçersiz konum! Dökümhane (2x2) harita sınırları dışına çıkamaz.`);
      return false;
    }

    const tilesToOccupy = [`${x},${y}`, `${x+1},${y}`, `${x},${y+1}`, `${x+1},${y+1}`];

    const occupied = new Set<string>();
    resources.forEach((r) => occupied.add(`${r.x},${r.y}`));
    chargingStations.forEach((c) => occupied.add(`${c.x},${c.y}`));
    depots.forEach((d) => occupied.add(`${d.x},${d.y}`));
    hazardTiles.forEach((h) => occupied.add(`${h.x},${h.y}`));

    smelters.forEach((s) => {
      occupied.add(`${s.x},${s.y}`); occupied.add(`${s.x+1},${s.y}`);
      occupied.add(`${s.x},${s.y+1}`); occupied.add(`${s.x+1},${s.y+1}`);
    });

    refineries.forEach((rf) => {
      occupied.add(`${rf.x},${rf.y}`); occupied.add(`${rf.x+1},${rf.y}`);
      occupied.add(`${rf.x},${rf.y+1}`); occupied.add(`${rf.x+1},${rf.y+1}`);
    });

    if (tilesToOccupy.some((t) => occupied.has(t))) {
      get().addLog('error', `Seçilen 2x2 alanda başka bir nesne veya maden var. Dökümhane inşa edilemedi.`);
      return false;
    }

    const newSmelter: Smelter = {
      id: `smelter-${Date.now()}`,
      x,
      y,
      name,
      width: 2,
      height: 2,
      inputBuffer: {},
      outputBuffer: {},
    };

    set((state) => ({
      ...updateMapDataForBiome(state, currentBiome, (map) => ({
        smelters: [...(map.smelters || []), newSmelter],
      })),
      credits: state.credits - price,
    }));

    soundService.playPurchase();
    get().addLog('success', `🏭 [DÖKÜMHANE İNŞA EDİLDİ]: '${name}' (2x2) (${x}, ${y}) konumunda kuruldu! (-$${price.toLocaleString()})`);
    return true;
  },

  buyRefinery: (name, x, y, price = 12000) => {
    const { credits, currentBiome, gridSize, resources, chargingStations, depots, smelters = [], refineries = [], hazardTiles } = get();
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! Rafineri (2x2) inşası için $${price.toLocaleString()} gerekiyor.`);
      return false;
    }

    if (x < 0 || y < 0 || x + 1 >= gridSize.width || y + 1 >= gridSize.height) {
      get().addLog('error', `Geçersiz konum! Rafineri (2x2) harita sınırları dışına çıkamaz.`);
      return false;
    }

    const tilesToOccupy = [`${x},${y}`, `${x+1},${y}`, `${x},${y+1}`, `${x+1},${y+1}`];

    const occupied = new Set<string>();
    resources.forEach((r) => occupied.add(`${r.x},${r.y}`));
    chargingStations.forEach((c) => occupied.add(`${c.x},${c.y}`));
    depots.forEach((d) => occupied.add(`${d.x},${d.y}`));
    hazardTiles.forEach((h) => occupied.add(`${h.x},${h.y}`));

    smelters.forEach((s) => {
      occupied.add(`${s.x},${s.y}`); occupied.add(`${s.x+1},${s.y}`);
      occupied.add(`${s.x},${s.y+1}`); occupied.add(`${s.x+1},${s.y+1}`);
    });

    refineries.forEach((rf) => {
      occupied.add(`${rf.x},${rf.y}`); occupied.add(`${rf.x+1},${rf.y}`);
      occupied.add(`${rf.x},${rf.y+1}`); occupied.add(`${rf.x+1},${rf.y+1}`);
    });

    if (tilesToOccupy.some((t) => occupied.has(t))) {
      get().addLog('error', `Seçilen 2x2 alanda başka bir nesne veya maden var. Rafineri inşa edilemedi.`);
      return false;
    }

    const newRefinery: Refinery = {
      id: `refinery-${Date.now()}`,
      x,
      y,
      name,
      width: 2,
      height: 2,
      inputBuffer: {},
      outputBuffer: {},
    };

    set((state) => ({
      ...updateMapDataForBiome(state, currentBiome, (map) => ({
        refineries: [...(map.refineries || []), newRefinery],
      })),
      credits: state.credits - price,
    }));

    soundService.playPurchase();
    get().addLog('success', `🧪 [RAFİNERİ İNŞA EDİLDİ]: '${name}' (2x2) (${x}, ${y}) konumunda kuruldu! (-$${price.toLocaleString()})`);
    return true;
  },

  setPowerPlantScriptCode: (code) => set({ powerPlantScriptCode: code }),

  buyPowerPlant: (name, x, y, price = 8000) => {
    const { credits, currentBiome, gridSize, resources, chargingStations, depots, smelters = [], refineries = [], powerPlants = [], hazardTiles } = get();
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! Santral inşası için $${price.toLocaleString()} gerekiyor.`);
      return false;
    }

    if (x < 0 || y < 0 || x >= gridSize.width || y >= gridSize.height) {
      get().addLog('error', `Geçersiz konum! Santral harita sınırları dışına çıkamaz.`);
      return false;
    }

    const linkedStation = chargingStations.find(
      (cs) => Math.abs(cs.x - x) + Math.abs(cs.y - y) === 1
    );

    if (!linkedStation) {
      get().addLog('error', `❌ [KOMŞULUK UYARISI]: Santral SADECE bir Şarj İstasyonunun hemen bitişik komşu karesine kurulabilir! (Mevcut konum: ${x}, ${y})`);
      return false;
    }

    const occupied = new Set<string>();
    resources.forEach((r) => occupied.add(`${r.x},${r.y}`));
    chargingStations.forEach((c) => occupied.add(`${c.x},${c.y}`));
    depots.forEach((d) => occupied.add(`${d.x},${d.y}`));
    hazardTiles.forEach((h) => occupied.add(`${h.x},${h.y}`));
    powerPlants.forEach((p) => occupied.add(`${p.x},${p.y}`));

    smelters.forEach((s) => {
      occupied.add(`${s.x},${s.y}`); occupied.add(`${s.x+1},${s.y}`);
      occupied.add(`${s.x},${s.y+1}`); occupied.add(`${s.x+1},${s.y+1}`);
    });

    refineries.forEach((rf) => {
      occupied.add(`${rf.x},${rf.y}`); occupied.add(`${rf.x+1},${rf.y}`);
      occupied.add(`${rf.x},${rf.y+1}`); occupied.add(`${rf.x+1},${rf.y+1}`);
    });

    if (occupied.has(`${x},${y}`)) {
      get().addLog('error', `Seçilen kare dolu. Santral inşa edilemedi.`);
      return false;
    }

    const newPlant: PowerPlant = {
      id: `plant-${Date.now()}`,
      x,
      y,
      name,
      linkedStationId: linkedStation.id,
      powerBuffer: 1000,
      maxPowerBuffer: 5000,
      temperature: 30.0,
      overclockRate: 1.0,
      isOverheated: false,
      overheatTicksRemaining: 0,
      scriptCode: DEFAULT_POWER_PLANT_C_SHARP_SCRIPT,
    };

    set((state) => ({
      ...updateMapDataForBiome(state, currentBiome, (map) => ({
        powerPlants: [...(map.powerPlants || []), newPlant],
      })),
      credits: state.credits - price,
    }));

    soundService.playPurchase();
    get().addLog('success', `⚡ [SANTRAL KURULDU]: '${name}' (${x}, ${y}) konumunda [${linkedStation.name}] istasyonuna bağlı inşa edildi! (-$${price.toLocaleString()})`);
    return true;
  },

  burnPowerPlantFuel: (plantId, fuelSku) => {
    const state = get();
    const currentBiome = state.currentBiome;
    const mapData = getMapDataForBiome(state, currentBiome);
    const { powerPlants = [] } = mapData;

    const plant = powerPlants.find((p) => p.id === plantId);
    if (!plant || plant.isOverheated) return false;

    const availableQty = state.inventory[fuelSku] || 0;
    if (availableQty < 1) {
      get().addLog('warn', `⚠️ [YAKIT TÜKENDİ]: Deponuzda '${fuelSku}' yakıt cevheri bulunmuyor.`);
      return false;
    }

    let caloricValue = 50;
    if (fuelSku === 'COAL_ORE') caloricValue = 50;
    else if (fuelSku === 'FE_ORE' || fuelSku === 'SKU-IRON-01') caloricValue = 30;
    else if (fuelSku === 'RUBY_GEM') caloricValue = 200;
    else if (fuelSku === 'PLASMA_CORE') caloricValue = 1500;

    const efficiencyPenalty = 1.0 - (plant.overclockRate > 1.0 ? (plant.overclockRate - 1.0) * 0.4 : 0);
    const energyProduced = Math.round(caloricValue * plant.overclockRate * efficiencyPenalty);

    const newPowerBuffer = Math.min(plant.maxPowerBuffer, plant.powerBuffer + energyProduced);

    const updatedPlants = powerPlants.map((p) =>
      p.id === plantId ? { ...p, powerBuffer: newPowerBuffer } : p
    );

    set((prev) => ({
      ...updateMapDataForBiome(prev, currentBiome, () => ({ powerPlants: updatedPlants })),
      inventory: {
        ...prev.inventory,
        [fuelSku]: prev.inventory[fuelSku] - 1,
      },
    }));

    soundService.playCharging();
    get().addLog('success', `🔥 [YAKIT YAKILDI]: ${plant.name} 1x ${fuelSku} yakarak +${energyProduced} kWh enerjiyi depoya aktardı! (${newPowerBuffer}/${plant.maxPowerBuffer} kWh)`);
    return true;
  },

  depositRawMaterial: (robotId) => {
    const state = get();
    const robot = state.robots.find((r) => r.id === robotId);
    if (!robot || robot.cargoAmount <= 0 || !robot.cargoSku) return false;

    const robotBiome = robot.biomeId || 'MARS_BASIN';
    const mapData = getMapDataForBiome(state, robotBiome);
    const { smelters = [], refineries = [] } = mapData;

    const smelter = smelters.find(
      (s) => robot.x >= s.x && robot.x <= s.x + 1 && robot.y >= s.y && robot.y <= s.y + 1
    );

    const refinery = refineries.find(
      (rf) => robot.x >= rf.x && robot.x <= rf.x + 1 && robot.y >= rf.y && robot.y <= rf.y + 1
    );

    const targetBuilding = smelter || refinery;
    if (!targetBuilding) return false;

    const sku = robot.cargoSku;
    const amount = robot.cargoAmount;

    if (smelter) {
      const updatedSmelters = smelters.map((s) => {
        if (s.id !== smelter.id) return s;
        const currentInput = s.inputBuffer[sku] || 0;
        return {
          ...s,
          inputBuffer: { ...s.inputBuffer, [sku]: currentInput + amount },
        };
      });

      set((prev) => ({
        ...updateMapDataForBiome(prev, robotBiome, () => ({ smelters: updatedSmelters })),
        robots: prev.robots.map((r) =>
          r.id === robotId ? { ...r, cargoAmount: 0, cargoSku: undefined } : r
        ),
      }));
    } else if (refinery) {
      const updatedRefineries = refineries.map((rf) => {
        if (rf.id !== refinery.id) return rf;
        const currentInput = rf.inputBuffer[sku] || 0;
        return {
          ...rf,
          inputBuffer: { ...rf.inputBuffer, [sku]: currentInput + amount },
        };
      });

      set((prev) => ({
        ...updateMapDataForBiome(prev, robotBiome, () => ({ refineries: updatedRefineries })),
        robots: prev.robots.map((r) =>
          r.id === robotId ? { ...r, cargoAmount: 0, cargoSku: undefined } : r
        ),
      }));
    }

    soundService.playUnload();
    get().addLog('info', `📥 [HAM MADDE TESLİMİ]: ${robot.name} ${amount} birim ${sku} ham maddesini ${targetBuilding.name} girdisine bıraktı!`);
    return true;
  },

  processMaterial: (robotId) => {
    const state = get();
    const robot = state.robots.find((r) => r.id === robotId);
    if (!robot) return false;

    const robotBiome = robot.biomeId || 'MARS_BASIN';
    const mapData = getMapDataForBiome(state, robotBiome);
    const { smelters = [], refineries = [] } = mapData;

    const smelter = smelters.find(
      (s) => robot.x >= s.x && robot.x <= s.x + 1 && robot.y >= s.y && robot.y <= s.y + 1
    );

    const refinery = refineries.find(
      (rf) => robot.x >= rf.x && robot.x <= rf.x + 1 && robot.y >= rf.y && robot.y <= rf.y + 1
    );

    if (smelter) {
      let rawSku = Object.keys(smelter.inputBuffer).find((k) => (smelter.inputBuffer[k] || 0) >= 2);
      if (!rawSku) {
        get().addLog('warn', `${smelter.name} girdisinde döküm yapmak için en az 2x ham cevher gerekiyor.`);
        return false;
      }

      let refinedSku = 'STEEL_INGOT';
      if (rawSku === 'RUBY_GEM') refinedSku = 'REINFORCED_ALLOY';
      else if (rawSku === 'FE_ORE' || rawSku === 'SKU-IRON-01') refinedSku = 'STEEL_INGOT';

      const newInputCount = (smelter.inputBuffer[rawSku] || 0) - 2;
      const newOutputCount = (smelter.outputBuffer[refinedSku] || 0) + 1;

      const updatedInputBuffer = { ...smelter.inputBuffer, [rawSku]: newInputCount };
      if (newInputCount <= 0) delete updatedInputBuffer[rawSku];

      const updatedSmelters = smelters.map((s) =>
        s.id === smelter.id
          ? {
              ...s,
              inputBuffer: updatedInputBuffer,
              outputBuffer: { ...s.outputBuffer, [refinedSku]: newOutputCount },
            }
          : s
      );

      set((prev) => updateMapDataForBiome(prev, robotBiome, () => ({ smelters: updatedSmelters })));
      soundService.playMining();
      get().addLog('success', `⚙️ [DÖKÜM İŞLEMİ]: ${smelter.name} 2x ${rawSku} kullanarak 1x ${refinedSku} (10x Değerli Çelik/Alaşım) üretti!`);
      return true;
    } else if (refinery) {
      let rawSku = Object.keys(refinery.inputBuffer).find((k) => (refinery.inputBuffer[k] || 0) >= 2);
      if (!rawSku) {
        get().addLog('warn', `${refinery.name} girdisinde rafine etmek için en az 2x değerli maden gerekiyor.`);
        return false;
      }

      let refinedSku = 'QUANTUM_CHIP';
      if (rawSku === 'DIAMOND_ICE' || rawSku === 'SKU-CRYSTAL-01') refinedSku = 'PLASMA_CORE';
      else if (rawSku === 'AU_ORE' || rawSku === 'SKU-GOLD-01') refinedSku = 'QUANTUM_CHIP';

      const newInputCount = (refinery.inputBuffer[rawSku] || 0) - 2;
      const newOutputCount = (refinery.outputBuffer[refinedSku] || 0) + 1;

      const updatedInputBuffer = { ...refinery.inputBuffer, [rawSku]: newInputCount };
      if (newInputCount <= 0) delete updatedInputBuffer[rawSku];

      const updatedRefineries = refineries.map((rf) =>
        rf.id === refinery.id
          ? {
              ...rf,
              inputBuffer: updatedInputBuffer,
              outputBuffer: { ...rf.outputBuffer, [refinedSku]: newOutputCount },
            }
          : rf
      );

      set((prev) => updateMapDataForBiome(prev, robotBiome, () => ({ refineries: updatedRefineries })));
      soundService.playMining();
      get().addLog('success', `🧪 [RAFİNERİ İŞLEMİ]: ${refinery.name} 2x ${rawSku} kullanarak 1x ${refinedSku} (10x Değerli Çip/Plazma Çekirdek) üretti!`);
      return true;
    }

    return false;
  },

  collectProcessedProduct: (robotId) => {
    const state = get();
    const robot = state.robots.find((r) => r.id === robotId);
    if (!robot) return false;

    if (robot.cargoAmount > 0) {
      get().addLog('warn', `${robot.name} kargosu dolu iken işlenmiş ürün yükleyemez.`);
      return false;
    }

    const robotBiome = robot.biomeId || 'MARS_BASIN';
    const mapData = getMapDataForBiome(state, robotBiome);
    const { smelters = [], refineries = [] } = mapData;

    const smelter = smelters.find(
      (s) => robot.x >= s.x && robot.x <= s.x + 1 && robot.y >= s.y && robot.y <= s.y + 1
    );

    const refinery = refineries.find(
      (rf) => robot.x >= rf.x && robot.x <= rf.x + 1 && robot.y >= rf.y && robot.y <= rf.y + 1
    );

    const targetBuilding = smelter || refinery;
    if (!targetBuilding) return false;

    const outputBuffer = targetBuilding.outputBuffer;
    const refinedSku = Object.keys(outputBuffer).find((k) => (outputBuffer[k] || 0) > 0);

    if (!refinedSku) {
      get().addLog('warn', `${targetBuilding.name} çıktısında işlenmiş hazır ürün bulunmuyor.`);
      return false;
    }

    const availableAmount = outputBuffer[refinedSku] || 0;
    const amountToTake = Math.min(availableAmount, Math.floor(robot.maxCargo / 10) || 1);

    const newOutputCount = availableAmount - amountToTake;
    const updatedOutputBuffer = { ...outputBuffer, [refinedSku]: newOutputCount };
    if (newOutputCount <= 0) delete updatedOutputBuffer[refinedSku];

    if (smelter) {
      const updatedSmelters = smelters.map((s) =>
        s.id === smelter.id ? { ...s, outputBuffer: updatedOutputBuffer } : s
      );

      set((prev) => ({
        ...updateMapDataForBiome(prev, robotBiome, () => ({ smelters: updatedSmelters })),
        robots: prev.robots.map((r) =>
          r.id === robotId ? { ...r, cargoAmount: amountToTake * 10, cargoSku: refinedSku } : r
        ),
      }));
    } else if (refinery) {
      const updatedRefineries = refineries.map((rf) =>
        rf.id === refinery.id ? { ...rf, outputBuffer: updatedOutputBuffer } : rf
      );

      set((prev) => ({
        ...updateMapDataForBiome(prev, robotBiome, () => ({ refineries: updatedRefineries })),
        robots: prev.robots.map((r) =>
          r.id === robotId ? { ...r, cargoAmount: amountToTake * 10, cargoSku: refinedSku } : r
        ),
      }));
    }

    soundService.playPurchase();
    get().addLog('success', `📦 [ÜRÜN ALINDI]: ${robot.name} ${targetBuilding.name} çıktısından ${amountToTake} adet ${refinedSku} işlenmiş ürünü kargosuna yükledi!`);
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

  buyEmergencyCharge: (robotId, price) => {
    const { credits, robots } = get();
    const robot = robots.find((r) => r.id === robotId);
    if (!robot) return false;

    if (robot.energy >= robot.maxEnergy) {
      get().addLog('warn', `${robot.name} bataryası zaten %100 dolu (${robot.energy}/${robot.maxEnergy}).`);
      return false;
    }

    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! ${robot.name} için acil şarj yükleme ücreti: $${price.toLocaleString()}`);
      return false;
    }

    const chargeBoost = Math.max(10, Math.round(robot.maxEnergy * 0.10));
    const newEnergy = Math.min(robot.maxEnergy, robot.energy + chargeBoost);

    set((state) => ({
      credits: state.credits - price,
      robots: state.robots.map((r) =>
        r.id === robotId ? { ...r, energy: newEnergy, status: r.status === 'ERROR' ? 'ERROR' : ('IDLE' as const) } : r
      ),
    }));

    soundService.playCharging();
    get().addLog('success', `⚡ [ACİL ŞARJ]: ${robot.name} robotuna %10 Şarj (+${chargeBoost} Enerji -> ${newEnergy}/${robot.maxEnergy}) satın alındı! (-$${price.toLocaleString()})`);
    return true;
  },

  moveRobot: (robotId, direction) => {
    const state = get();
    const robot = state.robots.find((r) => r.id === robotId);
    if (!robot || robot.energy <= 0) return;

    const robotBiome = robot.biomeId || 'MARS_BASIN';
    const mapData = getMapDataForBiome(state, robotBiome);
    const { gridSize, chargingStations, depots, hazardTiles } = mapData;

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

    // Collision Check: Is target tile occupied by another robot in the SAME biome?
    const isStationOrDepot =
      chargingStations.some((cs) => cs.x === newX && cs.y === newY) ||
      depots.some((d) => d.x === newX && d.y === newY);

    const sameBiomeRobots = state.robots.filter((r) => (r.biomeId || 'MARS_BASIN') === robotBiome);
    const isOccupiedByRobot = sameBiomeRobots.some(
      (r) => r.id !== robotId && r.x === newX && r.y === newY
    );

    if (isOccupiedByRobot && !isStationOrDepot) {
      // If robot is already adjacent (dist <= 1) to target robot/building, stay put nicely (No infinite detour loops)
      const distToBlocking = Math.abs(robot.x - newX) + Math.abs(robot.y - newY);
      if (distToBlocking <= 1 && (robot.role === 'REPAIR_DRONE' || robot.role === 'TRANSPORTER')) {
        set((prev) => ({
          robots: prev.robots.map((r) => (r.id === robotId ? { ...r, status: 'IDLE' as const } : r)),
        }));
        return;
      }

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

        const isFree = !sameBiomeRobots.some((r) => r.id !== robotId && r.x === tx && r.y === ty);
        if (isFree) {
          detourDirection = d;
          detourX = tx;
          detourY = ty;
          break;
        }
      }

      if (detourDirection) {
        soundService.playStep();
        set((prev) => ({
          robots: prev.robots.map((r) =>
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

      return;
    }

    soundService.playStep();

    // Check Hazard Tile Penalty (LAVA, RADIATION, ICE)
    const hazardOnTile = hazardTiles.find((h) => h.x === newX && h.y === newY);
    const hazardPenalty = hazardOnTile ? hazardOnTile.damage : 0;

    if (hazardOnTile) {
      get().addLog('warn', `⚠️ [TEHLİKE KAROSU]: ${robot.name} [${hazardOnTile.name}] karosuna bastı! (-${hazardOnTile.damage} Enerji)`);
    }

    set((prev) => {
      const newMoves = prev.tutorialProgress.movesCount + 1;
      if (newMoves >= 3) {
        get().markTutorialStepCompleted(1);
      }

      return {
        tutorialProgress: { ...prev.tutorialProgress, movesCount: newMoves },
        robots: prev.robots.map((r) =>
          r.id === robotId
            ? {
                ...r,
                x: newX,
                y: newY,
                direction,
                status: 'MOVING',
                energy: Math.max(0, r.energy - 1 - hazardPenalty),
              }
            : r
        ),
      };
    });
  },

  mineResource: (robotId, targetX, targetY) => {
    const state = get();
    const robot = state.robots.find((r) => r.id === robotId);
    if (!robot || robot.energy <= 0) return;

    const robotBiome = robot.biomeId || 'MARS_BASIN';
    const mapData = getMapDataForBiome(state, robotBiome);
    const { resources } = mapData;

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

    set((prev) => {
      const updatedResources = resources.map((res) =>
        res.id === targetNode!.id
          ? { ...res, amount: res.amount - mineAmount }
          : res
      );

      const updatedRobots = prev.robots.map((r) =>
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

      const newMines = prev.tutorialProgress.minesCount + 1;
      if (newMines >= 1) get().markTutorialStepCompleted(2);
      if (newMines >= 2) get().markTutorialStepCompleted(5);

      return {
        ...updateMapDataForBiome(prev, robotBiome, () => ({ resources: updatedResources })),
        tutorialProgress: { ...prev.tutorialProgress, minesCount: newMines },
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

  buyRepairDrone: (name, color = '#10b981') => {
    const { credits, robots } = get();
    const price = 5000;
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! Tamir Drone robotu ücreti: $${price.toLocaleString()}`);
      return false;
    }

    const newRobotId = `repair-drone-${Date.now()}`;
    const newRobot: Robot = {
      id: newRobotId,
      name: name || `Repair Drone #${robots.length + 1}`,
      x: 1,
      y: 1,
      direction: 'SOUTH',
      status: 'IDLE',
      color,
      energy: 120,
      maxEnergy: 120,
      minedCount: 0,
      miningSpeed: 1,
      miningLevel: 1,
      batteryLevel: 1,
      radarRange: 7,
      radarLevel: 1,
      cargoAmount: 0,
      maxCargo: 50,
      cargoLevel: 1,
      role: 'REPAIR_DRONE',
      canMine: false,
      moveSpeed: 2,
      health: 100,
      maxHealth: 100,
      scriptName: 'RepairDrone.cs',
      scriptCode: DEFAULT_REPAIR_DRONE_C_SHARP_SCRIPT,
      biomeId: get().currentBiome,
    };

    set((state) => ({
      credits: state.credits - price,
      robots: [...state.robots, newRobot],
      selectedRobotId: newRobotId,
      scriptCode: DEFAULT_REPAIR_DRONE_C_SHARP_SCRIPT,
    }));

    soundService.playPurchase();
    get().addLog('success', `🛠️ [TAMİR DRONE SATIN ALINDI]: ${newRobot.name} filoya eklendi! Hasarlı robotları ve aşırı ısınan santralleri otonom onarır.`);
    return true;
  },

  buyTurret: (x, y) => {
    const { credits, turrets = [], currentBiome } = get();
    const price = 6000;
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! Lazer Savunma Kulesi ücreti: $${price.toLocaleString()}`);
      return false;
    }

    const newTurret: TurretBuilding = {
      id: `turret-${Date.now()}`,
      name: `Lazer Savunma Kulesi #${turrets.length + 1}`,
      x,
      y,
      range: 4,
      rangeLevel: 1,
      damage: 20,
      damageLevel: 1,
    };

    set((prev) => ({
      credits: prev.credits - price,
      ...updateMapDataForBiome(prev, currentBiome, (map) => ({
        turrets: [...(map.turrets || []), newTurret],
      })),
      turrets: [...(prev.turrets || []), newTurret],
    }));

    soundService.playPurchase();
    get().addLog('success', `🛡️ [KULE İNŞA EDİLDİ]: ${newTurret.name} (${x}, ${y}) konumuna kuruldu! Menzildeki Korsan Robotlara otonom lazer ateşler.`);
    return true;
  },

  upgradeTurretRange: (turretId) => {
    const { credits, turrets = [] } = get();
    const turret = turrets.find((t) => t.id === turretId);
    if (!turret) return false;

    const price = 1500;
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! Kule menzil yükseltme ücreti: $${price.toLocaleString()}`);
      return false;
    }

    const updatedTurrets = turrets.map((t) =>
      t.id === turretId ? { ...t, rangeLevel: t.rangeLevel + 1, range: t.range + 1 } : t
    );

    set({ credits: credits - price, turrets: updatedTurrets });
    soundService.playPurchase();
    get().addLog('success', `🛡️ ${turret.name} Menzili Seviye ${turret.rangeLevel + 1}'e yükseltildi! (Yeni Menzil: ${turret.range + 1} Karo)`);
    return true;
  },

  upgradeTurretDamage: (turretId) => {
    const { credits, turrets = [] } = get();
    const turret = turrets.find((t) => t.id === turretId);
    if (!turret) return false;

    const price = 2000;
    if (credits < price) {
      get().addLog('error', `Yetersiz bakiye! Kule hasar yükseltme ücreti: $${price.toLocaleString()}`);
      return false;
    }

    const updatedTurrets = turrets.map((t) =>
      t.id === turretId ? { ...t, damageLevel: t.damageLevel + 1, damage: t.damage + 20 } : t
    );

    set({ credits: credits - price, turrets: updatedTurrets });
    soundService.playPurchase();
    get().addLog('success', `💥 ${turret.name} Lazer Hasarı Seviye ${turret.damageLevel + 1}'e yükseltildi! (Yeni Lazer Hasarı: ${turret.damage + 20} DPS)`);
    return true;
  },

  repairRobot: (_droneId, targetId) => {
    const { robots } = get();
    const target = robots.find((r) => r.id === targetId || r.name === targetId);
    if (!target) return;

    const currentHp = target.health ?? 100;
    const maxHp = target.maxHealth ?? 100;
    if (currentHp >= maxHp) return;

    const newHp = Math.min(maxHp, currentHp + 25);
    set((prev) => ({
      robots: prev.robots.map((r) =>
        r.id === target.id ? { ...r, health: newHp, isDamaged: newHp < maxHp * 0.4 } : r
      ),
    }));
  },

  coolPowerPlant: (_droneId, plantId) => {
    const { currentBiome, powerPlants = [] } = get();
    const plant = powerPlants.find((p) => p.id === plantId || p.name === plantId);
    if (!plant) return;

    const newTemp = Math.max(25.0, plant.temperature - 15.0);
    const updatedPlants = powerPlants.map((p) =>
      p.id === plant.id ? { ...p, temperature: newTemp, isOverheated: newTemp >= 100.0 } : p
    );

    set((prev) => ({
      ...updateMapDataForBiome(prev, currentBiome, () => ({ powerPlants: updatedPlants })),
      powerPlants: updatedPlants,
    }));
  },

  // Admin & Simulation Testing Console Implementations
  setAdminModalOpen: (open) => {
    if (open && get().userRole !== 'admin') {
      get().addLog('warn', '[YETKİ BİLDİRİMİ]: Admin Konsoluna erişmek için "admin" yetkili bir hesapla oturum açmanız gerekir.');
      return;
    }
    set({ isAdminModalOpen: open });
  },
  setLeaderboardOpen: (open) => set({ isLeaderboardOpen: open }),
  setMarketplaceOpen: (open) => set({ isMarketplaceOpen: open }),
  setWelcomeOpen: (open) => set({ isWelcomeOpen: open }),

  addCredits: (amount) => {
    set((prev) => ({ credits: Math.max(0, prev.credits + amount) }));
    soundService.playPurchase();
    get().addLog('success', `🛠️ [ADMIN PANELDEN BAKİYE EKLENDİ]: +$${amount.toLocaleString()} bakiye aktarıldı.`);
  },

  spawnBandit: (x, y) => {
    const { activeBandits = [], gridSize } = get();
    const spawnX = x !== undefined ? x : 0;
    const spawnY = y !== undefined ? y : Math.floor(Math.random() * (gridSize.height - 2)) + 1;
    const newBandit: BanditRobot = {
      id: `bandit-admin-${Date.now()}`,
      name: 'Korsan Robot (Admin)',
      x: spawnX,
      y: spawnY,
      health: 100,
      maxHealth: 100,
      cargoAmount: 0,
      maxCargo: 30,
      state: 'RAIDING',
    };

    set({ activeBandits: [...activeBandits, newBandit] });
    get().addLog('warn', `🛠️ [ADMIN TETİKLEME]: (${spawnX}, ${spawnY}) konumunda manuel Korsan Robot doğuruldu!`);
  },

  clearBandits: () => {
    set({ activeBandits: [] });
    get().addLog('info', `🛠️ [ADMIN TEMİZLİK]: Haritadaki tüm Korsan Robotlar silindi.`);
  },

  triggerHazard: (type = 'DUST_STORM') => {
    let name = 'Mars Kum Fırtınası (Admin)';
    if (type === 'VOLCANIC_ERUPTION') name = 'Volkanik Magma & Kül Yağmuru (Admin)';
    else if (type === 'QUANTUM_FLARE') name = 'Kuantum EMP Radyasyon Dalgası (Admin)';
    else if (type === 'BLIZZARD') name = 'Sıfır Altı Kutup Kar Tipi (Admin)';

    set({
      activeHazard: {
        id: `hazard-admin-${Date.now()}`,
        type,
        name,
        durationTicks: 25,
        remainingTicks: 25,
        severity: 3,
      },
    });
    get().addLog('warn', `🛠️ [ADMIN FIRTINA]: '${name}' manuel olarak başlatıldı!`);
  },

  clearHazard: () => {
    set({ activeHazard: null });
    get().addLog('info', `🛠️ [ADMIN FIRTINA]: Fırtına ve tehlike hava olayı manuel olarak dindirildi.`);
  },

  healAllRobots: () => {
    set((prev) => ({
      robots: prev.robots.map((r) => ({
        ...r,
        health: r.maxHealth || 100,
        energy: r.maxEnergy,
        isDamaged: false,
        status: 'IDLE' as const,
      })),
    }));
    soundService.playCharging();
    get().addLog('success', `🛠️ [ADMIN TAMİR]: Tüm filo robotları %100 Can ve %100 Şarj seviyesine getirildi.`);
  },

  coolAllPowerPlants: () => {
    const { currentBiome, powerPlants = [] } = get();
    const updated = powerPlants.map((p) => ({
      ...p,
      temperature: 20.0,
      isOverheated: false,
      powerBuffer: p.maxPowerBuffer,
    }));
    set((prev) => ({
      ...updateMapDataForBiome(prev, currentBiome, () => ({ powerPlants: updated })),
      powerPlants: updated,
    }));
    get().addLog('success', `🛠️ [ADMIN SOĞUTMA]: Tüm Enerji Santralleri 20°C'ye soğutuldu ve kWh depoları dolduruldu.`);
  },

  fillAllDepots: () => {
    set((prev) => ({
      inventory: {
        ...prev.inventory,
        'SKU-IRON-01': (prev.inventory['SKU-IRON-01'] || 0) + 100,
        'COAL_ORE': (prev.inventory['COAL_ORE'] || 0) + 100,
        'SKU-COPPER-01': (prev.inventory['SKU-COPPER-01'] || 0) + 100,
        'SKU-GOLD-01': (prev.inventory['SKU-GOLD-01'] || 0) + 50,
      },
    }));
    soundService.playUnload();
    get().addLog('success', `🛠️ [ADMIN ENVANTER]: Ana depolara +100kg Demir, Kömür, Bakır ve Altın eklendi.`);
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

    const result = compileAndRunCSharp(
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

  stepTick: () => {
    const state = get();
    const nextTick = state.tickCount + 1;
    set({ tickCount: nextTick });

    // Periodic Cloud Save Auto-Sync (Every 20 Ticks / ~10 seconds)
    if (nextTick % 20 === 0) {
      get().saveGameStateToCloud();
    }

    // Periodic Resource Respawning across ALL unlocked biomes (Every 12 Ticks)
    if (nextTick % 12 === 0) {
      const activeState = get();
      for (const biomeKey of activeState.unlockedBiomes) {
        const mapData = getMapDataForBiome(activeState, biomeKey);
        const depletedCount = mapData.resources.filter((r) => r.amount <= 0).length;

        if (depletedCount > 0 || mapData.resources.length < 10) {
          const existingCoords = new Set<string>();
          mapData.resources.forEach((r) => existingCoords.add(`${r.x},${r.y}`));
          mapData.chargingStations.forEach((c) => existingCoords.add(`${c.x},${c.y}`));
          mapData.depots.forEach((d) => existingCoords.add(`${d.x},${d.y}`));
          mapData.hazardTiles.forEach((h) => existingCoords.add(`${h.x},${h.y}`));

          const newResource = generateSingleRespawnResource(
            biomeKey,
            existingCoords,
            `SEED_RESPAWN_${nextTick}_${biomeKey}`
          );

          if (newResource) {
            const cleanedResources = mapData.resources.filter((r) => r.amount > 0);
            set((prev) =>
              updateMapDataForBiome(prev, biomeKey, () => ({
                resources: [...cleanedResources, newResource],
              }))
            );
            get().addLog('info', `🌱 [KAYNAK YENİLENDİ]: ${BIOME_CATALOG[biomeKey]?.name} haritasında yeni ${newResource.name} damarı (${newResource.x}, ${newResource.y}) koordinatında türedi!`);
          }
        }
      }
    }

    // Power Plant Thermal & C# Script Simulation
    const activeState = get();
    for (const biomeKey of activeState.unlockedBiomes) {
      const mapData = getMapDataForBiome(get(), biomeKey);
      const { powerPlants = [] } = mapData;
      if (powerPlants.length === 0) continue;

      const updatedPlants: PowerPlant[] = [];

      for (const plant of powerPlants) {
        if (plant.isOverheated) {
          const rem = plant.overheatTicksRemaining - 1;
          const newTemp = Math.max(30, plant.temperature - 3.5);
          const isStillOverheated = rem > 0;

          if (!isStillOverheated) {
            get().addLog('info', `❄️ [SOĞUMA TAMAMLANDI]: ${plant.name} yeniden faaliyete geçti!`);
          }

          updatedPlants.push({
            ...plant,
            temperature: newTemp,
            isOverheated: isStillOverheated,
            overheatTicksRemaining: Math.max(0, rem),
          });
          continue;
        }

        const scriptToRun = plant.scriptCode || get().powerPlantScriptCode || DEFAULT_POWER_PLANT_C_SHARP_SCRIPT;
        const result = compileAndRunPowerPlantCSharp(scriptToRun, {
          id: plant.id,
          name: plant.name,
          temperature: plant.temperature,
          powerBuffer: plant.powerBuffer,
          maxPowerBuffer: plant.maxPowerBuffer,
          isOverheated: plant.isOverheated,
        });

        let newOverclock = plant.overclockRate;

        result.logs.forEach((l) => {
          if (l.action === 'SET_OVERCLOCK') {
            const parsed = parseFloat(l.payload);
            if (!isNaN(parsed)) newOverclock = Math.max(0.5, Math.min(2.0, parsed));
          } else if (l.action === 'BURN_FUEL') {
            get().burnPowerPlantFuel(plant.id, l.payload);
          }
        });

        let tempDelta = -1.0;
        if (newOverclock > 1.0) tempDelta = (newOverclock - 1.0) * 8.0;
        else if (newOverclock < 1.0) tempDelta = -5.0;

        const nextTemp = Math.max(30, Math.min(100, plant.temperature + tempDelta));
        const overheatTriggered = nextTemp >= 100.0;

        if (overheatTriggered) {
          get().addLog('error', `🚨 [AŞIRI ISINMA PATLAMASI]: ${plant.name} 100°C'ye ulaştı ve TERMAL KİLİTLENMEYE GİRDİ! 20 tick boyunca tamamen KAPANDI!`);
        }

        updatedPlants.push({
          ...plant,
          overclockRate: newOverclock,
          temperature: nextTemp,
          isOverheated: overheatTriggered,
          overheatTicksRemaining: overheatTriggered ? 20 : 0,
        });
      }

      set((prev) => updateMapDataForBiome(prev, biomeKey, () => ({ powerPlants: updatedPlants })));
    }

    const currentRobots = get().robots;

    for (const robot of currentRobots) {
      if (robot.status === 'ERROR') continue;

      const robotBiome = robot.biomeId || 'MARS_BASIN';
      const mapData = getMapDataForBiome(get(), robotBiome);
      const { gridSize, resources, chargingStations, depots, smelters = [], refineries = [], powerPlants = [] } = mapData;

      // 1. Check if robot is on a charging station on ITS OWN biome map
      const stationOnTile = chargingStations.find(
        (cs) => cs.x === robot.x && cs.y === robot.y
      );

      if (stationOnTile && robot.energy < robot.maxEnergy) {
        const activePlants = powerPlants.filter((p) => !p.isOverheated && p.powerBuffer > 0);
        const linkedPlant = activePlants.find((p) => p.linkedStationId === stationOnTile.id) || activePlants[0];
        let chargeBoost = 2; // Default backup emergency solar trickle (+2 Energy) when no power plant exists!

        if (linkedPlant && linkedPlant.powerBuffer > 0) {
          chargeBoost = Math.min(30, linkedPlant.powerBuffer);
          const updatedPlants = powerPlants.map((p) =>
            p.id === linkedPlant.id ? { ...p, powerBuffer: Math.max(0, p.powerBuffer - chargeBoost) } : p
          );
          set((prev) => updateMapDataForBiome(prev, robotBiome, () => ({ powerPlants: updatedPlants })));
        } else if (powerPlants.length === 0) {
          get().addLog('warn', state.language === 'en'
            ? `⚠️ [NO POWER PLANT - SLOW CHARGE]: ${robot.name} is charging at station but no Power Plant exists on grid! Slow charging via emergency solar panel (+2 Energy). Build a Power Plant from Shop!`
            : `⚠️ [SANTRAL YOK - YAVAŞ ŞARJ]: ${robot.name} istasyonda şarj oluyor ancak haritada Enerji Santrali yok! Dahili acil durum güneş paneliyle yavaş şarj oluyor (+2 Enerji). Mağazadan Enerji Santrali inşa edin!`);
        } else {
          get().addLog('warn', state.language === 'en'
            ? `⚠️ [GRID STORAGE FAST CHARGE CUT OFF]: ${robot.name} is slow-charging (+2 Energy) at '${stationOnTile.name}' via emergency leak (0 kWh Storage).`
            : `⚠️ [ŞEBEKE DEPODAN HIZLI ŞARJ KESİLDİ]: ${robot.name} ${stationOnTile.name} istasyonunda (0 kWh Depo) acil durum sızıntısıyla yavaş şarj oluyor (+2 Enerji).`);
        }

        const newEnergy = Math.min(robot.maxEnergy, robot.energy + chargeBoost);
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
        if (chargeBoost > 2) {
          get().addLog('info', state.language === 'en'
            ? `${robot.name} charged at [${stationOnTile.name}] (+${chargeBoost} Energy -> ${newEnergy}/${robot.maxEnergy})!`
            : `${robot.name} [${stationOnTile.name}] istasyonunda şarj oldu (+${chargeBoost} Enerji -> ${newEnergy}/${robot.maxEnergy})!`);
        }
        if (newEnergy < robot.maxEnergy) continue;
      }

      // 2. Check if robot is on a Depot tile (Auto-Unload Cargo) on ITS OWN biome map
      const depotOnTile = depots.find(
        (d) => d.x === robot.x && d.y === robot.y
      );

      if (depotOnTile && robot.cargoAmount > 0) {
        get().unloadCargo(robot.id);
      }

      // 3. Run Robot's C# Script against ITS OWN biome map data
      const codeToRun = robot.scriptCode || state.scriptCode || DEFAULT_C_SHARP_SCRIPT;

      const result = compileAndRunCSharp(
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
          canMine: robot.canMine,
          health: robot.health,
          maxHealth: robot.maxHealth,
          role: robot.role,
        },
        resources,
        gridSize,
        chargingStations,
        depots,
        smelters,
        refineries,
        state.radioMessages || [],
        state.robots || [],
        state.language || 'tr'
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
        if (log.action === 'SEND_RADIO_MESSAGE') {
          try {
            const parsed = JSON.parse(log.payload);
            get().sendRadioMessage(robot.id, parsed.messageType, parsed.x, parsed.y);
          } catch {
            get().sendRadioMessage(robot.id, 'CARGO_FULL', robot.x, robot.y);
          }
        } else if (log.action === 'COLLECT_CARGO_FROM_ROBOT') {
          get().collectCargoFromRobot(robot.id, log.payload);
        } else if (log.action === 'TRANSFER_CARGO_TO_ROBOT') {
          get().transferCargoToRobot(robot.id, log.payload);
        } else if (log.action === 'DEPOSIT_RAW_MATERIAL') {
          get().depositRawMaterial(robot.id);
        } else if (log.action === 'PROCESS_MATERIAL') {
          get().processMaterial(robot.id);
        } else if (log.action === 'COLLECT_PROCESSED') {
          get().collectProcessedProduct(robot.id);
        } else if (log.action === 'REPAIR_ROBOT') {
          get().repairRobot(robot.id, log.payload);
        } else if (log.action === 'COOL_POWER_PLANT') {
          get().coolPowerPlant(robot.id, log.payload);
        } else if (log.action === 'MINE') {
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
          if (robot.moveSpeed === 2 || robot.role === 'TRANSPORTER' || robot.role === 'REPAIR_DRONE') {
            get().moveRobot(robot.id, log.payload as Direction);
          }
        }
      });
    }

    // 4. Bandit Raiders AI & Theft Loop
    const currentBandits = get().activeBandits || [];
    const depots = get().depots || [];
    const currentBiome = get().currentBiome;

    // Bandit Spawn Trigger (Every 25 Ticks)
    if (nextTick % 25 === 0 && currentBandits.length < 3) {
      const spawnChance = currentBiome === 'MARS_BASIN' ? 0.25 : 0.65;
      if (Math.random() < spawnChance) {
        const width = get().gridSize.width;
        const height = get().gridSize.height;

        let spawnX = 0;
        let spawnY = 0;

        for (let attempt = 0; attempt < 20; attempt++) {
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) {
            spawnX = Math.floor(Math.random() * width);
            spawnY = 0;
          } else if (edge === 1) {
            spawnX = width - 1;
            spawnY = Math.floor(Math.random() * height);
          } else if (edge === 2) {
            spawnX = Math.floor(Math.random() * width);
            spawnY = height - 1;
          } else {
            spawnX = 0;
            spawnY = Math.floor(Math.random() * height);
          }

          const minDepotDist = depots.reduce((minD, d) => {
            const dist = Math.hypot(d.x - spawnX, d.y - spawnY);
            return Math.min(minD, dist);
          }, Infinity);

          if (minDepotDist >= 5 || depots.length === 0) {
            break;
          }
        }

        const newBandit: BanditRobot = {
          id: `bandit-${nextTick}-${Date.now()}`,
          name: 'Korsan Robot',
          x: spawnX,
          y: spawnY,
          health: 100,
          maxHealth: 100,
          cargoAmount: 0,
          maxCargo: 30,
          state: 'RAIDING',
        };
        set((prev) => ({ activeBandits: [...(prev.activeBandits || []), newBandit] }));
        get().addLog('warn', `🏴‍☠️ [KORSAN BASKINI]: (${spawnX}, ${spawnY}) sınırında hırsız Korsan Robot belirdi! Depolara sızıp değerli madenleri çalmaya çalışıyor!`);
      }
    }

    // Bandit Movement & Stealing Loop
    if (currentBandits.length > 0) {
      const nearestDepot = depots[0] || { x: 0, y: 19 };
      const width = get().gridSize.width;
      const height = get().gridSize.height;
      const updatedBandits: BanditRobot[] = [];

      for (const bandit of currentBandits) {
        let bx = bandit.x;
        let by = bandit.y;
        let bstate = bandit.state;
        let bcargo = bandit.cargoAmount;

        if (bstate === 'RAIDING') {
          // Navigate towards nearest Depot
          const dx = nearestDepot.x - bx;
          const dy = nearestDepot.y - by;
          if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) bx += dx > 0 ? 1 : -1;
          else if (dy !== 0) by += dy > 0 ? 1 : -1;

          // Arrived at Depot tile -> Steal 30kg minerals!
          if (bx === nearestDepot.x && by === nearestDepot.y) {
            const currentInventory = get().inventory;
            const stolenSku = Object.keys(currentInventory).find((k) => (currentInventory[k] || 0) > 0);
            if (stolenSku && (currentInventory[stolenSku] || 0) > 0) {
              const stealAmount = Math.min(30, currentInventory[stolenSku] || 0);
              set((prev) => ({
                inventory: { ...prev.inventory, [stolenSku]: (prev.inventory[stolenSku] || 0) - stealAmount },
              }));
              bcargo = stealAmount;
              bstate = 'ESCAPING';
              get().addLog('error', `🚨 [DEPO BASILDI]: Korsan Robot depodan ${stealAmount}kg ${stolenSku} çaldı ve kaçıyor!`);
            } else {
              bstate = 'ESCAPING';
            }
          }
        } else if (bstate === 'ESCAPING') {
          // Navigate to nearest map edge
          const distNorth = by;
          const distSouth = height - 1 - by;
          const distWest = bx;
          const distEast = width - 1 - bx;
          const minDist = Math.min(distNorth, distSouth, distWest, distEast);

          if (minDist <= 0) {
            // Despawned at edge with stolen goods
            get().addLog('warn', `🏴‍☠️ [KORSAN KAÇTI]: Korsan Robot çaldığı madenlerle harita sınırından kaçtı!`);
            continue;
          }

          if (minDist === distNorth) by -= 1;
          else if (minDist === distSouth) by += 1;
          else if (minDist === distWest) bx -= 1;
          else if (minDist === distEast) bx += 1;
        }

        // Damage adjacent player robots in harsh biomes
        if (currentBiome !== 'MARS_BASIN') {
          const sameTileRobot = get().robots.find((r) => Math.abs(r.x - bx) <= 1 && Math.abs(r.y - by) <= 1);
          if (sameTileRobot) {
            set((prev) => ({
              robots: prev.robots.map((r) =>
                r.id === sameTileRobot.id ? { ...r, health: Math.max(0, (r.health ?? 100) - 8), isDamaged: true } : r
              ),
            }));
          }
        }

        updatedBandits.push({ ...bandit, x: bx, y: by, state: bstate, cargoAmount: bcargo });
      }

      set({ activeBandits: updatedBandits });
    }

    // 5. Defense Turret Auto-Target & Laser Blast Loop
    const activeTurrets = get().turrets || [];
    const radioSpottedMsg = (get().radioMessages || []).find((m) => m.messageType === 'BANDIT_SPOTTED');

    if (activeTurrets.length > 0 && (get().activeBandits || []).length > 0) {
      const currentBanditsList = get().activeBandits || [];
      let updatedBanditsList = [...currentBanditsList];

      const updatedTurrets = activeTurrets.map((turret) => {
        let targetBandit = currentBanditsList.find(
          (b) => Math.hypot(b.x - turret.x, b.y - turret.y) <= turret.range
        );

        if (!targetBandit && radioSpottedMsg) {
          targetBandit = currentBanditsList.find(
            (b) => Math.hypot(b.x - radioSpottedMsg.x, b.y - radioSpottedMsg.y) <= turret.range + 2
          );
        }

        if (targetBandit) {
          const newHp = targetBandit.health - turret.damage;
          soundService.playMining();
          get().addLog('success', `[LAZER ATISI]: ${turret.name} Korsan Robota lazer ateşi açtı! (-${turret.damage} HP)`);

          if (newHp <= 0) {
            updatedBanditsList = updatedBanditsList.filter((b) => b.id !== targetBandit!.id);
            set((prev) => ({ credits: prev.credits + 300 }));
            get().addLog('success', `[KORSAN IMHA EDILDI]: Lazer Savunma Kulesi Korsan Robotu yok etti! +$300 Ödül Ödendi.`);
          } else {
            updatedBanditsList = updatedBanditsList.map((b) => (b.id === targetBandit!.id ? { ...b, health: newHp } : b));
          }

          return { ...turret, targetBanditId: targetBandit.id, lastFiredTick: nextTick };
        }

        return { ...turret, targetBanditId: null };
      });

      set({ turrets: updatedTurrets, activeBandits: updatedBanditsList });
    }

    // 6. Environmental Hazard Loop per Biome (Every 60 Ticks)
    if (nextTick % 60 === 0 && Math.random() < 0.4 && !get().activeHazard) {
      const currentBiome = get().currentBiome;
      const isEn = get().language === 'en';
      let hazardType: 'DUST_STORM' | 'VOLCANIC_ERUPTION' | 'QUANTUM_FLARE' | 'BLIZZARD' = 'DUST_STORM';
      let hazardName = isEn ? 'Mars Dust Storm' : 'Mars Kum Fırtınası';
      let logMessage = isEn
        ? '[DUST STORM STARTED]: Severe Mars dust storm active! Field robotics wearing down (-2 HP/tick).'
        : '[KUM FIRTINASI BAŞLADI]: Şiddetli Mars kum fırtınası başladı! Sahadaki robotlar aşınıyor (-2 HP/tick).';

      if (currentBiome === 'VOLCANIC') {
        hazardType = 'VOLCANIC_ERUPTION';
        hazardName = isEn ? 'Volcanic Magma & Ash Rain' : 'Volkanik Magma & Kül Yağmuru';
        logMessage = isEn
          ? '[VOLCANIC ERUPTION]: Volcanic eruption and acid ash active! (-3 HP, -5 Energy/tick).'
          : '[VOLKANİK PATLAMA]: Volkanik vadide lav püskürmesi ve asit külleri başladı! (-3 HP, -5 Enerji/tick).';
      } else if (currentBiome === 'QUANTUM_CAVERN') {
        hazardType = 'QUANTUM_FLARE';
        hazardName = isEn ? 'Quantum EMP Radiation Wave' : 'Kuantum EMP Radyasyon Fırtınası';
        logMessage = isEn
          ? '[QUANTUM EMP WAVE]: Quantum EMP radiation pulse triggered! Sensors jammed (-4 Energy/tick).'
          : '[KUANTUM EMP DALGASI]: Kuantum magmasında EMP ışınması tetiklendi! Sensörler parazitlendi (-4 Enerji/tick).';
      } else if (currentBiome === 'GLACIER') {
        hazardType = 'BLIZZARD';
        hazardName = isEn ? 'Sub-Zero Polar Blizzard' : 'Sıfır Altı Kutup Kar Tipi';
        logMessage = isEn
          ? '[POLAR BLIZZARD STARTED]: Sub-zero blizzard sweeping across ice wastes! Batteries freezing (-3 Energy/tick).'
          : '[KUTUP TİPİSİ BAŞLADI]: Sıfırın altında kar fırtınası dondurucu rüzgarlarla bastırdı! Bataryalar donuyor (-3 Enerji/tick).';
      }

      set({
        activeHazard: {
          id: `hazard-${Date.now()}`,
          type: hazardType,
          name: hazardName,
          durationTicks: 20,
          remainingTicks: 20,
          severity: 2,
        },
      });
      get().addLog('warn', logMessage);
    }

    const currentHazard = get().activeHazard;
    if (currentHazard) {
      const rem = currentHazard.remainingTicks - 1;
      const isEn = get().language === 'en';
      if (rem <= 0) {
        set({ activeHazard: null });
        get().addLog('info', isEn
          ? `[HAZARD SUBSIDED]: ${currentHazard.name} cleared. Atmospheric conditions returned to normal.`
          : `[TEHLİKE DİNDİ]: ${currentHazard.name} sona erdi. Hava koşulları normale döndü.`);
      } else {
        set({ activeHazard: { ...currentHazard, remainingTicks: rem } });
        // Apply specific hazard penalties to open field robots
        set((prev) => ({
          robots: prev.robots.map((r) => {
            const currentHp = r.health ?? 100;
            const newHp = Math.max(0, currentHp - 2);
            return {
              ...r,
              health: newHp,
              isDamaged: newHp < 40,
            };
          }),
        }));
      }
    }
  },

  resetGame: () => {
    set({
      credits: 1500,
      robots: [],
      resources: INITIAL_RESOURCES,
      chargingStations: [],
      depots: [],
      smelters: [],
      refineries: [],
      powerPlants: [],
      selectedRobotId: '',
      inventory: INITIAL_INVENTORY,
      tickCount: 0,
      isRunning: false,
      logs: [
        {
          id: `log-reset-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'warn',
          message: 'Simülasyon sıfırlandı. 0 Robot, 0 Depo, 0 Şarj İstasyonu ile temiz başlangıç yapıldı! Mağazadan ilk robotunuzu ve ücretsiz tesislerinizi inşa edebilirsiniz.',
        },
      ],
    });
  },
}));
