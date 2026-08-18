import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKU_CATALOG } from '../constants/skus';
import { soundService } from '../services/soundService';
import { TutorialModal } from './TutorialModal';
import { Play, Pause, RotateCcw, FastForward, Cpu, DollarSign, Volume2, VolumeX, Package, Activity, Terminal, GraduationCap } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMuted, setMuted] = useState(soundService.isMuted);
  const [isTutorialOpen, setTutorialOpen] = useState(false);
  const {
    credits,
    isRunning,
    toggleRunning,
    stepTick,
    resetGame,
    tickRate,
    setTickRate,
    tickCount,
    inventory,
    robots,
  } = useGameStore();

  // Calculate total inventory value
  const totalValue = Object.entries(inventory).reduce((acc, [sku, amount]) => {
    const skuDef = SKU_CATALOG[sku];
    return acc + (skuDef ? skuDef.baseValue * amount : 0);
  }, 0);

  const activeRobotsCount = robots.filter((r) => r.status !== 'ERROR').length;

  return (
    <>
      <header className="header-container">
        {/* Brand & Title */}
        <div className="brand-group">
          <div className="logo-icon">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="brand-title">
              C# SCRIPTING <span style={{ color: 'var(--cyan-accent)' }}>TYCOON</span>
            </h1>
            <div className="brand-badge">
              <span className="dot dot-active"></span> OTOMASYON MOTORU AKTİF
            </div>
          </div>
        </div>

        {/* Live Telemetry & Cash Balance Bar */}
        <div className="telemetry-bar">
          <div className="telemetry-item" style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="telemetry-label" style={{ color: '#6ee7b7', fontWeight: 600 }}>Bakiye:</span>
            <span className="telemetry-value" style={{ color: '#34d399', fontSize: '0.95rem' }}>
              ${credits.toLocaleString()}
            </span>
          </div>
          
          <div className="telemetry-item">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="telemetry-label">Stok Değeri:</span>
            <span className="telemetry-value" style={{ color: '#67e8f9' }}>${totalValue.toLocaleString()}</span>
          </div>

          <div className="telemetry-item">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="telemetry-label">Aktif Robot:</span>
            <span className="telemetry-value" style={{ color: '#c084fc' }}>{activeRobotsCount} / {robots.length}</span>
          </div>

          <div className="telemetry-item">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="telemetry-label">Tick:</span>
            <span className="telemetry-value" style={{ color: '#fbbf24' }}>#{tickCount}</span>
          </div>
        </div>

        {/* Quick Actions & Speed Controls */}
        <div className="control-group">
          <button
            onClick={() => setTutorialOpen(true)}
            className="ui-btn ui-btn-accent"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #a855f7 0%, #00f2fe 100%)', border: 'none', color: '#000' }}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Akademi & Rehber</span>
          </button>

          <div className="speed-selector">
            <span className="speed-label">Hız:</span>
            <button
              onClick={() => setTickRate(800)}
              className={`speed-btn ${tickRate === 800 ? 'active' : ''}`}
            >
              1x
            </button>
            <button
              onClick={() => setTickRate(400)}
              className={`speed-btn ${tickRate === 400 ? 'active' : ''}`}
            >
              2x
            </button>
            <button
              onClick={() => setTickRate(150)}
              className={`speed-btn ${tickRate === 150 ? 'active' : ''}`}
            >
              5x
            </button>
          </div>

          <button
            onClick={stepTick}
            className="ui-btn ui-btn-secondary"
            title="Tek Adım (Step 1 Tick)"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <button
            onClick={toggleRunning}
            className={`ui-btn ${isRunning ? 'ui-btn-danger' : 'ui-btn-primary'}`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Durdur</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Çalıştır</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundService.toggleMute();
              setMuted(soundService.isMuted);
            }}
            className={`ui-btn ${isMuted ? 'ui-btn-secondary' : 'ui-btn-accent'}`}
            title={isMuted ? 'Sesleri Aç (SFX Unmute)' : 'Sesleri Kapat (SFX Mute)'}
            style={{ padding: '0.35rem 0.5rem' }}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-purple-300" />}
          </button>

          <button
            onClick={resetGame}
            className="ui-btn ui-btn-icon"
            title="Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
      
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  );
};
