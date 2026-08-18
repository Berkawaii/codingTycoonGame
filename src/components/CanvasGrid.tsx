import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKU_CATALOG } from '../constants/skus';
import { Direction } from '../types/game';
import { BatteryCharging, Building2, X } from 'lucide-react';

interface SmoothPos {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  pixelX: number;
  pixelY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  id: string;
  text: string;
  pixelX: number;
  pixelY: number;
  color: string;
  life: number;
  maxLife: number;
}

export const CanvasGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    gridSize,
    robots,
    resources,
    chargingStations,
    depots,
    credits,
    selectedRobotId,
    setSelectedRobotId,
    buyChargingStation,
    buyDepot,
  } = useGameStore();

  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [quickTile, setQuickTile] = useState<{ x: number; y: number; pixelX: number; pixelY: number } | null>(null);

  // Animation Engine Refs
  const smoothPosRef = useRef<Record<string, SmoothPos>>({});
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const prevRobotStatesRef = useRef<Record<string, { status: string; energy: number; cargo: number; x: number; y: number }>>({});
  const animTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Helper to render direction arrow
  const drawDirectionArrow = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    direction: Direction
  ) => {
    ctx.save();
    ctx.translate(centerX, centerY);

    let angle = 0;
    switch (direction) {
      case 'NORTH':
        angle = -Math.PI / 2;
        break;
      case 'EAST':
        angle = 0;
        break;
      case 'SOUTH':
        angle = Math.PI / 2;
        break;
      case 'WEST':
        angle = Math.PI;
        break;
    }
    ctx.rotate(angle);

    // Draw arrow shape
    ctx.beginPath();
    ctx.moveTo(radius * 0.7, 0);
    ctx.lineTo(-radius * 0.4, -radius * 0.5);
    ctx.lineTo(-radius * 0.2, 0);
    ctx.lineTo(-radius * 0.4, radius * 0.5);
    ctx.closePath();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  };

  // Detect Robot Events (Mining, Charging, Unloading) and Spawn Particles / Floating Text
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cellWidth = rect.width / gridSize.width;
    const cellHeight = rect.height / gridSize.height;

    robots.forEach((robot) => {
      const prev = prevRobotStatesRef.current[robot.id];
      const pixelX = robot.x * cellWidth + cellWidth / 2;
      const pixelY = robot.y * cellHeight + cellHeight / 2;

      if (prev) {
        // Event 1: Mining Event (+Cargo)
        if (robot.cargoAmount > prev.cargo && robot.status === 'MINING') {
          const minedDiff = robot.cargoAmount - prev.cargo;
          // Spawn Floating Green/Gold Text
          floatingTextsRef.current.push({
            id: `text-${Date.now()}-${Math.random()}`,
            text: `+${minedDiff} kg [KAZILDI]`,
            pixelX,
            pixelY: pixelY - 15,
            color: '#34d399',
            life: 0,
            maxLife: 45,
          });

          // Spawn Laser Spark Particles
          for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2.5;
            particlesRef.current.push({
              x: robot.x,
              pixelX,
              pixelY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0,
              maxLife: 25 + Math.random() * 15,
              color: Math.random() > 0.5 ? '#00f2fe' : '#facc15',
              size: 2 + Math.random() * 3,
            });
          }
        }

        // Event 2: Charging Event (+Energy)
        if (robot.energy > prev.energy && (robot.status === 'CHARGING' || prev.status === 'CHARGING')) {
          const energyDiff = robot.energy - prev.energy;
          floatingTextsRef.current.push({
            id: `text-charge-${Date.now()}-${Math.random()}`,
            text: `+${energyDiff} Enerji`,
            pixelX,
            pixelY: pixelY - 15,
            color: '#facc15',
            life: 0,
            maxLife: 40,
          });

          // Electric Sparks
          for (let i = 0; i < 5; i++) {
            particlesRef.current.push({
              x: robot.x,
              pixelX: pixelX + (Math.random() - 0.5) * cellWidth * 0.6,
              pixelY: pixelY + (Math.random() - 0.5) * cellHeight * 0.6,
              vx: (Math.random() - 0.5) * 1.5,
              vy: -1 - Math.random() * 2,
              life: 0,
              maxLife: 20 + Math.random() * 10,
              color: '#facc15',
              size: 2.5,
            });
          }
        }

        // Event 3: Depot Unload Event (Cargo drop to 0)
        if (prev.cargo > 0 && robot.cargoAmount === 0) {
          floatingTextsRef.current.push({
            id: `text-unload-${Date.now()}-${Math.random()}`,
            text: `-${prev.cargo} kg Depoya Teslim`,
            pixelX,
            pixelY: pixelY - 20,
            color: '#38bdf8',
            life: 0,
            maxLife: 55,
          });

          // Unload Conveyor Particles
          for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            particlesRef.current.push({
              x: robot.x,
              pixelX,
              pixelY,
              vx: Math.cos(angle) * 2,
              vy: Math.sin(angle) * 2,
              life: 0,
              maxLife: 30,
              color: '#06b6d4',
              size: 3,
            });
          }
        }

        // Event 4: Movement Thrust Flames
        if (robot.status === 'MOVING' && (robot.x !== prev.x || robot.y !== prev.y)) {
          let flameDx = 0;
          let flameDy = 0;
          switch (robot.direction) {
            case 'EAST':
              flameDx = -1;
              break;
            case 'WEST':
              flameDx = 1;
              break;
            case 'NORTH':
              flameDy = 1;
              break;
            case 'SOUTH':
              flameDy = -1;
              break;
          }

          for (let i = 0; i < 3; i++) {
            particlesRef.current.push({
              x: robot.x,
              pixelX: pixelX + flameDx * (cellWidth * 0.35),
              pixelY: pixelY + flameDy * (cellHeight * 0.35),
              vx: flameDx * (1 + Math.random()) + (Math.random() - 0.5),
              vy: flameDy * (1 + Math.random()) + (Math.random() - 0.5),
              life: 0,
              maxLife: 15,
              color: Math.random() > 0.5 ? '#ff4b1f' : '#ff9000',
              size: 2.5,
            });
          }
        }
      }

      // Update state cache
      prevRobotStatesRef.current[robot.id] = {
        status: robot.status,
        energy: robot.energy,
        cargo: robot.cargoAmount,
        x: robot.x,
        y: robot.y,
      };
    });
  }, [robots, gridSize]);

  // Main 60 FPS Render Loop with Smooth Interpolation, Pulse Effects & Particles
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const cellWidth = rect.width / gridSize.width;
    const cellHeight = rect.height / gridSize.height;

    animTimeRef.current += 1;
    const time = animTimeRef.current;

    // 1. Draw Deep Space Grid Background
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Grid lines with neon contrast
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let x = 0; x <= gridSize.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, rect.height);
      ctx.stroke();
    }

    for (let y = 0; y <= gridSize.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(rect.width, y * cellHeight);
      ctx.stroke();
    }

    // 2. Draw Charging Stations (Clean Neon Pads)
    chargingStations.forEach((cs) => {
      const padX = cs.x * cellWidth;
      const padY = cs.y * cellHeight;
      const padCenterX = padX + cellWidth / 2;
      const padCenterY = padY + cellHeight / 2;

      ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
      ctx.fillRect(padX + 2, padY + 2, cellWidth - 4, cellHeight - 4);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(padX + 4, padY + 4, cellWidth - 8, cellHeight - 8);

      ctx.fillStyle = '#facc15';
      ctx.font = `bold ${Math.round(cellHeight * 0.32)}px Fira Code, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PWR', padCenterX, padCenterY);
    });

    // 2.5 Draw Depots (Clean Neon Pads)
    depots.forEach((d) => {
      const padX = d.x * cellWidth;
      const padY = d.y * cellHeight;
      const padCenterX = padX + cellWidth / 2;
      const padCenterY = padY + cellHeight / 2;

      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(padX + 2, padY + 2, cellWidth - 4, cellHeight - 4);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(padX + 4, padY + 4, cellWidth - 8, cellHeight - 8);

      ctx.fillStyle = '#22d3ee';
      ctx.font = `bold ${Math.round(cellHeight * 0.32)}px Fira Code, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DEP', padCenterX, padCenterY);
    });

    // 3. Draw Hovered & QuickSelected Tile Highlight
    const activeHighlight = quickTile || hoveredTile;
    if (activeHighlight) {
      ctx.fillStyle = quickTile ? 'rgba(0, 242, 254, 0.25)' : 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(
        activeHighlight.x * cellWidth,
        activeHighlight.y * cellHeight,
        cellWidth,
        cellHeight
      );
      ctx.strokeStyle = quickTile ? '#00f2fe' : '#38bdf8';
      ctx.lineWidth = quickTile ? 2 : 1.5;
      ctx.strokeRect(
        activeHighlight.x * cellWidth,
        activeHighlight.y * cellHeight,
        cellWidth,
        cellHeight
      );
    }

    // 4. Draw Resource Nodes
    resources.forEach((res) => {
      if (res.amount <= 0) return;

      const centerX = res.x * cellWidth + cellWidth / 2;
      const centerY = res.y * cellHeight + cellHeight / 2;
      const radius = Math.min(cellWidth, cellHeight) * 0.32;
      const skuDef = SKU_CATALOG[res.sku];
      const color = skuDef?.color || '#3b82f6';

      // Glow effect for resource node
      ctx.shadowColor = color;
      ctx.shadowBlur = 14 + Math.sin(time * 0.08) * 4;

      // Outer ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = color + '33';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner core
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Amount bar under resource
      const barWidth = cellWidth * 0.75;
      const barHeight = 4;
      const barX = centerX - barWidth / 2;
      const barY = centerY + radius + 4;
      const ratio = res.amount / res.maxAmount;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = color;
      ctx.fillRect(barX, barY, barWidth * ratio, barHeight);
    });

    // 5. Draw Contextual Mining Animations (Ground Drill vs Forward Laser Beam)
    robots.forEach((robot) => {
      if (robot.status === 'MINING') {
        const smooth = smoothPosRef.current[robot.id] || { x: robot.x, y: robot.y };
        const robotCenterX = smooth.x * cellWidth + cellWidth / 2;
        const robotCenterY = smooth.y * cellHeight + cellHeight / 2;
        const radius = Math.min(cellWidth, cellHeight) * 0.38;

        // Check if robot is standing directly ON TOP of an active resource tile
        const standingOnRes = resources.find(
          (r) => r.x === robot.x && r.y === robot.y && r.amount > 0
        );

        ctx.save();

        if (standingOnRes) {
          // CASE A: Standing directly ON top of the resource -> Ground Vertical Plasma Drill Aura!
          const pulseRadius = radius * (1.1 + Math.sin(time * 0.25) * 0.15);
          ctx.beginPath();
          ctx.arc(robotCenterX, robotCenterY, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
          ctx.fill();
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 14;
          ctx.stroke();
        } else {
          // CASE B: Standing adjacent to the resource -> Forward Laser Beam to front tile!
          let targetX = robot.x;
          let targetY = robot.y;
          switch (robot.direction) {
            case 'NORTH':
              targetY -= 1;
              break;
            case 'EAST':
              targetX += 1;
              break;
            case 'SOUTH':
              targetY += 1;
              break;
            case 'WEST':
              targetX -= 1;
              break;
          }

          const targetCenterX = targetX * cellWidth + cellWidth / 2;
          const targetCenterY = targetY * cellHeight + cellHeight / 2;

          // Outer Plasma Beam Glow
          ctx.beginPath();
          ctx.moveTo(robotCenterX, robotCenterY);
          ctx.lineTo(targetCenterX, targetCenterY);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 10;
          ctx.stroke();

          // Inner Core White Beam
          ctx.beginPath();
          ctx.moveTo(robotCenterX, robotCenterY);
          ctx.lineTo(targetCenterX, targetCenterY);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Impact Point Arc
          const pulseSize = 4 + Math.sin(time * 0.2) * 2;
          ctx.beginPath();
          ctx.arc(targetCenterX, targetCenterY, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = '#00f2fe';
          ctx.shadowBlur = 12;
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // 6. Draw Robots with Smooth Position Lerp
    robots.forEach((robot) => {
      const isSelected = robot.id === selectedRobotId;

      // Initialize or Lerp smooth position
      if (!smoothPosRef.current[robot.id]) {
        smoothPosRef.current[robot.id] = { x: robot.x, y: robot.y };
      }
      const smooth = smoothPosRef.current[robot.id];
      smooth.x += (robot.x - smooth.x) * 0.18;
      smooth.y += (robot.y - smooth.y) * 0.18;

      const centerX = smooth.x * cellWidth + cellWidth / 2;
      const centerY = smooth.y * cellHeight + cellHeight / 2;
      const radius = Math.min(cellWidth, cellHeight) * 0.38;

      // Selection pulse ring
      if (isSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * (1.35 + Math.sin(time * 0.1) * 0.08), 0, Math.PI * 2);
        ctx.strokeStyle = '#00f2fe';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // Robot Body
      ctx.save();
      ctx.shadowColor = robot.color;
      ctx.shadowBlur = 12 + Math.sin(time * 0.05) * 4;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = robot.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Draw direction indicator arrow
      drawDirectionArrow(ctx, centerX, centerY, radius, robot.direction);

      // 1. Robot Energy Bar (⚡ Green/Red)
      const barWidth = cellWidth * 0.85;
      const barHeight = 3.5;
      const barX = centerX - barWidth / 2;
      const energyBarY = centerY - radius - 10;
      const energyRatio = Math.max(0, Math.min(1, robot.energy / robot.maxEnergy));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(barX, energyBarY, barWidth, barHeight);
      ctx.fillStyle = energyRatio > 0.3 ? '#22c55e' : '#ef4444';
      ctx.fillRect(barX, energyBarY, barWidth * energyRatio, barHeight);

      // 2. Robot Cargo Bar (📦 Cyan)
      const cargoBarY = centerY - radius - 5;
      const cargoRatio = Math.max(0, Math.min(1, robot.cargoAmount / robot.maxCargo));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(barX, cargoBarY, barWidth, barHeight);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX, cargoBarY, barWidth * cargoRatio, barHeight);
    });

    // 7. Update & Draw Spark / Flame Particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.life += 1;
      p.pixelX += p.vx;
      p.pixelY += p.vy;
      p.size *= 0.95;

      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(p.pixelX, p.pixelY, Math.max(1, p.size), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return p.life < p.maxLife;
    });

    // 8. Update & Draw Floating Text Indicators (+10kg, +30⚡)
    floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
      ft.life += 1;
      ft.pixelY -= 0.6; // Drift upwards

      const alpha = 1 - ft.life / ft.maxLife;
      ctx.save();
      ctx.font = 'bold 11px Fira Code, monospace';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.pixelX, ft.pixelY);
      ctx.restore();

      return ft.life < ft.maxLife;
    });
  }, [gridSize, robots, resources, chargingStations, depots, selectedRobotId, hoveredTile, quickTile]);

  // Continuous 60 FPS Animation Frame Loop
  useEffect(() => {
    const loop = () => {
      renderCanvas();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    window.addEventListener('resize', renderCanvas);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', renderCanvas);
    };
  }, [renderCanvas]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize.height);

    if (x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height) {
      setHoveredTile({ x, y });
    } else {
      setHoveredTile(null);
    }
  };

  const handleMouseLeave = () => setHoveredTile(null);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize.height);

    const clickedRobot = robots.find((r) => r.x === x && r.y === y);
    if (clickedRobot) {
      setSelectedRobotId(clickedRobot.id);
    }

    // Calculate relative pixel position inside container for popover
    const pixelX = Math.min(rect.width - 240, Math.max(10, e.clientX - rect.left));
    const pixelY = Math.min(rect.height - 180, Math.max(10, e.clientY - rect.top));

    setQuickTile({ x, y, pixelX, pixelY });
  };

  // Dynamic Building Prices
  const stationPrice = chargingStations.length === 1 ? 0 : Math.round(800 * Math.pow(1.5, chargingStations.length - 2));
  const depotPrice = depots.length === 1 ? 0 : Math.round(1200 * Math.pow(1.5, depots.length - 2));

  const handleQuickBuildStation = () => {
    if (!quickTile) return;
    buyChargingStation(`Şarj İstasyonu #${chargingStations.length + 1}`, quickTile.x, quickTile.y, stationPrice);
    setQuickTile(null);
  };

  const handleQuickBuildDepot = () => {
    if (!quickTile) return;
    buyDepot(`Lojistik Deposu #${depots.length + 1}`, quickTile.x, quickTile.y, depotPrice);
    setQuickTile(null);
  };

  return (
    <div className="canvas-wrapper" ref={containerRef} style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="canvas-element"
      />

      {/* Tooltip on Hover */}
      {hoveredTile && !quickTile && (
        <div className="canvas-tooltip">
          Grid: ({hoveredTile.x}, {hoveredTile.y})
          {chargingStations.find((cs) => cs.x === hoveredTile.x && cs.y === hoveredTile.y) && (
            <span className="ml-2 text-amber-400 font-semibold">
              | Şarj İstasyonu
            </span>
          )}
          {depots.find((d) => d.x === hoveredTile.x && d.y === hoveredTile.y) && (
            <span className="ml-2 text-cyan-400 font-semibold">
              | Lojistik Deposu
            </span>
          )}
          {robots.find((r) => r.x === hoveredTile.x && r.y === hoveredTile.y) && (
            <span className="ml-2 text-purple-400 font-semibold">
              | Robot: {robots.find((r) => r.x === hoveredTile.x && r.y === hoveredTile.y)?.name}
            </span>
          )}
          {resources.find((res) => res.x === hoveredTile.x && res.y === hoveredTile.y && res.amount > 0) && (
            <span className="ml-2 text-emerald-400 font-semibold">
              | Maden: {resources.find((res) => res.x === hoveredTile.x && res.y === hoveredTile.y)?.name}
            </span>
          )}
        </div>
      )}

      {/* Quick Buy & Build Context Popover */}
      {quickTile && (
        <div
          style={{
            position: 'absolute',
            left: `${quickTile.pixelX}px`,
            top: `${quickTile.pixelY}px`,
            zIndex: 50,
            background: 'rgba(9, 14, 23, 0.95)',
            border: '1px solid #00f2fe',
            boxShadow: '0 10px 25px -5px rgba(0, 242, 254, 0.3)',
            backdropFilter: 'blur(12px)',
            borderRadius: '8px',
            padding: '0.75rem',
            width: '230px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
            <span style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Konum ({quickTile.x}, {quickTile.y})
            </span>
            <button
              onClick={() => setQuickTile(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Bu kareye tek tıkla tesis inşa et:
          </div>

          <button
            onClick={handleQuickBuildStation}
            disabled={credits < stationPrice}
            className="ui-btn ui-btn-cyan"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: credits < stationPrice ? 0.5 : 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
              <span>Şarj İstasyonu</span>
            </div>
            <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 800, fontSize: '0.68rem' }}>
              {stationPrice === 0 ? 'BEDAVA' : `$${stationPrice}`}
            </span>
          </button>

          <button
            onClick={handleQuickBuildDepot}
            disabled={credits < depotPrice}
            className="ui-btn ui-btn-primary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: credits < depotPrice ? 0.5 : 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lojistik Deposu</span>
            </div>
            <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 800, fontSize: '0.68rem' }}>
              {depotPrice === 0 ? 'BEDAVA' : `$${depotPrice}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
