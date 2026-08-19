import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useGameStore } from '../store/useGameStore';
import { X, ShieldAlert, DollarSign, Skull, CloudRain, Wrench, Zap, Package, PlusCircle, Trash2 } from 'lucide-react';

export const AdminConsoleModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setAdminModalOpen,
    credits,
    addCredits,
    spawnBandit,
    clearBandits,
    triggerHazard,
    clearHazard,
    healAllRobots,
    coolAllPowerPlants,
    fillAllDepots,
    activeBandits = [],
    activeHazard,
    robots,
  } = useGameStore();

  const [customCreditInput, setCustomCreditInput] = useState<string>('50000');
  const [banditX, setBanditX] = useState<number>(0);
  const [banditY, setBanditY] = useState<number>(5);

  if (!isAdminModalOpen) return null;

  const handleAddCustomCredits = () => {
    const val = parseInt(customCreditInput, 10);
    if (!isNaN(val) && val > 0) {
      addCredits(val);
    }
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={() => setAdminModalOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '750px',
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '16px',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.3)',
                border: '1px solid rgba(239, 68, 68, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                  🛠️ Geliştirici & Admin Test Konsolu
                </h3>
                <span style={{ fontSize: '0.62rem', background: 'rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.5)', fontWeight: 800 }}>
                  ROOT ACCESS
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Simülasyon testleri için bakiye ekleyin, fırtına tetikleyin veya korsan robot doğurun.
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdminModalOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Section 1: Economy & Credits */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #1e293b', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#34d399' }}>
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>1. EKONOMİ & BAKİYE ENJEKSİYONU</span>
              </div>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 800, color: '#34d399', fontSize: '0.85rem' }}>
                Mevcut Bakiye: ${credits.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => addCredits(10000)}
                className="ui-btn ui-btn-cyan"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
              >
                +$10,000 Ekle
              </button>
              <button
                onClick={() => addCredits(50000)}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
              >
                +$50,000 Ekle
              </button>
              <button
                onClick={() => addCredits(100000)}
                className="ui-btn"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none' }}
              >
                +$100,000 Ekle
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <input
                  type="number"
                  value={customCreditInput}
                  onChange={(e) => setCustomCreditInput(e.target.value)}
                  className="ui-input"
                  style={{ width: '100px', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                  placeholder="Miktar"
                />
                <button
                  onClick={handleAddCustomCredits}
                  className="ui-btn ui-btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                >
                  Özel Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Bandit Raiders & Threat Control */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#f87171' }}>
                <Skull className="w-4 h-4 text-rose-400" />
                <span>2. KORSAN ROBOT MANİPÜLASYONU (BANDIT RAIDERS)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Haritadaki Korsanlar: <strong style={{ color: activeBandits.length > 0 ? '#ef4444' : '#64748b' }}>{activeBandits.length} Adet</strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#060911', padding: '4px 8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Konum (X, Y):</span>
                <input
                  type="number"
                  value={banditX}
                  onChange={(e) => setBanditX(parseInt(e.target.value, 10) || 0)}
                  className="ui-input"
                  style={{ width: '45px', padding: '2px 4px', fontSize: '0.72rem' }}
                />
                <input
                  type="number"
                  value={banditY}
                  onChange={(e) => setBanditY(parseInt(e.target.value, 10) || 0)}
                  className="ui-input"
                  style={{ width: '45px', padding: '2px 4px', fontSize: '0.72rem' }}
                />
              </div>

              <button
                onClick={() => spawnBandit(banditX, banditY)}
                className="ui-btn"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none' }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Korsan Robot Doğur 💀</span>
              </button>

              <button
                onClick={clearBandits}
                disabled={activeBandits.length === 0}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', opacity: activeBandits.length === 0 ? 0.4 : 1 }}
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Tüm Korsanları Sil</span>
              </button>
            </div>
          </div>

          {/* Section 3: Environmental Hazards per Biome */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>
                <CloudRain className="w-4 h-4 text-amber-400" />
                <span>3. BİYOM ÇEVRE TEHLİKELERİ & HAVA OLAYLARI</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: activeHazard ? '#f97316' : '#64748b', fontWeight: 700 }}>
                {activeHazard ? `🚨 ${activeHazard.name} (${activeHazard.remainingTicks} tick)` : '☀️ Hava Açık'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => triggerHazard('DUST_STORM')}
                className="ui-btn"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.73rem', fontWeight: 700, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', border: 'none' }}
              >
                🌪️ Mars Kum Fırtınası
              </button>

              <button
                onClick={() => triggerHazard('VOLCANIC_ERUPTION')}
                className="ui-btn"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.73rem', fontWeight: 700, background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', border: 'none' }}
              >
                🌋 Volkanik Magma & Asit Yağmuru
              </button>

              <button
                onClick={() => triggerHazard('QUANTUM_FLARE')}
                className="ui-btn"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.73rem', fontWeight: 700, background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)', color: '#fff', border: 'none' }}
              >
                ⚛️ Kuantum EMP Dalgası
              </button>

              <button
                onClick={() => triggerHazard('BLIZZARD')}
                className="ui-btn"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.73rem', fontWeight: 700, background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#fff', border: 'none' }}
              >
                ❄️ Sıfır Altı Kutup Tipi
              </button>

              <button
                onClick={clearHazard}
                disabled={!activeHazard}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.73rem', opacity: !activeHazard ? 0.4 : 1 }}
              >
                ☀️ Hava Durumunu Temizle
              </button>
            </div>
          </div>

          {/* Section 4: Fleet & Maintenance Operations */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.75rem' }}>
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>4. FİLO REHABİLİTASYONU & OTOMATİK DOLDURMA</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={healAllRobots}
                className="ui-btn ui-btn-cyan"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}
              >
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tüm Filoyu Tamir Et (%100 HP / %100 Şarj) ({robots.length} Robot)</span>
              </button>

              <button
                onClick={coolAllPowerPlants}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tüm Santralleri Soğut (20°C / Full kWh)</span>
              </button>

              <button
                onClick={fillAllDepots}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}
              >
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Depolara +100kg Maden Yükle</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#060911', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setAdminModalOpen(false)}
            className="ui-btn ui-btn-secondary"
            style={{ padding: '0.35rem 1rem', fontSize: '0.78rem' }}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
