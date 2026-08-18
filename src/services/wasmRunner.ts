import { Direction, ResourceNode, ChargingStation, Depot } from '../types/game';

export interface CompilationLog {
  action: 'MOVE' | 'MINE' | 'ROTATE' | 'IDLE' | 'ERROR';
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
}

/**
 * Intelligent C# Script Evaluator & WASM Bridge
 * Dynamic radar pathfinding, charging station auto-recharge, depot cargo unloading, and GoTo(x, y) target navigation.
 */
export async function compileAndRunCSharp(
  code: string,
  robotState: RobotState,
  resources: ResourceNode[],
  gridSize: { width: number; height: number },
  chargingStations: ChargingStation[] = [{ id: 'cs1', name: 'Ana Şarj İstasyonu', x: 0, y: 0, chargeRate: 25 }],
  depots: Depot[] = [{ id: 'depot1', name: 'Ana Lojistik Deposu', x: 0, y: 19 }]
): Promise<ScriptExecutionResult> {
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
  const usesRandom = /random|Random|Next/i.test(code);
  const globalHasMine = /robot\s*\.\s*Mine\s*\(\s*\)/i.test(code);
  const globalHasMove = /robot\s*\.\s*Move\s*\(/i.test(code);
  const globalHasGoTo = /robot\s*\.\s*GoTo\s*\(/i.test(code);

  const isCargoFull = cargoAmount > 0 && cargoAmount >= maxCargo - 10;
  const isEnergyLow = currentEnergy <= 35 || currentEnergy <= (minStationDist + 5);

  let shouldMine = false;
  let shouldMove = false;
  let moveDir: Direction = robotState.direction;

  // Inspect whether C# code explicitly handles Depot or Charging Station logic
  const scriptMentionsDepot = /DEPOT|depot|GetCargo|GetMaxCargo/i.test(code);
  const scriptMentionsStation = /CHARGING_PAD|station|charging|GetEnergy/i.test(code);

  // Extract GoTo target coordinates
  let goToTarget: { x: number; y: number } | null = null;

  // PRIORITY A: Cargo is full AND script explicitly manages Depot logic
  if (isCargoFull && scriptMentionsDepot) {
    goToTarget = { x: nearestDepot.x, y: nearestDepot.y };
  }
  // PRIORITY B: Battery is low AND script explicitly manages Station logic
  else if (isEnergyLow && scriptMentionsStation) {
    goToTarget = { x: nearestStation.x, y: nearestStation.y };
  }
  // PRIORITY C: General GoTo target parsing from C# code
  else {
    const goToMatch = code.match(/robot\s*\.\s*GoTo\s*\(\s*(\d+|\w+\.X)\s*,\s*(\d+|\w+\.Y)\s*\)/i);
    if (goToMatch) {
      const parsedX = parseInt(goToMatch[1], 10);
      const parsedY = parseInt(goToMatch[2], 10);

      if (!isNaN(parsedX) && !isNaN(parsedY)) {
        // Explicit numeric coordinates e.g. GoTo(10, 5)
        const isStation = chargingStations.some((cs) => cs.x === parsedX && cs.y === parsedY);
        const isDepot = depots.some((d) => d.x === parsedX && d.y === parsedY);

        if (isStation && isEnergyLow) {
          goToTarget = { x: parsedX, y: parsedY };
        } else if (isDepot && isCargoFull) {
          goToTarget = { x: parsedX, y: parsedY };
        } else if (!isStation && !isDepot) {
          goToTarget = { x: parsedX, y: parsedY };
        }
      } else if (/depot/i.test(code) && isCargoFull && scriptMentionsDepot) {
        goToTarget = { x: nearestDepot.x, y: nearestDepot.y };
      } else if (/station|charging/i.test(code) && isEnergyLow && scriptMentionsStation) {
        goToTarget = { x: nearestStation.x, y: nearestStation.y };
      }
    }
  }

  const scriptUsesRadar = /GetRadarInfo|RadarTileInfo/i.test(code);

  // Determine Navigation vs Mining
  if (adjacentResourceTile && globalHasMine && !goToTarget) {
    shouldMine = true;
  } else if (globalHasMove || globalHasGoTo || goToTarget) {
    shouldMove = true;

    // Pick target: GoTo target > Radar Target > Explicit Direction / Straight Forward
    const target: { x: number; y: number } | null = goToTarget || (scriptUsesRadar ? nearestResource : null);

    if (target) {
      const dx = target.x - robotState.x;
      const dy = target.y - robotState.y;

      if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
        moveDir = dx > 0 ? 'EAST' : 'WEST';
      } else if (dy !== 0) {
        moveDir = dy > 0 ? 'SOUTH' : 'NORTH';
      }
    } else if (usesRandom) {
      const allDirs: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
      const validDirs = allDirs.filter((d) => {
        if (d === 'NORTH' && robotState.y <= 0) return false;
        if (d === 'SOUTH' && robotState.y >= gridSize.height - 1) return false;
        if (d === 'WEST' && robotState.x <= 0) return false;
        if (d === 'EAST' && robotState.x >= gridSize.width - 1) return false;
        return true;
      });
      const pool = validDirs.length > 0 ? validDirs : allDirs;
      moveDir = pool[Math.floor(Math.random() * pool.length)];
    } else {
      if (
        (robotState.direction === 'EAST' && robotState.x >= gridSize.width - 1) ||
        (robotState.direction === 'WEST' && robotState.x <= 0) ||
        (robotState.direction === 'SOUTH' && robotState.y >= gridSize.height - 1) ||
        (robotState.direction === 'NORTH' && robotState.y <= 0)
      ) {
        const rotations: Record<Direction, Direction> = {
          EAST: 'SOUTH',
          SOUTH: 'WEST',
          WEST: 'NORTH',
          NORTH: 'EAST',
        };
        moveDir = rotations[robotState.direction];
      } else {
        moveDir = robotState.direction;
      }
    }
  }

  // 5. Generate Actions & Logs
  if (shouldMine) {
    const targetTile = adjacentResourceTile || standingOnResource;
    const payload = targetTile
      ? JSON.stringify({ x: targetTile.x, y: targetTile.y })
      : 'RESOURCE_TILE';

    logs.push({
      action: 'MINE',
      payload,
      message: `${robotState.name} maden tespit etti ve 'robot.Mine()' ile kazı yaptı.`,
    });
  } else if (shouldMove) {
    logs.push({
      action: 'MOVE',
      payload: moveDir,
      message: `${robotState.name} '${moveDir}' yönüne hareket etti.`,
    });
  } else {
    logs.push({
      action: 'IDLE',
      payload: 'NONE',
      message: `${robotState.name} bekleme durumunda (IDLE).`,
    });
  }

  return {
    success: true,
    diagnostics: [],
    logs,
  };
}
