import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKU_CATALOG } from '../constants/skus';
import { BIOME_CATALOG } from '../constants/biomes';
import { BiomeType } from '../types/game';
import { soundService } from '../services/soundService';
import { TutorialModal } from './TutorialModal';
import { AdminConsoleModal } from './AdminConsoleModal';
import { Play, Pause, RotateCcw, FastForward, DollarSign, Volume2, VolumeX, Package, Terminal, Globe, RefreshCw, Bot, Zap, ShieldAlert, Trophy, Code2, LogOut, LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMuted, setMuted] = useState(soundService.isMuted);
  const [isTutorialOpen, setTutorialOpen] = useState(false);
  const {
    credits,
    powerPlants = [],
    isRunning,
    toggleRunning,
    stepTick,
    resetGame,
    tickRate,
    setTickRate,
    tickCount,
    inventory,
    robots,
    currentBiome,
    unlockedBiomes,
    switchBiome,
    generateNewSeedMap,
    setAdminModalOpen,
    setLeaderboardOpen,
    setMarketplaceOpen,
    setWelcomeOpen,
    userRole,
    authUser,
    logout,
  } = useGameStore();

  // Calculate total inventory value
  const totalValue = Object.entries(inventory).reduce((acc, [sku, amount]) => {
    const skuDef = SKU_CATALOG[sku];
    return acc + (skuDef ? skuDef.baseValue * amount : 0);
  }, 0);

  const activeBiomeRobotsCount = robots.filter(
    (r) => (r.biomeId || 'MARS_BASIN') === currentBiome && r.status !== 'ERROR'
  ).length;
  const totalGlobalRobotsCount = robots.length;

  const activePowerPlants = powerPlants || [];
  const totalGridEnergy = activePowerPlants.reduce((sum, p) => sum + p.powerBuffer, 0);
  const maxGridEnergy = activePowerPlants.reduce((sum, p) => sum + p.maxPowerBuffer, 0);

  return (
    <>
      <header className="header-container">
        {/* Brand & Title */}
        <div className="brand-group" style={{ cursor: 'pointer' }}>
          <img src="/logo_only.svg" alt="Syntax Factory Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <div>
            <h1 className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              SYNTAX <span style={{ color: 'var(--brand-red)' }}>FACTORY</span>
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

          <div className="telemetry-item" style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="telemetry-label" style={{ color: '#7dd3fc', fontWeight: 600 }}>Şebeke Gücü:</span>
            <span className="telemetry-value" style={{ color: totalGridEnergy > 0 ? '#38bdf8' : '#f87171', fontSize: '0.9rem', fontFamily: 'Fira Code, monospace' }}>
              {activePowerPlants.length > 0 ? `${totalGridEnergy.toLocaleString()} / ${maxGridEnergy.toLocaleString()} kWh` : 'Santral Yok'}
            </span>
          </div>
          
          {/* Biome Travel Selector */}
          <div className="telemetry-item" style={{ background: 'rgba(6, 182, 212, 0.12)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="telemetry-label">Harita:</span>
            <select
              value={currentBiome}
              onChange={(e) => switchBiome(e.target.value as BiomeType)}
              style={{
                background: '#090e17',
                color: '#38bdf8',
                border: '1px solid #1e293b',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {unlockedBiomes.map((bKey) => (
                <option key={bKey} value={bKey}>
                  {BIOME_CATALOG[bKey]?.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const seed = prompt('Harita Seed (Tohum) kodu girin:', `SEED_${Math.floor(Math.random() * 90000 + 10000)}`);
              if (seed) generateNewSeedMap(seed);
            }}
            className="ui-btn ui-btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
            title="Yeni Seed ile Harita Üret"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yeni Seed</span>
          </button>

          <div className="telemetry-item">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="telemetry-label">Stok:</span>
            <span className="telemetry-value" style={{ color: '#67e8f9' }}>${totalValue.toLocaleString()}</span>
          </div>

          <div className="telemetry-item">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="telemetry-label">Robot:</span>
            <span className="telemetry-value" style={{ color: '#c084fc' }}>{activeBiomeRobotsCount}/{totalGlobalRobotsCount}</span>
          </div>

          <div className="telemetry-item">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="telemetry-label">Tick:</span>
            <span className="telemetry-value" style={{ color: '#fbbf24' }}>#{tickCount}</span>
          </div>
        </div>

        {/* Quick Actions & Speed Controls */}
        <div className="control-group">
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
            onClick={() => setLeaderboardOpen(true)}
            className="ui-btn ui-btn-secondary"
            title="Global Liderlik Tablosu"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Liderlik</span>
          </button>

          <button
            onClick={() => setMarketplaceOpen(true)}
            className="ui-btn ui-btn-secondary"
            title="Topluluk C# Script Pazarı"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scriptler</span>
          </button>

          {authUser ? (
            <button
              onClick={logout}
              className="ui-btn ui-btn-secondary"
              title="Oturumu Kapat"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Çıkış Yap</span>
            </button>
          ) : (
            <button
              onClick={() => setWelcomeOpen(true)}
              className="ui-btn ui-btn-primary"
              title="Oturum Aç / Kaydol"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Giriş Yap</span>
            </button>
          )}

          {userRole === 'admin' && (
            <>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="ui-btn"
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.72rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(168, 85, 247, 0.35) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.7)',
                  color: '#f87171',
                  fontWeight: 800,
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                }}
                title="Geliştirici & Admin Test Konsolu"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>ADMIN PANEL</span>
              </button>

              <button
                onClick={resetGame}
                className="ui-btn ui-btn-icon"
                title="Fabrikayı Sıfırla (Admin Yetkisi)"
                style={{ border: '1px solid rgba(239, 68, 68, 0.5)' }}
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </>
          )}
        </div>
      </header>
      
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setTutorialOpen(false)} />
      <AdminConsoleModal />
    </>
  );
};
