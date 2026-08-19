import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Terminal, Pickaxe, Navigation, Eye, BatteryCharging, Compass, X, Check, Code, Radio } from 'lucide-react';

interface ApiMethod {
  name: string;
  signature: string;
  description: string;
  icon: React.ReactNode;
  snippet: string;
  category: 'action' | 'query' | 'telemetry';
}

const ROBOT_API_METHODS: ApiMethod[] = [
  {
    name: 'robot.GetCargo()',
    signature: 'int GetCargo()',
    description: 'Robotun mevcut kargosundaki toplam maden miktarını (kg) döndürür. Kapasite dolunca depoya gidilmesi gerekir.',
    icon: <Radio className="w-4 h-4 text-cyan-400" />,
    snippet: 'int currentCargo = robot.GetCargo();',
    category: 'telemetry',
  },
  {
    name: 'robot.GetMaxCargo()',
    signature: 'int GetMaxCargo()',
    description: 'Robotun maksimum taşıyabileceği kargo kapasitesini (kg) döndürür (Varsayılan 50 kg).',
    icon: <Radio className="w-4 h-4 text-emerald-400" />,
    snippet: 'int maxCargo = robot.GetMaxCargo();',
    category: 'telemetry',
  },
  {
    name: 'robot.GetNearestBuilding(string type = "DEPOT")',
    signature: 'BuildingInfo GetNearestBuilding(string type = "CHARGING_PAD" | "DEPOT")',
    description: 'En yakın Bina (Şarj İstasyonu veya Depo) nesnesini ve (X, Y) koordinatını döndürür. robot.GoTo(b.X, b.Y) ile gitmek için kullanılır.',
    icon: <Radio className="w-4 h-4 text-amber-400" />,
    snippet: 'BuildingInfo depot = robot.GetNearestBuilding("DEPOT");\nrobot.GoTo(depot.X, depot.Y);',
    category: 'query',
  },
  {
    name: 'robot.SendRadioMessage(string msgType, int x, int y, string payload = "")',
    signature: 'void SendRadioMessage(string msgType, int x, int y, string payload)',
    description: 'Sürü radyo şebekesine mesaj yayınlar. Örneğin madenci robot kargosu dolduğunda "CARGO_FULL" radyo sinyali atar.',
    icon: <Radio className="w-4 h-4 text-purple-400" />,
    snippet: 'robot.SendRadioMessage("CARGO_FULL", robot.GetX(), robot.GetY(), robot.GetId());',
    category: 'action',
  },
  {
    name: 'robot.ReadRadioMessages()',
    signature: 'List<RadioMessage> ReadRadioMessages()',
    description: 'Haritadaki aktif radyo şebekesini tarar ve gönderilen radyo mesajlarının listesini döndürür.',
    icon: <Radio className="w-4 h-4 text-cyan-400" />,
    snippet: 'List<RadioMessage> msgs = robot.ReadRadioMessages();',
    category: 'query',
  },
  {
    name: 'robot.SendRadioMessage("BANDIT_SPOTTED", x, y, id)',
    signature: 'void SendRadioMessage("BANDIT_SPOTTED", int x, int y, string id)',
    description: 'Haritada hırsız Korsan Robot tespit edildiğinde Lazer Savunma Kulelerini ve koruma birliklerini otonom göreve çağırmak için radyo alarmı yayınlar.',
    icon: <Radio className="w-4 h-4 text-rose-400" />,
    snippet: 'robot.SendRadioMessage("BANDIT_SPOTTED", robot.GetX(), robot.GetY(), robot.GetId());',
    category: 'action',
  },
  {
    name: 'robot.GetDamagedRobots()',
    signature: 'List<RobotInfo> GetDamagedRobots()',
    description: 'Kum fırtınası veya korsan saldırısı sonucu canı %100 altına düşmüş hasarlı robotların listesini döndürür.',
    icon: <Radio className="w-4 h-4 text-emerald-400" />,
    snippet: 'List<RobotInfo> damaged = robot.GetDamagedRobots();',
    category: 'query',
  },
  {
    name: 'robot.RepairRobot(string targetId)',
    signature: 'bool RepairRobot(string targetId)',
    description: 'Tamir Drone robotu yeşil lazer tamir ışınını aktifleştirerek hedef robotun canını (+25 HP/tick) onarır.',
    icon: <Radio className="w-4 h-4 text-emerald-400" />,
    snippet: 'robot.RepairRobot(target.Id);',
    category: 'action',
  },
  {
    name: 'robot.CollectCargoFromRobot(string targetRobotId)',
    signature: 'bool CollectCargoFromRobot(string targetRobotId)',
    description: 'Lojistik Transporter robotu yanındaki madenci robottan kargoyu kendi dev 200kg haznesine devralır.',
    icon: <Radio className="w-4 h-4 text-amber-400" />,
    snippet: 'robot.CollectCargoFromRobot(msg.SenderId);',
    category: 'action',
  },
  {
    name: 'robot.GoTo(int targetX, int targetY)',
    signature: 'void GoTo(int targetX, int targetY)',
    description: 'Robotu hedef (X, Y) koordinatına (örneğin Şarj İstasyonu (0,0) veya Depoya) doğru 1 kare otonom olarak ilerletir.',
    icon: <Navigation className="w-4 h-4 text-cyan-400" />,
    snippet: 'robot.GoTo(0, 0);',
    category: 'action',
  },
  {
    name: 'robot.GetEnergyToNearestStation()',
    signature: 'int GetEnergyToNearestStation()',
    description: 'Robotun en yakın Şarj İstasyonuna ulaşabilmesi için harcaması gereken minimum batarya miktarını döndürür.',
    icon: <BatteryCharging className="w-4 h-4 text-emerald-400" />,
    snippet: 'int neededEnergy = robot.GetEnergyToNearestStation();',
    category: 'telemetry',
  },
  {
    name: 'robot.GetRadarInfo()',
    signature: 'List<RadarTileInfo> GetRadarInfo()',
    description: 'Robotun donanım menzilindeki (Varsayılan 5 kare, yükseltmelerle +1 kare/Lvl) tüm objeleri tara: (X, Y, Distance, TileType, Name, SKU, Amount, Rarity).',
    icon: <Radio className="w-4 h-4 text-purple-400" />,
    snippet: 'List<RadarTileInfo> radarData = robot.GetRadarInfo();',
    category: 'query',
  },
  {
    name: 'robot.Mine()',
    signature: 'bool Mine()',
    description: 'Önündeki veya bulunduğu karedeki madenden kazı yapar. Kazılan maden birimi otomatik envantere eklenir.',
    icon: <Pickaxe className="w-4 h-4 text-cyan-400" />,
    snippet: 'robot.Mine();',
    category: 'action',
  },
  {
    name: 'robot.Move(Direction dir)',
    signature: 'void Move(Direction direction)',
    description: 'Robotu belirtilen pusula veya nispi yöne (Direction.Forward / North / East / South / West) 1 kare ilerletir.',
    icon: <Navigation className="w-4 h-4 text-emerald-400" />,
    snippet: 'robot.Move(Direction.Forward);',
    category: 'action',
  },
  {
    name: 'robot.GetTileInfo(Direction dir)',
    signature: 'Tile GetTileInfo(Direction direction)',
    description: 'İstenen yöndeki kare nesnesini döndürür. (Properties: HasResource, Amount, ResourceType, X, Y).',
    icon: <Eye className="w-4 h-4 text-amber-400" />,
    snippet: 'Tile frontTile = robot.GetTileInfo(Direction.Forward);',
    category: 'query',
  },
  {
    name: 'robot.Rotate(Direction dir)',
    signature: 'void Rotate(Direction direction)',
    description: 'Robotun yüzünü hareket ettirmeden hedef pusula yönüne çevirir.',
    icon: <Compass className="w-4 h-4 text-purple-400" />,
    snippet: 'robot.Rotate(Direction.East);',
    category: 'action',
  },
  {
    name: 'robot.GetEnergy()',
    signature: 'int GetEnergy()',
    description: 'Robotun mevcut batarya seviyesini (0 - 100) döndürür.',
    icon: <BatteryCharging className="w-4 h-4 text-yellow-400" />,
    snippet: 'int energy = robot.GetEnergy();',
    category: 'telemetry',
  },
  {
    name: 'plant.BurnFuel(string fuelSku)',
    signature: 'void BurnFuel(string fuelSku)',
    description: 'Deponuzdaki cevheri santral yakıt tankına çeker. Yakıtlar: "COAL_ORE" (+50 kWh), "FE_ORE" (+30 kWh), "RUBY_GEM" (+200 kWh), "PLASMA_CORE" (+1,500 kWh).',
    icon: <BatteryCharging className="w-4 h-4 text-emerald-400" />,
    snippet: 'plant.BurnFuel("COAL_ORE");',
    category: 'action',
  },
  {
    name: 'plant.SetOverclockRate(double rate)',
    signature: 'void SetOverclockRate(double rate)',
    description: 'Santralin verimlilik / hız oranını (0.5x - 2.0x) ayarlar. 1.0x üzeri hızlar sıcaklığı artırır; 100°C seviyesinde TERMAL KİLİTLENME (Shutdown) oluşur.',
    icon: <Radio className="w-4 h-4 text-orange-400" />,
    snippet: 'plant.SetOverclockRate(1.6);',
    category: 'action',
  },
  {
    name: 'plant.GetTemperature()',
    signature: 'double GetTemperature()',
    description: 'Santralin anlık termal sıcaklığını (°C) döndürür (20°C - 100°C). 85°C üzerinde Soğutma Modu (0.5x) çağrılması tavsiye edilir.',
    icon: <Radio className="w-4 h-4 text-red-400" />,
    snippet: 'double temp = plant.GetTemperature();',
    category: 'telemetry',
  },
  {
    name: 'plant.GetGridEnergyRatio()',
    signature: 'double GetGridEnergyRatio()',
    description: 'Şebeke enerji deposunun doluluk oranını (0.0 - 1.0) döndürür (%0 = Boş, %1.0 = Dolu).',
    icon: <Radio className="w-4 h-4 text-cyan-400" />,
    snippet: 'double gridRatio = plant.GetGridEnergyRatio();',
    category: 'telemetry',
  },
];

interface ApiReferenceModalProps {
  isOpen: boolean;
  isEmbedded?: boolean;
  onClose: () => void;
  onInsertSnippet: (snippet: string) => void;
}

export const ApiReferencePanel: React.FC<ApiReferenceModalProps> = ({
  isOpen,
  isEmbedded = false,
  onClose,
  onInsertSnippet,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'action' | 'query' | 'telemetry'>('all');

  if (!isOpen) return null;

  const handleCopy = (snippet: string, index: number) => {
    onInsertSnippet(snippet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const filteredMethods = ROBOT_API_METHODS.filter(
    (m) => activeCategory === 'all' || m.category === activeCategory
  );

  const innerContent = (
    <div
      style={{
        background: '#090e17',
        border: isEmbedded ? 'none' : '1px solid #334155',
        borderRadius: '12px',
        width: '100%',
        boxShadow: isEmbedded ? 'none' : '0 20px 50px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        color: '#f1f5f9',
        maxHeight: isEmbedded ? '100%' : '85vh',
        maxWidth: isEmbedded ? '100%' : '680px',
        overflow: 'hidden',
      }}
    >
      {/* Header (Only if modal) */}
      {!isEmbedded && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1rem', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              C# ROBOT API & AKSİYON LİSTESİ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ui-btn ui-btn-icon"
            style={{ padding: '0.35rem' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Bar */}
      <div style={{ display: 'flex', gap: '6px', padding: '8px 12px 0 12px', borderBottom: '1px solid #1e293b', background: '#090e17' }}>
        <button
          onClick={() => setActiveCategory('all')}
          className={`ui-btn ${activeCategory === 'all' ? 'ui-btn-cyan' : 'ui-btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px 6px 0 0' }}
        >
          Tüm Metodlar
        </button>
        <button
          onClick={() => setActiveCategory('action')}
          className={`ui-btn ${activeCategory === 'action' ? 'ui-btn-cyan' : 'ui-btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px 6px 0 0' }}
        >
          Aksiyonlar (Mine, Move)
        </button>
        <button
          onClick={() => setActiveCategory('query')}
          className={`ui-btn ${activeCategory === 'query' ? 'ui-btn-cyan' : 'ui-btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px 6px 0 0' }}
        >
          Sorgular (GetRadarInfo, GetTileInfo)
        </button>
      </div>

      {/* Content Methods List */}
      <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredMethods.map((method, idx) => (
          <div
            key={method.name}
            className="sku-card"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#0f172a', border: '1px solid #1e293b' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {method.icon}
                  <h4 style={{ fontWeight: 700, color: '#67e8f9', fontFamily: 'Fira Code, monospace', fontSize: '0.82rem' }}>
                    {method.name}
                  </h4>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontFamily: 'Fira Code, monospace', padding: '1px 6px', borderRadius: '4px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
                    {method.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.4' }}>{method.description}</p>
              </div>

              <button
                onClick={() => handleCopy(method.snippet, idx)}
                className="ui-btn ui-btn-cyan"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', flexShrink: 0, marginLeft: '8px' }}
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span style={{ color: '#34d399' }}>Eklendi!</span>
                  </>
                ) : (
                  <>
                    <Code className="w-3.5 h-3.5" />
                    <span>Koda Ekle</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ marginTop: '4px', background: '#060911', padding: '6px 10px', borderRadius: '6px', border: '1px solid #1e293b', fontFamily: 'Fira Code, monospace', fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
              <code>{method.signature}</code>
              <span style={{ color: '#64748b' }}>Snippet: {method.snippet}</span>
            </div>
          </div>
        ))}

        {/* Direction Enums section */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
            Pusula Yönleri (Direction Enums) - Tıklayıp Koda Ekleyebilirsiniz:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontFamily: 'Fira Code, monospace', fontSize: '0.75rem' }}>
            {[
              'Direction.Forward',
              'Direction.North',
              'Direction.East',
              'Direction.South',
              'Direction.West',
            ].map((dir, dIdx) => (
              <button
                key={dir}
                onClick={() => handleCopy(dir, 100 + dIdx)}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', color: '#67e8f9' }}
              >
                <Code className="w-3 h-3 text-cyan-400" />
                <span>{dir}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return innerContent;
  }

  const modalOverlay = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '1rem' }}>
      {innerContent}
    </div>
  );

  return ReactDOM.createPortal(modalOverlay, document.body);
};
