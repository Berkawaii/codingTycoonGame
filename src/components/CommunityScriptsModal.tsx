import React, { useState } from 'react';
import { COMMUNITY_SCRIPTS_CATALOG, CommunityScript } from '../constants/communityScripts';
import { useGameStore } from '../store/useGameStore';
import { Globe, Download, Star, Code2, Sparkles, X, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript: (code: string, scriptTitle: string) => void;
}

export const CommunityScriptsModal: React.FC<Props> = ({ isOpen, onClose, onApplyScript }) => {
  const { robots, selectedRobotId, addLog } = useGameStore();
  const selectedRobot = robots.find((r) => r.id === selectedRobotId);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [previewScript, setPreviewScript] = useState<CommunityScript | null>(null);

  if (!isOpen) return null;

  const filteredScripts =
    activeCategory === 'ALL'
      ? COMMUNITY_SCRIPTS_CATALOG
      : COMMUNITY_SCRIPTS_CATALOG.filter((s) => s.category === activeCategory);

  const handleApply = (script: CommunityScript) => {
    onApplyScript(script.code, script.title);
    addLog(
      'success',
      `⚡ Topluluk Scripti '${script.title}' (${script.author}) ${selectedRobot?.name || 'Robot'} için aktif edildi!`
    );
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="ui-panel glow-border animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0b1329 0%, #060b17 100%)',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(0, 242, 254, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                border: '1px solid rgba(0, 242, 254, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌐 TOPLULUK SCRİPT MARKETİ</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  FAZ 10 ÖNİZLEME
                </span>
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Diğer mühendislerin yazdığı en popüler otonom C# algoritmalarını keşfedin ve tek tıkla uygulayın.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ui-btn ui-btn-secondary"
            style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Phase 10 Banner */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
            borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.78rem',
            color: '#e2e8f0',
          }}
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong style={{ color: '#c084fc' }}>🚀 Faz 10 Yakında:</strong> Kendi C# scriptlerinizi toplulukla paylaşabilecek, beğeni toplayacak ve küresel liderlik tablosunda yerinizi alacaksınız!
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(10, 15, 29, 0.4)',
          }}
        >
          {[
            { id: 'ALL', label: '⚡ HEPSİ (5)' },
            { id: 'SWARM_LOGISTICS', label: '🚚 SÜRÜ LOJİSTİK' },
            { id: 'AUTO_MINING', label: '⛏️ OTOMATİK MADENCİLİK' },
            { id: 'RARE_HUNTER', label: '💎 NADİR KRİSTAL' },
            { id: 'POWER_PLANT', label: '⚡ TERMAL SANTRAL' },
            { id: 'INDUSTRIAL', label: '⚙️ ENDÜSTRİYEL' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: activeCategory === tab.id ? 'rgba(0, 242, 254, 0.6)' : 'rgba(51, 65, 85, 0.5)',
                background: activeCategory === tab.id ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)' : 'rgba(15, 23, 42, 0.6)',
                color: activeCategory === tab.id ? '#00f2fe' : '#94a3b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Script Cards Grid */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                borderRadius: '12px',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}
              className="hover:border-cyan-500/50"
            >
              <div>
                {/* Author & Stats Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: script.avatarColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#000',
                      }}
                    >
                      {script.author.charAt(1).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, fontFamily: 'Fira Code, monospace' }}>
                      {script.author}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {script.rating} ({script.reviewsCount})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      {script.downloads.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
                  {script.title}
                </h3>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                  {script.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.62rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(51, 65, 85, 0.4)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        fontFamily: 'Fira Code, monospace',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  {script.description}
                </p>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={() => setPreviewScript(script)}
                  className="ui-btn ui-btn-secondary"
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kodu İncele</span>
                </button>

                <button
                  onClick={() => handleApply(script)}
                  className="ui-btn ui-btn-primary"
                  style={{
                    flex: 1.3,
                    padding: '0.45rem',
                    fontSize: '0.75rem',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                    border: '1px solid #38bdf8',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Koda Uygula</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Code Preview Overlay Modal */}
        {previewScript && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(11, 19, 41, 0.95)',
              backdropFilter: 'blur(10px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', fontWeight: 800 }}>
                  {previewScript.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'Fira Code, monospace' }}>
                  Yazar: {previewScript.author}
                </span>
              </div>
              <button
                onClick={() => setPreviewScript(null)}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <pre
              style={{
                flex: 1,
                background: '#090d16',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                borderRadius: '8px',
                padding: '1rem',
                color: '#38bdf8',
                fontFamily: 'Fira Code, monospace',
                fontSize: '0.8rem',
                overflow: 'auto',
                lineHeight: 1.5,
              }}
            >
              <code>{previewScript.code}</code>
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
              <button
                onClick={() => setPreviewScript(null)}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  handleApply(previewScript);
                  setPreviewScript(null);
                }}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' }}
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Bu Kodu Seçili Robota Yükle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
