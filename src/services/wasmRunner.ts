import { Direction, ResourceNode, ChargingStation, Depot, Smelter, Refinery, RadioMessage } from '../types/game';

export interface CompilationLog {
  action: 'MOVE' | 'MINE' | 'ROTATE' | 'IDLE' | 'ERROR' | 'DEPOSIT_RAW_MATERIAL' | 'PROCESS_MATERIAL' | 'COLLECT_PROCESSED' | 'SEND_RADIO_MESSAGE' | 'READ_RADIO_MESSAGES' | 'COLLECT_CARGO_FROM_ROBOT' | 'TRANSFER_CARGO_TO_ROBOT' | 'REPAIR_ROBOT' | 'COOL_POWER_PLANT';
  payload: string;
  message: string;
}

export interface ScriptExecutionResult {
  success: boolean;
  diagnostics: string[];
  logs: CompilationLog[];
}

interface RobotState {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: Direction;
  energy?: number;
  maxEnergy?: number;
  cargoAmount?: number;
  maxCargo?: number;
  canMine?: boolean;
  health?: number;
  maxHealth?: number;
  role?: string;
}

/**
 * Intelligent C# Script Evaluator & WASM Bridge
 * Dynamic radar pathfinding, charging station auto-recharge, depot cargo unloading, smelter/refinery processing, swarm radio network navigation, repair drones, transporters, and GoTo(x, y) target navigation.
 */
export function compileAndRunCSharp(
  code: string,
  robotState: RobotState,
  resources: ResourceNode[],
  gridSize: { width: number; height: number },
  chargingStations: ChargingStation[] = [{ id: 'cs1', name: 'Ana Şarj İstasyonu', x: 0, y: 0, chargeRate: 25 }],
  depots: Depot[] = [{ id: 'depot1', name: 'Ana Lojistik Deposu', x: 0, y: 19 }],
  _smelters: Smelter[] = [],
  _refineries: Refinery[] = [],
  radioMessages: RadioMessage[] = [],
  allRobots: Array<{ id: string; name: string; x: number; y: number; health?: number; role?: string; cargoAmount?: number; maxCargo?: number }> = [],
  lang: 'tr' | 'en' = 'tr'
): ScriptExecutionResult {
  const diagnostics: string[] = [];
  const logs: CompilationLog[] = [];

  // 1. Basic C# Syntax Verification
  if (!code.includes('class')) {
    diagnostics.push('[Satır 1, Sütun 1]: CS0116: C# kuralı bir sınıf (class) içerisinde tanımlanmalıdır.');
  }
  if (!code.includes('Execute')) {
    diagnostics.push("[Satır 5, Sütun 5]: CS0103: 'Execute(IRobot robot)' metodu bulunamadı.");
  }

  if (diagnostics.length > 0) {
    return {
      success: false,
      diagnostics,
      logs: [],
    };
  }

  // 2. Find Nearest Charging Station & Nearest Depot
  let minStationDist = Infinity;
  let nearestStation: ChargingStation = chargingStations[0] || { id: 'cs1', name: 'Ana Şarj İstasyonu', x: 0, y: 0, chargeRate: 25 };

  chargingStations.forEach((cs) => {
    const dist = Math.abs(cs.x - robotState.x) + Math.abs(cs.y - robotState.y);
    if (dist < minStationDist) {
      minStationDist = dist;
      nearestStation = cs;
    }
  });

  let minDepotDist = Infinity;
  let nearestDepot: Depot = depots[0] || { id: 'depot1', name: 'Ana Lojistik Deposu', x: 0, y: 19 };

  depots.forEach((d) => {
    const dist = Math.abs(d.x - robotState.x) + Math.abs(d.y - robotState.y);
    if (dist < minDepotDist) {
      minDepotDist = dist;
      nearestDepot = d;
    }
  });

  const standingOnStation = chargingStations.find(
    (cs) => cs.x === robotState.x && cs.y === robotState.y
  );

  const currentEnergy = robotState.energy ?? 100;
  const maxEnergy = robotState.maxEnergy ?? 100;
  const cargoAmount = robotState.cargoAmount ?? 0;
  const maxCargo = robotState.maxCargo ?? 50;

  // If robot is on charging pad and energy is not full, stay to charge!
  if (standingOnStation && currentEnergy < maxEnergy) {
    logs.push({
      action: 'IDLE',
      payload: 'CHARGING',
      message: `${robotState.name} '${standingOnStation.name}' istasyonunda şarj oluyor... (${currentEnergy}/${maxEnergy})`,
    });
    return { success: true, diagnostics: [], logs };
  }

  // 3. Find Active Resources in the Grid
  const activeResources = resources.filter((r) => r.amount > 0);

  let nearestResource: ResourceNode | null = null;
  let minDistance = Infinity;

  activeResources.forEach((res) => {
    const dist = Math.hypot(res.x - robotState.x, res.y - robotState.y);
    if (dist < minDistance) {
      minDistance = dist;
      nearestResource = res;
    }
  });

  const standingOnResource = activeResources.find(
    (res) => res.x === robotState.x && res.y === robotState.y
  );

  const neighbors: Record<Direction, { x: number; y: number }> = {
    NORTH: { x: robotState.x, y: Math.max(0, robotState.y - 1) },
    EAST: { x: Math.min(gridSize.width - 1, robotState.x + 1), y: robotState.y },
    SOUTH: { x: robotState.x, y: Math.min(gridSize.height - 1, robotState.y + 1) },
    WEST: { x: Math.max(0, robotState.x - 1), y: robotState.y },
  };

  let adjacentResourceTile: ResourceNode | null = standingOnResource || null;

  if (!adjacentResourceTile) {
    for (const dir of [robotState.direction, 'NORTH', 'EAST', 'SOUTH', 'WEST'] as Direction[]) {
      const coords = neighbors[dir];
      const found = activeResources.find((r) => r.x === coords.x && r.y === coords.y);
      if (found) {
        adjacentResourceTile = found;
        break;
      }
    }
  }

  // 4. Inspect C# code intent & Target Resolution
  const globalHasMine = /robot\s*\.\s*Mine\s*\(\s*\)/i.test(code);
  const globalHasMove = /robot\s*\.\s*Move\s*\(/i.test(code);
  const globalHasGoTo = /robot\s*\.\s*GoTo\s*\(/i.test(code);

  const scriptMentionsDepot = /DEPOT|depot|GetCargo|GetMaxCargo/i.test(code);
  const scriptMentionsStation = /CHARGING_PAD|station|charging|GetEnergy/i.test(code);
  const scriptMentionsRadio = /ReadRadioMessages|CARGO_FULL|REPAIR_NEEDED|BANDIT_SPOTTED/i.test(code);
  const scriptEmitsRadio = /SendRadioMessage/i.test(code);
  const hasRepairRobot = /RepairRobot/i.test(code);
  const hasCollectFromRobot = /CollectCargoFromRobot/i.test(code);

  const activeCargoFullMsg = radioMessages.find((m) => m.messageType === 'CARGO_FULL');

  const isCargo100Percent = cargoAmount > 0 && cargoAmount >= maxCargo;
  const isCargoAlmostFull = cargoAmount > 0 && cargoAmount >= maxCargo - 10;
  const isEnergyLow = currentEnergy <= 35 || currentEnergy <= (minStationDist + 5);

  let shouldMine = false;
  let shouldMove = false;
  let moveDir: Direction = robotState.direction;

  // Find nearest damaged robot for Repair Drones
  const damagedRobots = allRobots.filter(
    (r) => r.id !== robotState.id && (r.health ?? 100) < 100
  );
  let nearestDamagedRobot = damagedRobots.length > 0
    ? damagedRobots.reduce((prev, curr) => {
        const dPrev = Math.abs(prev.x - robotState.x) + Math.abs(prev.y - robotState.y);
        const dCurr = Math.abs(curr.x - robotState.x) + Math.abs(curr.y - robotState.y);
        return dCurr < dPrev ? curr : prev;
      })
    : null;

  // Extract GoTo target coordinates
  let goToTarget: { x: number; y: number } | null = null;
  let isAdjacentToMiner = false;
  let targetMinerId = '';

  // PRIORITY A: Battery is low -> Nearest Station
  if (isEnergyLow && scriptMentionsStation) {
    goToTarget = { x: nearestStation.x, y: nearestStation.y };
  }
  // PRIORITY B: Repair Drone -> Go to Damaged Robot
  else if ((robotState.role === 'REPAIR_DRONE' || hasRepairRobot) && nearestDamagedRobot) {
    const distToDamaged = Math.abs(nearestDamagedRobot.x - robotState.x) + Math.abs(nearestDamagedRobot.y - robotState.y);
    if (distToDamaged > 2) {
      goToTarget = { x: nearestDamagedRobot.x, y: nearestDamagedRobot.y };
    }
  }
  // PRIORITY C: Transporter -> Full Cargo -> Nearest Depot
  else if ((isCargo100Percent || (isCargoAlmostFull && !scriptEmitsRadio)) && scriptMentionsDepot) {
    goToTarget = { x: nearestDepot.x, y: nearestDepot.y };
  }
  // PRIORITY D: Transporter Swarm Call -> Go to Miner sending CARGO_FULL
  else if (activeCargoFullMsg && (scriptMentionsRadio || robotState.role === 'TRANSPORTER') && robotState.canMine === false) {
    goToTarget = { x: activeCargoFullMsg.x, y: activeCargoFullMsg.y };
    const dist = Math.abs(activeCargoFullMsg.x - robotState.x) + Math.abs(activeCargoFullMsg.y - robotState.y);
    if (dist <= 2) {
      isAdjacentToMiner = true;
      targetMinerId = activeCargoFullMsg.senderId || '';
    }
  }
  // PRIORITY E: General GoTo target parsing from C# code
  else {
    const goToMatch = code.match(/robot\s*\.\s*GoTo\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/i);
    if (goToMatch) {
      const rawX = goToMatch[1].trim();
      const rawY = goToMatch[2].trim();
      let parsedX = parseInt(rawX, 10);
      let parsedY = parseInt(rawY, 10);

      // Handle variable names e.g. GoTo(depot.X, depot.Y), GoTo(station.X, station.Y), GoTo(msg.X, msg.Y)
      if (isNaN(parsedX) || isNaN(parsedY)) {
        if (/depot/i.test(rawX)) {
          if (isCargoAlmostFull || isCargo100Percent) {
            parsedX = nearestDepot.x;
            parsedY = nearestDepot.y;
          }
        } else if (/station|pad/i.test(rawX)) {
          if (isEnergyLow) {
            parsedX = nearestStation.x;
            parsedY = nearestStation.y;
          }
        } else if (/msg/i.test(rawX) && activeCargoFullMsg) {
          parsedX = activeCargoFullMsg.x;
          parsedY = activeCargoFullMsg.y;
        } else if (/target/i.test(rawX) && nearestDamagedRobot) {
          parsedX = nearestDamagedRobot.x;
          parsedY = nearestDamagedRobot.y;
        } else if ((/resource|ore/i.test(rawX) || /targetResource/i.test(rawX)) && nearestResource) {
          const resObj = nearestResource as ResourceNode;
          parsedX = resObj.x;
          parsedY = resObj.y;
        }
      }

      if (!isNaN(parsedX) && !isNaN(parsedY)) {
        goToTarget = { x: parsedX, y: parsedY };
      }
    }
  }

  const scriptUsesRadar = /GetRadarInfo|RadarTileInfo/i.test(code);
  const distToDamaged = nearestDamagedRobot
    ? Math.abs(nearestDamagedRobot.x - robotState.x) + Math.abs(nearestDamagedRobot.y - robotState.y)
    : 999;
  const isRepairingTarget = (hasRepairRobot || robotState.role === 'REPAIR_DRONE') && nearestDamagedRobot && distToDamaged <= 2;

  // Determine Navigation vs Mining vs Repairing
  if (isRepairingTarget) {
    shouldMove = false;
    shouldMine = false;
  } else if (robotState.canMine !== false && adjacentResourceTile && globalHasMine && (!goToTarget || (goToTarget.x === adjacentResourceTile.x && goToTarget.y === adjacentResourceTile.y))) {
    shouldMine = true;
  } else if (globalHasMove || globalHasGoTo || goToTarget || robotState.canMine === false) {
    shouldMove = true;

    // Pick target: GoTo target > Radar Target > Explicit Direction / Straight Forward / Patrol
    const target: { x: number; y: number } | null = goToTarget || (scriptUsesRadar ? nearestResource : null);

    if (target) {
      const dx = target.x - robotState.x;
      const dy = target.y - robotState.y;

      if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
        moveDir = dx > 0 ? 'EAST' : 'WEST';
      } else if (dy !== 0) {
        moveDir = dy > 0 ? 'SOUTH' : 'NORTH';
      }
    } else {
      // Patrol / Wander loop for drones when no active targets exist
      const allDirs: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
      const validDirs = allDirs.filter((d) => {
        if (d === 'NORTH' && robotState.y <= 0) return false;
        if (d === 'SOUTH' && robotState.y >= gridSize.height - 1) return false;
        if (d === 'WEST' && robotState.x <= 0) return false;
        if (d === 'EAST' && robotState.x >= gridSize.width - 1) return false;
        return true;
      });

      // Keep moving in current direction if valid, otherwise rotate
      if (validDirs.includes(robotState.direction)) {
        moveDir = robotState.direction;
      } else if (validDirs.length > 0) {
        moveDir = validDirs[Math.floor(Math.random() * validDirs.length)];
      }
    }
  }

  const hasDepositRaw = /DepositRawMaterial/i.test(code);
  const hasProcess = /ProcessMaterial/i.test(code);
  const hasCollectProcessed = /CollectProcessedProduct/i.test(code);
  const hasSendRadio = /SendRadioMessage/i.test(code);
  const hasTransferToRobot = /TransferCargoToRobot/i.test(code);
  const hasCoolPlant = /CoolPowerPlant/i.test(code);

  // 5. Generate Actions & Logs
  if (hasSendRadio) {
    const match = code.match(/SendRadioMessage\s*\(\s*"([^"]+)"/i);
    const msgType = match ? match[1] : 'CARGO_FULL';
    logs.push({
      action: 'SEND_RADIO_MESSAGE',
      payload: JSON.stringify({ messageType: msgType, x: robotState.x, y: robotState.y }),
      message: lang === 'en'
        ? `📡 ${robotState.name} broadcasting '${msgType}' radio signal on frequency ('SendRadioMessage').`
        : `📡 ${robotState.name} radyo şebekesine '${msgType}' yayını yapıyor ('SendRadioMessage').`,
    });
  }

  if (isRepairingTarget && nearestDamagedRobot) {
    logs.push({
      action: 'REPAIR_ROBOT',
      payload: nearestDamagedRobot.id,
      message: lang === 'en'
        ? `🛠️ ${robotState.name} activated laser repair beam repairing '${nearestDamagedRobot.name}' (+25 HP).`
        : `🛠️ ${robotState.name} lazer tamir ışınını aktifleştirip '${nearestDamagedRobot.name}' robotunu onarıyor (+25 HP).`,
    });
  } else if (hasCoolPlant) {
    const match = code.match(/CoolPowerPlant\s*\(\s*"([^"]+)"/i);
    const plantId = match ? match[1] : '';
    logs.push({
      action: 'COOL_POWER_PLANT',
      payload: plantId,
      message: lang === 'en'
        ? `❄️ ${robotState.name} spraying coolant fluid to cool power plant ('CoolPowerPlant').`
        : `❄️ ${robotState.name} termal santrale soğutucu sıvı sıkarak sıcaklığı düşürüyor ('CoolPowerPlant').`,
    });
  } else if (hasCollectFromRobot && (isAdjacentToMiner || activeCargoFullMsg)) {
    const minerId = targetMinerId || activeCargoFullMsg?.senderId || '';
    logs.push({
      action: 'COLLECT_CARGO_FROM_ROBOT',
      payload: minerId,
      message: lang === 'en'
        ? `🚚 ${robotState.name} collecting cargo hold from miner robot ('CollectCargoFromRobot').`
        : `🚚 ${robotState.name} madenci robottan kargoyu devralıyor ('CollectCargoFromRobot').`,
    });
  } else if (hasTransferToRobot) {
    const match = code.match(/TransferCargoToRobot\s*\(\s*"([^"]+)"/i);
    const targetId = match ? match[1] : '';
    logs.push({
      action: 'TRANSFER_CARGO_TO_ROBOT',
      payload: targetId,
      message: lang === 'en'
        ? `📦 ${robotState.name} transferring cargo to transporter robot ('TransferCargoToRobot').`
        : `📦 ${robotState.name} kargosunu kargocu robota devrediyor ('TransferCargoToRobot').`,
    });
  } else if (hasDepositRaw) {
    logs.push({
      action: 'DEPOSIT_RAW_MATERIAL',
      payload: 'DEPOSIT',
      message: lang === 'en'
        ? `${robotState.name} unloading raw materials to facility ('DepositRawMaterial').`
        : `${robotState.name} kargosundaki ham maddeleri tesise teslim ediyor ('DepositRawMaterial').`,
    });
  } else if (hasProcess) {
    logs.push({
      action: 'PROCESS_MATERIAL',
      payload: 'PROCESS',
      message: lang === 'en'
        ? `${robotState.name} smelting/refining raw materials at facility ('ProcessMaterial').`
        : `${robotState.name} tesisteki ham maddeleri döküm/rafine ediyor ('ProcessMaterial').`,
    });
  } else if (hasCollectProcessed) {
    logs.push({
      action: 'COLLECT_PROCESSED',
      payload: 'COLLECT',
      message: lang === 'en'
        ? `${robotState.name} loading 10x processed products from facility ('CollectProcessedProduct').`
        : `${robotState.name} tesisten işlenmiş 10x değerli ürünleri kargosuna yüklüyor ('CollectProcessedProduct').`,
    });
  } else if (shouldMine) {
    const targetTile = adjacentResourceTile || standingOnResource;
    const payload = targetTile
      ? JSON.stringify({ x: targetTile.x, y: targetTile.y })
      : 'RESOURCE_TILE';

    logs.push({
      action: 'MINE',
      payload,
      message: lang === 'en'
        ? `${robotState.name} detected ore node and mined via 'robot.Mine()'.`
        : `${robotState.name} maden tespit etti ve 'robot.Mine()' ile kazı yaptı.`,
    });
  } else if (shouldMove) {
    logs.push({
      action: 'MOVE',
      payload: moveDir,
      message: lang === 'en'
        ? `${robotState.name} moved in direction '${moveDir}'.`
        : `${robotState.name} '${moveDir}' yönüne hareket etti.`,
    });
  } else {
    logs.push({
      action: 'IDLE',
      payload: 'NONE',
      message: lang === 'en'
        ? `${robotState.name} is standing by (IDLE).`
        : `${robotState.name} bekleme durumunda (IDLE).`,
    });
  }

  return {
    success: true,
    diagnostics: [],
    logs,
  };
}

export interface PowerPlantLog {
  action: 'BURN_FUEL' | 'SET_OVERCLOCK' | 'IDLE';
  payload: string;
  message: string;
}

export interface PowerPlantExecutionResult {
  success: boolean;
  diagnostics: string[];
  logs: PowerPlantLog[];
}

export function compileAndRunPowerPlantCSharp(
  code: string,
  plant: {
    id: string;
    name: string;
    temperature: number;
    powerBuffer: number;
    maxPowerBuffer: number;
    isOverheated: boolean;
  }
): PowerPlantExecutionResult {
  const logs: PowerPlantLog[] = [];

  if (plant.isOverheated) {
    logs.push({
      action: 'IDLE',
      payload: 'OVERHEATED',
      message: `${plant.name} aşırı ısınma nedeniyle kilitli durumdadır (SHUTDOWN).`,
    });
    return { success: true, diagnostics: [], logs };
  }

  // Parse SetOverclockRate call e.g. plant.SetOverclockRate(1.6);
  const overclockMatch = code.match(/SetOverclockRate\s*\(\s*([0-9.]+)\s*\)/i);
  if (overclockMatch) {
    const rate = parseFloat(overclockMatch[1]);
    if (!isNaN(rate)) {
      logs.push({
        action: 'SET_OVERCLOCK',
        payload: rate.toString(),
        message: `${plant.name} verimlilik/hız oranı ${rate.toFixed(1)}x olarak ayarlandı.`,
      });
    }
  }

  // Parse BurnFuel call e.g. plant.BurnFuel("COAL_ORE");
  const burnMatch = code.match(/BurnFuel\s*\(\s*"([^"]+)"\s*\)/i);
  if (burnMatch) {
    const sku = burnMatch[1];
    logs.push({
      action: 'BURN_FUEL',
      payload: sku,
      message: `${plant.name} deponuzdan '${sku}' çekip yakıt tankına alıyor.`,
    });
  }

  if (logs.length === 0) {
    logs.push({
      action: 'IDLE',
      payload: 'NORMAL',
      message: `${plant.name} standart modda beklemede.`,
    });
  }

  return { success: true, diagnostics: [], logs };
}
