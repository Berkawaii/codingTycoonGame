import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { fetchGlobalLeaderboard, submitPlayerScore, LeaderboardEntry } from '../services/firebaseService';
import { Trophy, RefreshCw, X, Bot, Zap, DollarSign } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { credits, robots, powerPlants, unlockedBiomes, t } = useGameStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'netWorth' | 'robots' | 'energy'>('netWorth');

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await fetchGlobalLeaderboard();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncScore = async () => {
    setLoading(true);
    const energyKwh = (powerPlants || []).reduce((acc, p) => acc + (p.powerBuffer || 0), 0);
    const userId = localStorage.getItem('syntax_factory_user_id') || `user-${Date.now()}`;
    const displayName = localStorage.getItem('syntax_factory_user_name') || 'Mühendis Oyuncu';

    localStorage.setItem('syntax_factory_user_id', userId);
    localStorage.setItem('syntax_factory_user_name', displayName);

    await submitPlayerScore(
      userId,
      displayName,
      credits,
      robots.length,
      Math.round(energyKwh),
      unlockedBiomes.length
    );

    await loadLeaderboard();
  };

  const sortedEntries = [...entries].sort((a, b) => {
    if (activeTab === 'netWorth') return b.netWorth - a.netWorth;
    if (activeTab === 'robots') return b.robotCount - a.robotCount;
    return b.energyKwh - a.energyKwh;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="sku-card"
        style={{
          background: '#090e17',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo_only.svg" alt="Syntax Factory Logo" style={{ width: '32px', height: '32px' }} />
            <div>
              <h3 style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem', letterSpacing: '0.5px' }}>
                SYNTAX FACTORY - {t('leaderboard_title')}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {t('leaderboard_subtitle')}
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Filter Bar & Action Bar */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('netWorth')}
              className={`ui-btn ${activeTab === 'netWorth' ? 'ui-btn-primary' : 'ui-btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.73rem', fontWeight: 700 }}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>{t('net_worth')}</span>
            </button>
            <button
              onClick={() => setActiveTab('robots')}
              className={`ui-btn ${activeTab === 'robots' ? 'ui-btn-primary' : 'ui-btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.73rem', fontWeight: 700 }}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t('robot_count')}</span>
            </button>
            <button
              onClick={() => setActiveTab('energy')}
              className={`ui-btn ${activeTab === 'energy' ? 'ui-btn-primary' : 'ui-btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.73rem', fontWeight: 700 }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t('energy_kwh')}</span>
            </button>
          </div>

          <button
            onClick={handleSyncScore}
            disabled={loading}
            className="ui-btn ui-btn-cyan"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.73rem', fontWeight: 700 }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('sync_my_score')}</span>
          </button>
        </div>

        {/* Leaderboard Table List */}
        <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
              Liderlik verisi yükleniyor veya henüz sıralama kaydedilmemiş...
            </div>
          ) : (
            sortedEntries.map((entry, index) => {
              let rankBadgeColor = '#64748b';
              let rankBorder = '1px solid #1e293b';

              if (index === 0) {
                rankBadgeColor = '#fbbf24'; // Gold
                rankBorder = '1px solid rgba(251, 191, 36, 0.6)';
              } else if (index === 1) {
                rankBadgeColor = '#94a3b8'; // Silver
                rankBorder = '1px solid rgba(148, 163, 184, 0.6)';
              } else if (index === 2) {
                rankBadgeColor = '#b45309'; // Bronze
                rankBorder = '1px solid rgba(180, 83, 9, 0.6)';
              }

              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    background: index === 0 ? 'rgba(251, 191, 36, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                    border: rankBorder,
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#060911',
                        border: `1px solid ${rankBadgeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: rankBadgeColor,
                      }}
                    >
                      #{index + 1}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{entry.displayName}</span>
                        {index === 0 && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {entry.biomeUnlockedCount} Biyom Açık • Son Güncelleme: {entry.updatedAt}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'Fira Code, monospace' }}>
                        ${entry.netWorth.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {entry.robotCount} Robot • {entry.energyKwh} kWh
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#060911', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="ui-btn ui-btn-secondary" style={{ padding: '0.35rem 1rem', fontSize: '0.78rem' }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
