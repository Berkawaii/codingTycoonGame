import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { BIOME_CATALOG } from '../constants/biomes';
import { BiomeType } from '../types/game';
import { Bot, Zap, Pickaxe, PlusCircle, Radio, Building2, BatteryCharging, Package, Globe, Compass, Lock, CheckCircle2, Maximize2, Send, Truck } from 'lucide-react';

const getStatUpgradePrice = (currentLevel: number, basePrice: number): number => {
  return Math.round(basePrice * Math.pow(1.35, Math.max(0, currentLevel - 1)));
};

export const ShopPanel: React.FC = () => {
  const {
    credits,
    robots,
    chargingStations,
    depots,
    selectedRobotId,
    buyRobot,
    buyTransporterRobot,
    buyChargingStation,
    buyDepot,
    buySmelter,
    buyRefinery,
    buyPowerPlant,
    buyRepairDrone,
    buyTurret,
    upgradeTurretRange,
    upgradeTurretDamage,
    turrets,
    upgradeRobotStat,
    buyEmergencyCharge,
    currentBiome,
    unlockedBiomes,
    unlockBiome,
    switchBiome,
    expandMapGridSize,
    transferRobotToBiome,
    gridSize,
    biomeMaps,
    language,
    t,
  } = useGameStore();

  const selectedRobot = robots.find((r) => r.id === selectedRobotId);

  const stationPrice =
    chargingStations.length === 0
      ? 0
      : Math.round(800 * Math.pow(1.5, chargingStations.length - 1));

  const depotPrice =
    depots.length === 0
      ? 0
      : Math.round(1200 * Math.pow(1.5, depots.length - 1));

  const getRobotPurchasePrice = (basePrice: number) => {
    const fleetMultiplier = Math.pow(1.25, Math.max(0, robots.length));
    return Math.round(basePrice * fleetMultiplier);
  };

  const handleBuyBuilding = (type: 'station' | 'depot' | 'smelter' | 'refinery' | 'powerplant') => {
    const defaultCoords = type === 'smelter' ? '5, 5' : type === 'refinery' ? '12, 12' : type === 'powerplant' ? '1, 0' : '10, 10';
    const coordStr = prompt(
      `İnşa etmek istediğiniz ${
        type === 'station'
          ? 'Şarj İstasyonu'
          : type === 'depot'
          ? 'Lojistik Deposu'
          : type === 'smelter'
          ? 'Dökümhane (2x2)'
          : type === 'refinery'
          ? 'Rafineri (2x2)'
          : 'Kuantum Enerji Santrali (Şarj İstasyonu Bitişiği)'
      } için (X, Y) koordinatını girin:`,
      defaultCoords
    );

    if (!coordStr) return;

    const parts = coordStr.split(',').map((p) => parseInt(p.trim(), 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      alert('Geçersiz koordinat formatı! Lütfen "X, Y" şeklinde sayısal değerler girin (Örn: 10, 5).');
      return;
    }

    if (type === 'station') {
      buyChargingStation(`Şarj İstasyonu #${chargingStations.length + 1}`, parts[0], parts[1], stationPrice);
    } else if (type === 'depot') {
      buyDepot(`Lojistik Deposu #${depots.length + 1}`, parts[0], parts[1], depotPrice);
    } else if (type === 'smelter') {
      buySmelter(`Dökümhane #${(biomeMaps[currentBiome]?.smelters?.length || 0) + 1}`, parts[0], parts[1], 5000);
    } else if (type === 'refinery') {
      buyRefinery(`Rafineri #${(biomeMaps[currentBiome]?.refineries?.length || 0) + 1}`, parts[0], parts[1], 12000);
    } else if (type === 'powerplant') {
      buyPowerPlant(`Enerji Santrali #${(biomeMaps[currentBiome]?.powerPlants?.length || 0) + 1}`, parts[0], parts[1], 8000);
    }
  };

  const availableRobots = [
    {
      name: 'Rover Gamma',
      color: '#a855f7',
      basePrice: 750,
      description: language === 'tr' ? 'Yüksek batarya verimliliğine sahip keşif robotu.' : 'High battery efficiency scouting robot.',
    },
    {
      name: 'Heavy Digger-01',
      color: '#f97316',
      basePrice: 1500,
      description: language === 'tr' ? 'Ağır maden damarlarını parçalamak için tasarlanmış yüksek güçlü ünite.' : 'High power unit engineered for crushing heavy ore veins.',
    },
    {
      name: 'Quantum Rover X',
      color: '#ec4899',
      basePrice: 3500,
      description: language === 'tr' ? 'Kuantum kristalleri ve değerli madenler için özel tasarlanmış son teknoloji bot.' : 'State-of-the-art bot designed for quantum crystals & rare ores.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Robot Purchase Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>{t('robot_shop_title')}</span>
          </span>
          <span style={{ color: '#34d399', fontFamily: 'Fira Code, monospace', fontWeight: 800, fontSize: '0.85rem' }}>
            {t('balance')}: ${credits.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {availableRobots.map((template) => {
            const currentPrice = getRobotPurchasePrice(template.basePrice);
            const canAfford = credits >= currentPrice;

            return (
              <div
                key={template.name}
                className="sku-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div
                      style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: template.color }}
                    />
                    <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>{template.name}</h4>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>{template.description}</p>
                </div>

                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: '#fbbf24', fontSize: '0.8rem' }}>
                    ${currentPrice.toLocaleString()}
                  </span>
                  <button
                    onClick={() => buyRobot(template.name, template.color, currentPrice)}
                    disabled={!canAfford}
                    className="ui-btn ui-btn-primary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: !canAfford ? 0.4 : 1 }}
                  >
                    <span>{t('buy')}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Dedicated Transporter Robot Card */}
          <div
            className="sku-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Truck className="w-4 h-4 text-orange-400" />
                <h4 style={{ fontWeight: 800, color: '#f97316', fontSize: '0.8rem' }}>Carrier Transporter</h4>
                <span style={{ fontSize: '0.62rem', background: 'rgba(249, 115, 22, 0.3)', color: '#fdba74', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(249, 115, 22, 0.5)', fontWeight: 800 }}>
                  200KG CARGO
                </span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: '1.3' }}>
                {language === 'tr'
                  ? 'Kazı yapamaz. 200kg dev kargo kapasitesi ve 2x hızlı hareket ile madencilerden ürünleri radyo ile toplayıp depoya taşır.'
                  : 'Cannot mine. 200kg massive cargo hold & 2x speed. Collects ores from miners via radio and deposits at depot.'}
              </p>
            </div>

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(249, 115, 22, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 800, color: '#fbbf24', fontSize: '0.8rem' }}>
                $4,000
              </span>
              <button
                onClick={() => buyTransporterRobot(`Transporter-${robots.length + 1}`, '#f97316')}
                disabled={credits < 4000}
                className="ui-btn"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  opacity: credits < 4000 ? 0.4 : 1,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  border: 'none',
                }}
              >
                <span>{t('buy_transporter')}</span>
              </button>
            </div>
          </div>

          {/* Dedicated Repair Drone Robot Card */}
          <div
            className="sku-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Bot className="w-4 h-4 text-emerald-400" />
                <h4 style={{ fontWeight: 800, color: '#10b981', fontSize: '0.8rem' }}>Repair Drone</h4>
                <span style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.5)', fontWeight: 800 }}>
                  2X SPEED / REPAIR
                </span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: '1.3' }}>
                {language === 'tr'
                  ? 'Hasarlı robotları ve ısınan santralleri otonom tespit edip yeşil lazer tamir ışını ile onarır (RepairRobot).'
                  : 'Autonomously targets damaged bots & power plants, healing units with a green laser repair beam (RepairRobot).'}
              </p>
            </div>

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 800, color: '#fbbf24', fontSize: '0.8rem' }}>
                $5,000
              </span>
              <button
                onClick={() => buyRepairDrone(`RepairDrone-${robots.length + 1}`, '#10b981')}
                disabled={credits < 5000}
                className="ui-btn"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  opacity: credits < 5000 ? 0.4 : 1,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  border: 'none',
                }}
              >
                <span>{t('buy_repair_drone')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Building Construction Section */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>{t('industrial_buildings_title')}</span>
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
          {/* Station Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>{t('build_station_title')}</h4>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {t('build_station_desc')}
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: stationPrice === 0 ? '#34d399' : '#fbbf24', fontSize: '0.8rem' }}>
                {stationPrice === 0 ? t('free_tag') : `$${stationPrice.toLocaleString()}`}
              </span>
              <button
                onClick={() => handleBuyBuilding('station')}
                disabled={credits < stationPrice}
                className="ui-btn ui-btn-cyan"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < stationPrice ? 0.4 : 1 }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('build_btn')}</span>
              </button>
            </div>
          </div>

          {/* Depot Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Building2 className="w-4 h-4 text-cyan-400" />
                <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>{t('build_depot_title')}</h4>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {t('build_depot_desc')}
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: depotPrice === 0 ? '#34d399' : '#fbbf24', fontSize: '0.8rem' }}>
                {depotPrice === 0 ? t('free_tag') : `$${depotPrice.toLocaleString()}`}
              </span>
              <button
                onClick={() => handleBuyBuilding('depot')}
                disabled={credits < depotPrice}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < depotPrice ? 0.4 : 1 }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('build_btn')}</span>
              </button>
            </div>
          </div>

          {/* Smelter 2x2 Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem', border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.06)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Pickaxe className="w-4 h-4 text-orange-400" />
                <h4 style={{ fontWeight: 700, color: '#ffedd5', fontSize: '0.8rem' }}>{t('smelter_title')}</h4>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {t('smelter_desc')}
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: '#fb923c', fontSize: '0.8rem' }}>
                $5,000
              </span>
              <button
                onClick={() => handleBuyBuilding('smelter')}
                disabled={credits < 5000}
                className="ui-btn ui-btn-accent"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < 5000 ? 0.4 : 1 }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('build_2x2')}</span>
              </button>
            </div>
          </div>

          {/* Refinery 2x2 Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.06)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Radio className="w-4 h-4 text-purple-400" />
                <h4 style={{ fontWeight: 700, color: '#f3e8ff', fontSize: '0.8rem' }}>{t('refinery_title')}</h4>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {t('refinery_desc')}
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: '#c084fc', fontSize: '0.8rem' }}>
                $12,000
              </span>
              <button
                onClick={() => handleBuyBuilding('refinery')}
                disabled={credits < 12000}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < 12000 ? 0.4 : 1, color: '#c084fc', borderColor: 'rgba(192,132,252,0.4)' }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('build_2x2')}</span>
              </button>
            </div>
          </div>

          {/* Power Plant Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <h4 style={{ fontWeight: 700, color: '#a7f3d0', fontSize: '0.8rem' }}>{t('powerplant_title')}</h4>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {t('powerplant_desc')}
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: '#34d399', fontSize: '0.8rem' }}>
                $8,000
              </span>
              <button
                onClick={() => handleBuyBuilding('powerplant')}
                disabled={credits < 8000}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < 8000 ? 0.4 : 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('build_adj')}</span>
              </button>
            </div>
          </div>

          {/* Defense Turret Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap className="w-4 h-4 text-rose-500" />
                <h4 style={{ fontWeight: 800, color: '#f87171', fontSize: '0.8rem' }}>{t('turret_title')}</h4>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: '1.3' }}>
                {t('turret_desc')}
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: '#fbbf24', fontSize: '0.8rem' }}>
                $6,000
              </span>
              <button
                onClick={() => {
                  const coordStr = prompt(language === 'tr' ? 'Lazer Savunma Kulesi (2x2) için (X, Y) koordinatını girin:' : 'Enter (X, Y) coordinates for Defense Turret (2x2):', '8, 8');
                  if (!coordStr) return;
                  const parts = coordStr.split(',').map((p) => parseInt(p.trim(), 10));
                  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    buyTurret(parts[0], parts[1]);
                  }
                }}
                disabled={credits < 6000}
                className="ui-btn"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < 6000 ? 0.4 : 1, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', fontWeight: 700, border: 'none' }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('build_turret')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Turret Upgrades Section */}
        {turrets && turrets.length > 0 && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f87171', marginBottom: '6px', textTransform: 'uppercase' }}>
              🛡️ {language === 'tr' ? 'Aktif Savunma Kuleleri Yükseltmeleri' : 'Active Defense Turret Upgrades'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {turrets.map((tItem) => (
                <div key={tItem.id} style={{ background: '#090e17', padding: '6px 10px', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem' }}>
                  <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{tItem.name} ({tItem.x}, {tItem.y})</span>
                  <span style={{ color: '#94a3b8' }}>{language === 'tr' ? 'Menzil:' : 'Range:'} <strong style={{ color: '#38bdf8' }}>{tItem.range} {language === 'tr' ? 'Karo' : 'Tiles'}</strong> (Lvl {tItem.rangeLevel})</span>
                  <button
                    onClick={() => upgradeTurretRange(tItem.id)}
                    disabled={credits < 1500 || tItem.rangeLevel >= 5}
                    className="ui-btn ui-btn-cyan"
                    style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                  >
                    +1 {language === 'tr' ? 'Menzil' : 'Range'} ($1,500)
                  </button>
                  <span style={{ color: '#94a3b8' }}>{language === 'tr' ? 'Lazer:' : 'Laser:'} <strong style={{ color: '#f43f5e' }}>{tItem.damage} DPS</strong> (Lvl {tItem.damageLevel})</span>
                  <button
                    onClick={() => upgradeTurretDamage(tItem.id)}
                    disabled={credits < 2000 || tItem.damageLevel >= 5}
                    className="ui-btn"
                    style={{ padding: '2px 6px', fontSize: '0.68rem', background: '#ef4444', color: '#fff', border: 'none' }}
                  >
                    +20 {language === 'tr' ? 'Lazer' : 'Laser'} ($2,000)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2.5 Biome Exploration & Map Unlock Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t('map_discovery_title')}</span>
          </span>

          {(() => {
            const curSize = biomeMaps[currentBiome]?.gridSize?.width || gridSize.width || 20;
            const expCost = curSize === 20 ? 3000 : curSize === 30 ? 8000 : curSize === 40 ? 18000 : 0;
            const nextSize = curSize + 10;
            const isMax = curSize >= 50;

            return (
              <button
                onClick={() => expandMapGridSize(currentBiome)}
                disabled={isMax || credits < expCost}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', opacity: isMax || credits < expCost ? 0.5 : 1 }}
                title={isMax ? (language === 'tr' ? 'Harita maksimum boyutta' : 'Map at maximum size') : `Expand grid from ${curSize}x${curSize} to ${nextSize}x${nextSize}`}
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {isMax
                    ? (language === 'tr' ? 'Harita Max (50x50)' : 'Map Max (50x50)')
                    : `${language === 'tr' ? 'Haritayı Genişlet' : 'Expand Map'} (${curSize}x${curSize} -> ${nextSize}x${nextSize}) ($${expCost.toLocaleString()})`}
                </span>
              </button>
            );
          })()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {(Object.keys(BIOME_CATALOG) as BiomeType[]).map((biomeKey) => {
            const def = BIOME_CATALOG[biomeKey];
            const isUnlocked = unlockedBiomes.includes(biomeKey);
            const isCurrent = currentBiome === biomeKey;
            const canAfford = credits >= def.unlockPrice;
            const bSize = biomeMaps[biomeKey]?.gridSize?.width || 20;

            const biomeName = language === 'en'
              ? biomeKey === 'MARS_BASIN' ? 'Mars Basin Desert' : biomeKey === 'VOLCANIC' ? 'Volcanic Magma Basin' : biomeKey === 'QUANTUM_CAVERN' ? 'Quantum Crystal Cavern' : 'Glacial Permafrost Wastes'
              : def.name;

            const biomeSubtitle = language === 'en'
              ? biomeKey === 'MARS_BASIN' ? 'Default Base Mining Grounds' : biomeKey === 'VOLCANIC' ? 'Molten Lava Rivers & Ruby Crystals' : biomeKey === 'QUANTUM_CAVERN' ? 'Nuclear Radiation & Quantum Particles' : 'Slippery Ice Layer & Diamond Crystals'
              : def.subtitle;

            const hazardName = language === 'en'
              ? def.hazardType === 'NONE' ? 'None' : def.hazardType === 'LAVA' ? 'Extreme Lava Heat' : def.hazardType === 'RADIATION' ? 'Nuclear Radiation' : 'Sub-Zero Freezing'
              : def.hazardName;

            return (
              <div
                key={biomeKey}
                className="sku-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  border: isCurrent ? '1px solid #00f2fe' : isUnlocked ? '1px solid #059669' : '1px solid #1e293b',
                  background: isCurrent ? 'rgba(0, 242, 254, 0.08)' : '#090e17',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.78rem' }}>{biomeName}</h4>
                    {isCurrent ? (
                      <span style={{ fontSize: '0.62rem', color: '#00f2fe', fontWeight: 800 }}>[{bSize}x{bSize}]</span>
                    ) : isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: '1.25', marginBottom: '4px' }}>
                    {biomeSubtitle}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', display: 'inline-block' }}>
                    {language === 'tr' ? 'Tehlike:' : 'Hazard:'} {hazardName}
                  </span>
                </div>

                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: def.unlockPrice === 0 ? '#34d399' : '#fbbf24', fontSize: '0.75rem' }}>
                    {def.unlockPrice === 0 ? (language === 'tr' ? 'AÇIK' : 'UNLOCKED') : `$${def.unlockPrice.toLocaleString()}`}
                  </span>

                  {isUnlocked ? (
                    <button
                      onClick={() => switchBiome(biomeKey)}
                      disabled={isCurrent}
                      className="ui-btn ui-btn-cyan"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem', opacity: isCurrent ? 0.4 : 1 }}
                    >
                      <Compass className="w-3 h-3" />
                      <span>{isCurrent ? (language === 'tr' ? 'Aktif' : 'Active') : (language === 'tr' ? 'Seyahat Et' : 'Travel')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => unlockBiome(biomeKey)}
                      disabled={!canAfford}
                      className="ui-btn ui-btn-primary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem', opacity: !canAfford ? 0.4 : 1 }}
                    >
                      <span>{language === 'tr' ? 'Aç ($)' : 'Unlock ($)'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Robot Kademeli Upgrades & Transfer Section */}
      {selectedRobot && (() => {
        const radarCost = getStatUpgradePrice(selectedRobot.radarLevel, 200);
        const batteryCost = getStatUpgradePrice(selectedRobot.batteryLevel, 150);
        const miningCost = getStatUpgradePrice(selectedRobot.miningLevel, 250);
        const cargoCost = getStatUpgradePrice(selectedRobot.cargoLevel || 1, 180);
        const robotBiome = selectedRobot.biomeId || 'MARS_BASIN';

        // Calculate total robot investment value (Base price + spent upgrade costs)
        const getSpentOnStat = (lvl: number, base: number) => {
          let tot = 0;
          for (let l = 1; l < lvl; l++) {
            tot += Math.round(base * Math.pow(1.35, Math.max(0, l - 1)));
          }
          return tot;
        };

        const robotBasePrice = selectedRobot.name.includes('Gamma')
          ? 750
          : selectedRobot.name.includes('Heavy')
          ? 1500
          : selectedRobot.name.includes('Quantum')
          ? 3500
          : 500;

        const totalInvestment =
          robotBasePrice +
          getSpentOnStat(selectedRobot.radarLevel, 200) +
          getSpentOnStat(selectedRobot.batteryLevel, 150) +
          getSpentOnStat(selectedRobot.miningLevel, 250) +
          getSpentOnStat(selectedRobot.cargoLevel || 1, 180);

        const emergencyChargePrice = Math.max(25, Math.round(totalInvestment * 0.3));

        return (
          <div style={{ background: '#090e17', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot className="w-4 h-4 text-cyan-400" />
                <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>
                  {selectedRobot.name} Yükseltmeleri & Konumu:
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {BIOME_CATALOG[robotBiome]?.name}
                </span>
              </div>

              {/* Robot Map Transfer Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Haritaya Taşı:</span>
                <select
                  value={robotBiome}
                  onChange={(e) => transferRobotToBiome(selectedRobot.id, e.target.value as BiomeType)}
                  style={{
                    background: '#070b14',
                    color: '#fbbf24',
                    border: '1px solid #1e293b',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
              {/* Upgrade 1: Radar Sensor */}
              <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem' }}>
                    <Radio className="w-3.5 h-3.5 text-purple-400" />
                    <span>Radar (+1 Kare)</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                    Lvl {selectedRobot.radarLevel} ({selectedRobot.radarRange} Kare)
                  </span>
                </div>
                <button
                  onClick={() => upgradeRobotStat(selectedRobot.id, 'radar', radarCost)}
                  disabled={credits < radarCost}
                  className="ui-btn ui-btn-accent"
                  style={{ width: '100%', padding: '0.3rem', fontSize: '0.72rem', opacity: credits < radarCost ? 0.4 : 1 }}
                >
                  +1 Kare (${radarCost.toLocaleString()})
                </button>
              </div>

              {/* Upgrade 2: Battery Capacity */}
              <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem' }}>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Batarya (+1%)</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                    Lvl {selectedRobot.batteryLevel} ({selectedRobot.maxEnergy} Enerji)
                  </span>
                </div>
                <button
                  onClick={() => upgradeRobotStat(selectedRobot.id, 'battery', batteryCost)}
                  disabled={credits < batteryCost}
                  className="ui-btn ui-btn-secondary"
                  style={{ width: '100%', padding: '0.3rem', fontSize: '0.72rem', opacity: credits < batteryCost ? 0.4 : 1, color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)' }}
                >
                  +1% Enerji (${batteryCost.toLocaleString()})
                </button>
              </div>

              {/* Upgrade 3: Mining Efficiency */}
              <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem' }}>
                    <Pickaxe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Kazı Hızı (+1%)</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                    Lvl {selectedRobot.miningLevel} (x{selectedRobot.miningSpeed.toFixed(2)})
                  </span>
                </div>
                <button
                  onClick={() => upgradeRobotStat(selectedRobot.id, 'mining', miningCost)}
                  disabled={credits < miningCost}
                  className="ui-btn ui-btn-primary"
                  style={{ width: '100%', padding: '0.3rem', fontSize: '0.72rem', opacity: credits < miningCost ? 0.4 : 1 }}
                >
                  +1% Hız (${miningCost.toLocaleString()})
                </button>
              </div>

              {/* Upgrade 4: Cargo Capacity */}
              <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem' }}>
                    <Package className="w-3.5 h-3.5 text-sky-400" />
                    <span>Kargo Haznesi (+25kg)</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                    Lvl {selectedRobot.cargoLevel || 1} ({selectedRobot.maxCargo} kg)
                  </span>
                </div>
                <button
                  onClick={() => upgradeRobotStat(selectedRobot.id, 'cargo', cargoCost)}
                  disabled={credits < cargoCost}
                  className="ui-btn ui-btn-cyan"
                  style={{ width: '100%', padding: '0.3rem', fontSize: '0.72rem', opacity: credits < cargoCost ? 0.4 : 1 }}
                >
                  +25 kg (${cargoCost.toLocaleString()})
                </button>
              </div>

              {/* Upgrade 5: Emergency Paid Battery Recharge (%10 Charge) */}
              <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#6ee7b7', fontSize: '0.78rem' }}>
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acil Şarj (+%10)</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                    {selectedRobot.energy}/{selectedRobot.maxEnergy} Enerji
                  </span>
                </div>
                <button
                  onClick={() => buyEmergencyCharge(selectedRobot.id, emergencyChargePrice)}
                  disabled={credits < emergencyChargePrice || selectedRobot.energy >= selectedRobot.maxEnergy}
                  className="ui-btn ui-btn-accent"
                  style={{
                    width: '100%',
                    padding: '0.3rem',
                    fontSize: '0.72rem',
                    opacity: credits < emergencyChargePrice || selectedRobot.energy >= selectedRobot.maxEnergy ? 0.4 : 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                  }}
                >
                  +%10 Şarj (${emergencyChargePrice.toLocaleString()})
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
