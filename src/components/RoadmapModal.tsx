import React from 'react';
import { X, Map, ExternalLink, GitBranch, Terminal, Shield, Zap, Cpu, Bot, Factory, Crosshair, Orbit } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useGameStore();

  if (!isOpen) return null;

  const isEn = language === 'en';

  const phases = [
    {
      id: 'phase-1',
      number: 'PHASE 01',
      status: 'COMPLETED',
      title: isEn ? 'Core WASM Engine & C# Roslyn Runtime' : 'WASM Motoru & C# Roslyn Çalışma Zamanı',
      date: 'Q1 2026',
      badgeColor: '#34d399',
      icon: Terminal,
      items: isEn
        ? [
            'Real-time dynamic C# expression evaluation engine without static regex heuristics',
            'Integrated Monaco Code Editor with syntax highlighting and auto-completion',
            'Built-in IRobot API bindings (GetCargo, GetEnergy, GetRadarInfo, GoTo, Mine, Move)',
            'Multi-threaded 2D canvas rendering engine (20x20 grid simulation at 10 TPS)',
          ]
        : [
            'Statik hevesli ifadeler yerine dinamik C# kontrol akışı ve değişken değerlendirme motoru',
            'Sözdizimi vurgulama ve kod tamamlama özellikli Monaco C# Editörü entegrasyonu',
            'Dahili IRobot API bağlantıları (GetCargo, GetEnergy, GetRadarInfo, GoTo, Mine, Move)',
            'Çok izlekli 2D tuval çizim motoru (10 TPS hızında 20x20 ızgara simülasyonu)',
          ],
    },
    {
      id: 'phase-2',
      number: 'PHASE 02',
      status: 'COMPLETED',
      title: isEn ? 'Swarm Robotics & Wireless Radio Mesh' : 'Sürü Robotik & Kablosuz Radyo Ağı',
      date: 'Q2 2026',
      badgeColor: '#34d399',
      icon: Zap,
      items: isEn
        ? [
            'Specialized Transporter heavy cargo haulers (200kg hold, 2x movement speed)',
            'Automated Repair Drones equipped with targeting repair lasers (RepairRobot)',
            'Inter-robot radio broadcast system (SendRadioMessage, ReadRadioMessages)',
            'Autonomous swarm mining dispatch and cargo handoff protocols',
          ]
        : [
            'Özel Lojistik Transporter robotları (200kg kargo kapasitesi, 2 kat hareket hızı)',
            'Tamir lazerleri ile donatılmış otonom Tamir Dronları (RepairRobot)',
            'Robotlar arası radyo yayın iletişim sistemi (SendRadioMessage, ReadRadioMessages)',
            'Otonom sürü madenciliği dağıtım ve kargo aktarım protokolleri',
          ],
    },
    {
      id: 'phase-3',
      number: 'PHASE 03',
      status: 'COMPLETED',
      title: isEn ? 'Multi-Biome Exploration & Power Grids' : 'Çoklu Biyom Keşfi & Termal Güç Şebekesi',
      date: 'Q2 2026',
      badgeColor: '#34d399',
      icon: GitBranch,
      items: isEn
        ? [
            'Thermal Power Plants with dynamic C# overclocking (0.5x to 2.0x efficiency)',
            'Multi-biome support: Mars Basin, Volcanic Magma, Quantum Cavern, Glacial Wastes',
            'Environmental hazards: Dust Storms, Ash Rain, EMP Radiation, Polar Blizzards',
            'Grid energy buffer storage and station emergency trickle-charging system',
          ]
        : [
            'Dinamik C# overclocking destekli Termal Enerji Santralleri (0.5x - 2.0x verim)',
            'Çoklu biyom harita desteği: Mars Havzası, Volkanik Magma, Kuantum Mağarası, Kutup Buzulu',
            'Çevresel tehlike olayları: Kum Fırtınası, Kül Yağmuru, EMP Radyasyonu, Kar Tipi',
            'Şebeke enerji tampon depolama ve şarj istasyonu acil durum hızlı doldurma sistemi',
          ],
    },
    {
      id: 'phase-4',
      number: 'PHASE 04',
      status: 'COMPLETED',
      title: isEn ? 'Cloud Sync & Global Script Marketplace' : 'Bulut Senkronizasyon & C# Script Pazarı',
      date: 'Q3 2026',
      badgeColor: '#34d399',
      icon: Shield,
      items: isEn
        ? [
            'Firebase Auth & Cloud Firestore sync for save states, biomes, and C# scripts',
            'Unique Engineer Callsign registry (display_names collection)',
            'Global Competitions Leaderboard with automated net-worth score calculation',
            'Community C# Script Marketplace for sharing and downloading autonomous scripts',
          ]
        : [
            'Firebase Auth ve Cloud Firestore bulut kaydetme ve C# betik senkronizasyonu',
            'Benzersiz Mühendis Çağrı Kodu kayıt dizini (display_names koleksiyonu)',
            'Otomatik net değer puanlamalı Global Liderlik Tablosu',
            'Otonom betik paylaşımı ve indirme için Topluluk C# Script Pazarı',
          ],
    },
    {
      id: 'phase-5',
      number: 'PHASE 05',
      status: 'IN PROGRESS',
      title: isEn ? 'Industrial Processing & Refineries' : 'Endüstriyel İşleme & Rafineriler',
      date: 'Q4 2026',
      badgeColor: '#fbbf24',
      icon: Factory,
      items: isEn
        ? [
            'Multi-tier Smelter & Refinery crafting recipes (Iron Ingots, Gold Bars, Ruby Lenses)',
            'Automated Conveyor Belts & Sorting Junctions for continuous material transport',
            'Storage Silos and automated inventory logistics nodes',
            'Advanced C# IBuilding and IRefinery control APIs',
          ]
        : [
            'Çok aşamalı Dökümhane ve Rafineri işleme tarifleri (Demir Külçe, Altın Külçe, Yakut Mercek)',
            'Sürekli malzeme taşıması için Otomatik Taşıyıcı Bantlar ve Ayırıcı Kavşaklar',
            'Depolama Siloları ve otonom envanter lojistik düğümleri',
            'Gelişmiş C# IBuilding ve IRefinery kontrol API arayüzleri',
          ],
    },
    {
      id: 'phase-6',
      number: 'PHASE 06',
      status: 'IN PROGRESS',
      title: isEn ? 'Automated Base Defense & Rogue Raids' : 'Otomatik Üs Savunması & Haydut Baskınları',
      date: 'Q4 2026',
      badgeColor: '#fbbf24',
      icon: Crosshair,
      items: isEn
        ? [
            'Defensive Turret networks with programmable targeting algorithms (ITurret API)',
            'Dynamic Rogue Bandit waves and automated defense response protocols',
            'Security alarms, perimeter sensors, and automated lockdown modes',
            'Repair Drone threat priority dispatching during base attacks',
          ]
        : [
            'Programlanabilir hedefleme algoritmalarına sahip Savunma Kulesi ağları (ITurret API)',
            'Dinamik Haydut dalgaları ve otomatik savunma müdahale protokolleri',
            'Güvenlik alarmları, çevre sensörleri ve otomatik kilitlenme modları',
            'Üs saldırıları sırasında Tamir Dronlarının öncelikli müdahale sevkiyatı',
          ],
    },
    {
      id: 'phase-7',
      number: 'PHASE 07',
      status: 'PLANNED',
      title: isEn ? 'Custom Assemblies & Script Profiler' : 'Özel C# Montajları & Performans Profili',
      date: 'Q1 2027',
      badgeColor: '#38bdf8',
      icon: Cpu,
      items: isEn
        ? [
            'User-defined C# helper classes and custom namespace imports (using MyCustomLib)',
            'Multi-file C# workspace management inside integrated Monaco Editor',
            'Script version history, diff inspector, and single-click rollback',
            'CPU tick execution profiler and memory usage telemetry inspector',
          ]
        : [
            'Kullanıcı tanımlı özel C# yardımcı sınıfları ve namespace yükleme (using MyCustomLib)',
            'Monaco Editörü içinde çoklu dosya C# proje ve alan yönetimi',
            'Script sürüm geçmişi, fark denetleyicisi (diff inspector) ve tek tıkla geri alma',
            'İşlemci tick yürütme süresi ve bellek kullanımı performans metriği',
          ],
    },
    {
      id: 'phase-8',
      number: 'PHASE 08',
      status: 'PLANNED',
      title: isEn ? 'Orbital Stations & Zero-Gravity Logistics' : 'Yörünge İstasyonları & Sıfır Yerçekimi',
      date: 'Q2 2027',
      badgeColor: '#38bdf8',
      icon: Orbit,
      items: isEn
        ? [
            'Orbital Space Station biomes featuring zero-gravity physical momentum',
            'Automated surface-to-orbit launch pads and cargo shuttles',
            'Orbital Solar Arrays and wireless energy beam transmitters',
            'Micro-meteorite defense fields and vacuum logistics pipelines',
          ]
        : [
            'Sıfır yerçekimi fiziksel ivmelenmesi sunan Yörünge Uzay İstasyonu biyomları',
            'Otomatik yüzeyden yörüngeye fırlatma pedleri ve kargo mekikleri',
            'Yörünge Güneş Paneli dizilimleri ve kablosuz enerji ışınlayıcıları',
            'Mikro-göktaşı savunma alanları ve vakum lojistik hatları',
          ],
    },
    {
      id: 'phase-9',
      number: 'PHASE 09',
      status: 'FUTURE VISION',
      title: isEn ? 'AI Copilot Agent & Visual Logic Builder' : 'Yapay Zeka Asistanı & Görsel Mantık Editörü',
      date: 'Q3 2027',
      badgeColor: '#a855f7',
      icon: Bot,
      items: isEn
        ? [
            'Integrated AI C# Copilot agent for real-time syntax and logic diagnostics',
            'Automated code optimizer suggesting vector pathfinding improvements',
            'Visual Block-Code bridge for converting C# code to visual node graphs',
            'Interstellar resource trade networks and planetary defense satellites',
          ]
        : [
            'Gerçek zamanlı sözdizimi ve mantık hataları için entegre AI C# Copilot ajanı',
            'Vektör yol bulma iyileştirmeleri öneren otomatik kod optimize edici',
            'C# kodunu görsel düğüm grafiklerine dönüştüren Görsel Blok-Kod köprüsü',
            'Yıldızlararası kaynak ticaret ağları ve gezegen savunma uyduları',
          ],
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(5, 8, 15, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="sku-card"
        style={{
          background: 'rgba(9, 13, 22, 0.96)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 0 40px rgba(0, 242, 254, 0.15)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Map className="w-6 h-6 text-cyan-400" />
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  letterSpacing: '1px',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                {isEn ? 'SYNTAX FACTORY - DEVELOPMENT ROADMAP' : 'SYNTAX FACTORY - GELİŞİM YOL HARİTASI'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {isEn
                  ? 'Technical milestones, platform architecture phases, and upcoming features'
                  : 'Teknik kilometre taşları, platform mimarisi fazları ve gelecek özellikler'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setLanguage(isEn ? 'tr' : 'en')}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#38bdf8',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {language.toUpperCase()}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.25rem',
          }}
        >
          {phases.map((phase) => {
            const IconComp = phase.icon;
            return (
              <div
                key={phase.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: `1px solid ${phase.badgeColor}40`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        background: `${phase.badgeColor}20`,
                        border: `1px solid ${phase.badgeColor}`,
                        padding: '6px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComp style={{ width: '18px', height: '18px', color: phase.badgeColor }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: phase.badgeColor, letterSpacing: '1px' }}>
                        {phase.number} - {phase.date}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '2px 0 0 0' }}>
                        {phase.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: phase.badgeColor,
                      background: `${phase.badgeColor}15`,
                      border: `1px solid ${phase.badgeColor}50`,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {phase.status}
                  </span>
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: '#94a3b8',
                  }}
                >
                  {phase.items.map((item, idx) => (
                    <li key={idx} style={{ lineHeight: '1.4' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Developed by{' '}
            <a
              href="https://github.com/Berkawaii"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Berkawaii</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="ui-btn ui-btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem', fontWeight: 800 }}
          >
            <span>{isEn ? 'Close' : 'Kapat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
