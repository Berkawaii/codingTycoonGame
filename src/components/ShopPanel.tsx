import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Bot, Zap, Pickaxe, PlusCircle, Radio, Building2, BatteryCharging, Package } from 'lucide-react';

interface ShopRobotTemplate {
  name: string;
  color: string;
  basePrice: number;
  description: string;
}

const AVAILABLE_ROBOTS: ShopRobotTemplate[] = [
  {
    name: 'Rover Gamma',
    color: '#a855f7',
    basePrice: 750,
    description: 'Yüksek batarya verimliliğine sahip keşif robotu.',
  },
  {
    name: 'Heavy Digger-01',
    color: '#f97316',
    basePrice: 1500,
    description: 'Ağır maden damarlarını parçalamak için tasarlanmış yüksek güçlü ünite.',
  },
  {
    name: 'Quantum Rover X',
    color: '#ec4899',
    basePrice: 3500,
    description: 'Kuantum kristalleri ve değerli madenler için özel tasarlanmış son teknoloji bot.',
  },
];

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
    buyChargingStation,
    buyDepot,
    upgradeRobotStat,
  } = useGameStore();

  const selectedRobot = robots.find((r) => r.id === selectedRobotId);

  const stationPrice =
    chargingStations.length === 1
      ? 0
      : Math.round(800 * Math.pow(1.5, chargingStations.length - 2));

  const depotPrice =
    depots.length === 1
      ? 0
      : Math.round(1200 * Math.pow(1.5, depots.length - 2));

  const getRobotPurchasePrice = (basePrice: number) => {
    const fleetMultiplier = Math.pow(1.4, Math.max(0, robots.length - 2));
    return Math.round(basePrice * fleetMultiplier);
  };

  const handleBuyBuilding = (type: 'station' | 'depot') => {
    const targetPrice = type === 'station' ? stationPrice : depotPrice;
    const priceText = targetPrice === 0 ? '[ÜCRETSİZ]' : `$${targetPrice.toLocaleString()}`;

    const promptMsg =
      type === 'station'
        ? `İnşa edilecek Şarj İstasyonu [Bedel: ${priceText}] için (X, Y) koordinatını girin (Örnek: 10, 5):`
        : `İnşa edilecek Lojistik Deposu [Bedel: ${priceText}] için (X, Y) koordinatını girin (Örnek: 5, 15):`;

    const coordStr = window.prompt(promptMsg, type === 'station' ? '10, 5' : '5, 15');
    if (!coordStr) return;

    const parts = coordStr.split(',').map((p) => parseInt(p.trim(), 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      alert('Geçersiz koordinat formatı! Lütfen "X, Y" şeklinde sayısal değerler girin (Örn: 10, 5).');
      return;
    }

    if (type === 'station') {
      buyChargingStation(`Şarj İstasyonu #${chargingStations.length + 1}`, parts[0], parts[1], stationPrice);
    } else {
      buyDepot(`Lojistik Deposu #${depots.length + 1}`, parts[0], parts[1], depotPrice);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Robot Purchase Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Robot Mağazası (Filo Büyüdükçe Fiyat Artar)</span>
          </span>
          <span style={{ color: '#34d399', fontFamily: 'Fira Code, monospace', fontWeight: 800, fontSize: '0.85rem' }}>
            Bakiye: ${credits.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {AVAILABLE_ROBOTS.map((template) => {
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
                  <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: '#e2e8f0', fontSize: '0.8rem' }}>
                    ${currentPrice.toLocaleString()}
                  </span>
                  <button
                    onClick={() => buyRobot(template.name, template.color, currentPrice)}
                    disabled={!canAfford}
                    className="ui-btn ui-btn-primary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: !canAfford ? 0.4 : 1 }}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Satın Al</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Building Construction Section (Depots & Stations) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Tesis & Bina İnşaatı (Kademeli Fiyat Artışı)</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {/* Station Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <BatteryCharging className="w-4 h-4 text-amber-400" />
                <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>Şarj İstasyonu İnşa Et</h4>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
                Haritada belirleyeceğiniz (X, Y) koordinatına kalıcı şarj istasyonu kurar. İlk ekstra inşaat ÜCRETSİZ!
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: stationPrice === 0 ? '#34d399' : '#fbbf24', fontSize: '0.8rem' }}>
                {stationPrice === 0 ? '[ÜCRETSİZ]' : `$${stationPrice.toLocaleString()}`}
              </span>
              <button
                onClick={() => handleBuyBuilding('station')}
                disabled={credits < stationPrice}
                className="ui-btn ui-btn-cyan"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < stationPrice ? 0.4 : 1 }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Konum Seç ve İnşa Et</span>
              </button>
            </div>
          </div>

          {/* Depot Card */}
          <div className="sku-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Building2 className="w-4 h-4 text-cyan-400" />
                <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>Lojistik Deposu İnşa Et</h4>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
                Robotların maden kargolarını otomatik boşaltması için (X, Y) konumuna depo kurar. İlk ekstra inşaat ÜCRETSİZ!
              </p>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, color: depotPrice === 0 ? '#34d399' : '#38bdf8', fontSize: '0.8rem' }}>
                {depotPrice === 0 ? '[ÜCRETSİZ]' : `$${depotPrice.toLocaleString()}`}
              </span>
              <button
                onClick={() => handleBuyBuilding('depot')}
                disabled={credits < depotPrice}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: credits < depotPrice ? 0.4 : 1 }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Konum Seç ve İnşa Et</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Selected Robot Kademeli Upgrades Section */}
      {selectedRobot && (() => {
        const radarCost = getStatUpgradePrice(selectedRobot.radarLevel, 200);
        const batteryCost = getStatUpgradePrice(selectedRobot.batteryLevel, 150);
        const miningCost = getStatUpgradePrice(selectedRobot.miningLevel, 250);
        const cargoCost = getStatUpgradePrice(selectedRobot.cargoLevel || 1, 180);

        return (
          <div style={{ background: '#090e17', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot className="w-4 h-4 text-cyan-400" />
                <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>
                  Seçili Robot Yükseltmeleri ({selectedRobot.name})
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'Fira Code, monospace' }}>
                Radar: {selectedRobot.radarRange} Kare (Lvl {selectedRobot.radarLevel}) | Kargo: {selectedRobot.cargoAmount}/{selectedRobot.maxCargo} kg | Batarya: {selectedRobot.maxEnergy}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
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
            </div>
          </div>
        );
      })()}
    </div>
  );
};
