import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKU_CATALOG, getLocalizedSkuName, getLocalizedSkuUnit, getLocalizedSkuDesc } from '../constants/skus';
import { MarketPanel } from './MarketPanel';
import { ShopPanel } from './ShopPanel';
import { ApiReferencePanel } from './ApiReferencePanel';
import { Package, Bot, Terminal, Trash2, Coins, DollarSign, Store, BookOpen, Maximize2, Minimize2 } from 'lucide-react';

export const InventoryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'market' | 'shop' | 'api' | 'robots' | 'logs'>('inventory');
  const [isMaximized, setIsMaximized] = useState(false);

  const {
    inventory,
    robots,
    logs,
    clearLogs,
    selectedRobotId,
    setSelectedRobotId,
    scriptCode,
    setScriptCode,
    addLog,
    language,
    t,
  } = useGameStore();

  const handleInsertSnippet = (snippet: string) => {
    if (scriptCode.includes('Execute(')) {
      const updated = scriptCode.replace(
        /(public void Execute\([^)]*\)\s*\{)/,
        `$1\n        ${snippet}`
      );
      setScriptCode(updated);
    } else {
      setScriptCode(`${scriptCode}\n${snippet}`);
    }
    addLog('info', `'${snippet}' code snippet added to C# editor.`);
  };

  return (
    <div
      className="panel-container"
      style={
        isMaximized
          ? {
              position: 'fixed',
              inset: '16px',
              zIndex: 9999,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              background: '#0a0f1d',
            }
          : {}
      }
    >
      {/* Navigation Tabs */}
      <div className="panel-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', overflowX: 'auto', flex: 1 }}>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          >
            <Package className="w-4 h-4" />
            <span>{t('inventory')}</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{t('market')}</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          >
            <Store className="w-4 h-4 text-cyan-400" />
            <span>{t('shop')}</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{t('api_ref')}</span>
          </button>

          <button
            onClick={() => setActiveTab('robots')}
            className={`tab-btn ${activeTab === 'robots' ? 'active' : ''}`}
          >
            <Bot className="w-4 h-4" />
            <span>{t('robots')} ({robots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          >
            <Terminal className="w-4 h-4" />
            <span>{t('logs')} ({logs.length})</span>
          </button>
        </div>

        {/* Expand / Maximize Toggle */}
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="ui-btn ui-btn-icon"
          style={{ margin: '4px 8px', padding: '0.35rem 0.6rem', fontSize: '0.72rem' }}
          title={isMaximized ? (language === 'tr' ? 'Küçült' : 'Minimize') : (language === 'tr' ? 'Tam Ekran Büyüt' : 'Maximize')}
        >
          {isMaximized ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'tr' ? 'Küçült' : 'Minimize'}</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'tr' ? 'Büyüt' : 'Maximize'}</span>
            </>
          )}
        </button>
      </div>

      {/* Tab Content 1: SKU Inventory */}
      {activeTab === 'inventory' && (
        <div className="panel-content" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {language === 'tr' ? 'Stok Tutma Birimleri (SKU Envanteri)' : 'Stock Keeping Units (SKU Inventory)'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Coins className="w-3.5 h-3.5" />
              <span>{language === 'tr' ? 'Canlı Stok Takibi' : 'Live Inventory Tracking'}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMaximized ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {Object.values(SKU_CATALOG).map((skuItem) => {
              const count = inventory[skuItem.sku] || 0;
              const totalVal = count * skuItem.baseValue;
              const skuName = getLocalizedSkuName(skuItem, language);
              const skuUnit = getLocalizedSkuUnit(skuItem.unit, language);

              return (
                <div
                  key={skuItem.sku}
                  className="sku-card"
                  style={{ borderLeftColor: skuItem.color }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className="sku-dot"
                          style={{ backgroundColor: skuItem.color }}
                        />
                        <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem' }}>
                          {skuName}
                        </h4>
                      </div>
                      <p style={{ fontFamily: 'Fira Code, monospace', color: '#94a3b8', fontSize: '0.72rem', marginTop: '2px' }}>
                        {skuItem.sku}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                        {count.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>
                          {skuUnit}
                        </span>
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                        +${totalVal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', lineHeight: '1.3' }}>
                    {getLocalizedSkuDesc(skuItem, language)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Resource Market & Selling */}
      {activeTab === 'market' && (
        <div className="panel-content">
          <MarketPanel />
        </div>
      )}

      {/* Tab Content 3: Robot Shop & Upgrades */}
      {activeTab === 'shop' && (
        <div className="panel-content">
          <ShopPanel />
        </div>
      )}

      {/* Tab Content 4: C# Robot API Reference Cheat Sheet */}
      {activeTab === 'api' && (
        <div className="panel-content">
          <ApiReferencePanel
            isOpen={true}
            isEmbedded={true}
            onClose={() => {}}
            onInsertSnippet={handleInsertSnippet}
          />
        </div>
      )}

      {/* Tab Content 5: Robot Telemetry */}
      {activeTab === 'robots' && (
        <div className="panel-content" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            {language === 'tr' ? 'Filodaki Robot Telemetrisi' : 'Fleet Robotics Telemetry'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMaximized ? 'repeat(3, 1fr)' : '1fr', gap: '0.75rem' }}>
            {robots.map((robot) => {
              const isSelected = robot.id === selectedRobotId;
              const energyPct = Math.round((robot.energy / robot.maxEnergy) * 100);

              return (
                <div
                  key={robot.id}
                  onClick={() => setSelectedRobotId(robot.id)}
                  className={`robot-card ${isSelected ? 'selected' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: robot.color }}
                      />
                      <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem' }}>
                        {robot.name}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.68rem', fontFamily: 'Fira Code, monospace', padding: '2px 6px', borderRadius: '4px', background: robot.status === 'ERROR' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)', color: robot.status === 'ERROR' ? '#f43f5e' : '#34d399' }}>
                      {robot.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    <span>{language === 'tr' ? 'Konum:' : 'Pos:'} ({robot.x}, {robot.y})</span>
                    <span>{language === 'tr' ? 'Kargo:' : 'Cargo:'} {robot.cargoAmount}/{robot.maxCargo} kg</span>
                    <span>{language === 'tr' ? 'Kazı Hızı:' : 'Mining Speed:'} x{robot.miningSpeed.toFixed(2)}</span>
                  </div>

                  {/* Energy & Cargo Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginBottom: '2px' }}>
                        <span>{language === 'tr' ? 'Batarya' : 'Battery'}</span>
                        <span>%{energyPct}</span>
                      </div>
                      <div style={{ background: '#090e17', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${energyPct}%`,
                            height: '100%',
                            backgroundColor: energyPct > 30 ? '#10b981' : '#f43f5e',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginBottom: '2px' }}>
                        <span>{language === 'tr' ? 'Kargo Yükü' : 'Cargo Load'}</span>
                        <span>{robot.cargoAmount}/{robot.maxCargo} kg</span>
                      </div>
                      <div style={{ background: '#090e17', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.round((robot.cargoAmount / robot.maxCargo) * 100))}%`,
                            height: '100%',
                            backgroundColor: '#38bdf8',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 6: Console Logs */}
      {activeTab === 'logs' && (
        <div className="panel-content" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              {t('console_logs_title')}
            </span>
            <button
              onClick={clearLogs}
              className="ui-btn ui-btn-danger"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            >
              <Trash2 className="w-3 h-3" />
              <span>{t('clear_logs')}</span>
            </button>
          </div>

          <div className="console-log-box">
            {logs.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>
                {language === 'tr' ? 'Konsol günlüğü temiz.' : 'Console log is empty.'}
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="log-entry" style={{ fontSize: '0.75rem', fontFamily: 'Fira Code, monospace' }}>
                  <span className="log-timestamp">[{log.timestamp}]</span>
                  <span className={`log-${log.level}`}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
