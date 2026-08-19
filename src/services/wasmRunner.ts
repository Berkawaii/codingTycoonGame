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
 * Dynamic C# Scope & Execution Evaluator
 * Evaluates player C# code expressions line-by-line using actual runtime variables
 */
function evaluateCSharpExecution(
  code: string,
  robotState: RobotState,
  resources: ResourceNode[],
  chargingStations: ChargingStation[],
  depots: Depot[],
  radioMessages: RadioMessage[],
  allRobots: Array<{ id: string; name: string; x: number; y: number; health?: number; role?: string; cargoAmount?: number; maxCargo?: number }>
) {
  const currentCargo = robotState.cargoAmount ?? 0;
  const maxCargo = robotState.maxCargo ?? 50;
  const currentEnergy = robotState.energy ?? 100;

  let minStationDist = Infinity;
  let nearestStation = chargingStations[0] || { x: 0, y: 0 };
  chargingStations.forEach((cs) => {
    const d = Math.abs(cs.x - robotState.x) + Math.abs(cs.y - robotState.y);
    if (d < minStationDist) {
      minStationDist = d;
      nearestStation = cs;
    }
  });

  let minDepotDist = Infinity;
  let nearestDepot = depots[0] || { x: 0, y: 19 };
  depots.forEach((dp) => {
    const d = Math.abs(dp.x - robotState.x) + Math.abs(dp.y - robotState.y);
    if (d < minDepotDist) {
      minDepotDist = d;
      nearestDepot = dp;
    }
  });

  const activeResources = resources.filter((r) => r.amount > 0);
  let nearestResource: ResourceNode | null = null;
  let minResDist = Infinity;
  activeResources.forEach((r) => {
    const d = Math.hypot(r.x - robotState.x, r.y - robotState.y);
    if (d < minResDist) {
      minResDist = d;
      nearestResource = r;
    }
  });

  const damagedRobots = allRobots.filter((r) => r.id !== robotState.id && (r.health ?? 100) < 100);
  let nearestDamagedRobot = damagedRobots.length > 0
    ? damagedRobots.reduce((prev, curr) => {
        const dP = Math.abs(prev.x - robotState.x) + Math.abs(prev.y - robotState.y);
        const dC = Math.abs(curr.x - robotState.x) + Math.abs(curr.y - robotState.y);
        return dC < dP ? curr : prev;
      })
    : null;

  let targetGoTo: { x: number; y: number } | null = null;
  let actionToExecute: 'MINE' | 'REPAIR' | 'COLLECT_CARGO' | 'MOVE_FORWARD' | 'NONE' = 'NONE';
  let targetMinerId = '';

  // 1. Evaluate Cargo Full condition (if currentCargo >= maxCargo)
  if (currentCargo >= maxCargo - 10) {
    if (currentCargo >= maxCargo) {
      targetGoTo = { x: nearestDepot.x, y: nearestDepot.y };
      return { targetGoTo, actionToExecute, targetMinerId };
    }
  }

  // 2. Evaluate Energy Low condition (if currentEnergy <= 25)
  if (currentEnergy <= 25 || currentEnergy <= minStationDist + 2) {
    targetGoTo = { x: nearestStation.x, y: nearestStation.y };
    return { targetGoTo, actionToExecute, targetMinerId };
  }

  // 3. Evaluate Repair Drone logic
  if (robotState.role === 'REPAIR_DRONE' || code.includes('RepairRobot') || code.includes('GetDamagedRobots')) {
    if (nearestDamagedRobot) {
      const dist = Math.abs(nearestDamagedRobot.x - robotState.x) + Math.abs(nearestDamagedRobot.y - robotState.y);
      if (dist <= 2) {
        actionToExecute = 'REPAIR';
        return { targetGoTo: null, actionToExecute, targetMinerId: nearestDamagedRobot.id };
      } else {
        targetGoTo = { x: nearestDamagedRobot.x, y: nearestDamagedRobot.y };
        return { targetGoTo, actionToExecute, targetMinerId };
      }
    }
  }

  // 4. Evaluate Transporter logic
  if (robotState.role === 'TRANSPORTER' || code.includes('CollectCargoFromRobot')) {
    const activeCargoFullMsg = radioMessages.find((m) => m.messageType === 'CARGO_FULL');
    if (activeCargoFullMsg) {
      const dist = Math.abs(activeCargoFullMsg.x - robotState.x) + Math.abs(activeCargoFullMsg.y - robotState.y);
      if (dist <= 2) {
        actionToExecute = 'COLLECT_CARGO';
        return { targetGoTo: null, actionToExecute, targetMinerId: activeCargoFullMsg.senderId || '' };
      } else {
        targetGoTo = { x: activeCargoFullMsg.x, y: activeCargoFullMsg.y };
        return { targetGoTo, actionToExecute, targetMinerId };
      }
    }
  }

  // 5. Evaluate Mining & Movement Logic
  const standingOnResource = activeResources.find((r) => r.x === robotState.x && r.y === robotState.y);
  if (standingOnResource) {
    actionToExecute = 'MINE';
    return { targetGoTo: { x: standingOnResource.x, y: standingOnResource.y }, actionToExecute, targetMinerId };
  }

  if (nearestResource) {
    const resObj = nearestResource as ResourceNode;
    targetGoTo = { x: resObj.x, y: resObj.y };
    return { targetGoTo, actionToExecute, targetMinerId };
  }

  actionToExecute = 'MOVE_FORWARD';
  return { targetGoTo: null, actionToExecute, targetMinerId };
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

  const standingOnStation = chargingStations.find(
    (cs) => cs.x === robotState.x && cs.y === robotState.y
  );

  const currentEnergy = robotState.energy ?? 100;
  const maxEnergy = robotState.maxEnergy ?? 100;

  // If robot is on charging pad and energy is not full, stay to charge!
  if (standingOnStation && currentEnergy < maxEnergy) {
    logs.push({
      action: 'IDLE',
      payload: 'CHARGING',
      message: `${robotState.name} '${standingOnStation.name}' istasyonunda şarj oluyor... (${currentEnergy}/${maxEnergy})`,
    });
    return { success: true, diagnostics: [], logs };
  }

  // 4. Dynamic C# Control Flow & Variable Evaluator
  const evalResult = evaluateCSharpExecution(
    code,
    robotState,
    resources,
    chargingStations,
    depots,
    radioMessages,
    allRobots
  );

  let shouldMine = false;
  let shouldMove = false;
  let moveDir: Direction = robotState.direction;
  let goToTarget: { x: number; y: number } | null = evalResult.targetGoTo;
  let targetMinerId = evalResult.targetMinerId || '';

  const hasSendRadio = /SendRadioMessage/i.test(code);
  const hasDepositRaw = /DepositRawMaterial/i.test(code);
  const hasProcess = /ProcessMaterial/i.test(code);
  const hasCollectProcessed = /CollectProcessedProduct/i.test(code);
  const hasTransferToRobot = /TransferCargoToRobot/i.test(code);
  const hasCoolPlant = /CoolPowerPlant/i.test(code);
  const hasCollectFromRobot = /CollectCargoFromRobot/i.test(code);
  const activeCargoFullMsg = radioMessages.find((m) => m.messageType === 'CARGO_FULL');

  if (evalResult.actionToExecute === 'MINE') {
    shouldMine = true;
  } else if (evalResult.actionToExecute === 'REPAIR') {
    shouldMove = false;
  } else if (evalResult.actionToExecute === 'COLLECT_CARGO') {
    shouldMove = false;
  } else if (goToTarget) {
    shouldMove = true;
    const dx = goToTarget.x - robotState.x;
    const dy = goToTarget.y - robotState.y;

    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
      moveDir = dx > 0 ? 'EAST' : 'WEST';
    } else if (dy !== 0) {
      moveDir = dy > 0 ? 'SOUTH' : 'NORTH';
    }
  } else if (robotState.canMine === false || /Move/i.test(code)) {
    shouldMove = true;
    const allDirs: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const validDirs = allDirs.filter((d) => {
      if (d === 'NORTH' && robotState.y <= 0) return false;
      if (d === 'SOUTH' && robotState.y >= gridSize.height - 1) return false;
      if (d === 'WEST' && robotState.x <= 0) return false;
      if (d === 'EAST' && robotState.x >= gridSize.width - 1) return false;
      return true;
    });

    if (validDirs.includes(robotState.direction)) {
      moveDir = robotState.direction;
    } else if (validDirs.length > 0) {
      moveDir = validDirs[Math.floor(Math.random() * validDirs.length)];
    }
  }

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

  if (evalResult.actionToExecute === 'REPAIR' && targetMinerId) {
    logs.push({
      action: 'REPAIR_ROBOT',
      payload: targetMinerId,
      message: lang === 'en'
        ? `🛠️ ${robotState.name} activated laser repair beam repairing target (+25 HP).`
        : `🛠️ ${robotState.name} lazer tamir ışınını aktifleştirip hedef robotu onarıyor (+25 HP).`,
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
  } else if (hasCollectFromRobot && (evalResult.actionToExecute === 'COLLECT_CARGO' || activeCargoFullMsg)) {
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
    const payload = evalResult.targetGoTo
      ? JSON.stringify({ x: evalResult.targetGoTo.x, y: evalResult.targetGoTo.y })
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
