import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  fetchCommunityScripts,
  publishCommunityScript,
  likeCommunityScript,
  CommunityScript,
} from '../services/firebaseService';
import { Code2, ThumbsUp, Download, PlusCircle, X, Check, Shield, Wrench, Pickaxe } from 'lucide-react';

interface ScriptMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptMarketplaceModal: React.FC<ScriptMarketplaceModalProps> = ({ isOpen, onClose }) => {
  const { setScriptCode, addLog } = useGameStore();

  const [scripts, setScripts] = useState<CommunityScript[]>([]);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'MINING' | 'REPAIR' | 'DEFENSE' | 'HAULER'>('ALL');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // Publish Script Form State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCategory] = useState<CommunityScript['category']>('MINING');
  const [newCode, setNewCode] = useState<string>('');

  const loadScripts = async () => {
    const data = await fetchCommunityScripts();
    setScripts(data);
  };

  useEffect(() => {
    if (isOpen) {
      loadScripts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyToRobot = (script: CommunityScript) => {
    setScriptCode(script.code);
    setAppliedId(script.id);
    addLog('success', `[SCRIPT PAZARI]: '${script.title}' C# algoritması seçili editöre ve robota başarıyla yüklendi.`);
    setTimeout(() => setAppliedId(null), 2000);
  };

  const handleLike = async (scriptId: string) => {
    await likeCommunityScript(scriptId);
    setScripts((prev) =>
      prev.map((s) => (s.id === scriptId ? { ...s, likes: s.likes + 1 } : s))
    );
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const authorName = localStorage.getItem('syntax_factory_user_name') || 'Mühendis Oyuncu';
    const authorId = localStorage.getItem('syntax_factory_user_id') || `user-${Date.now()}`;

    await publishCommunityScript(
      newTitle,
      newDescription || 'Gelişmiş otonom C# betiği.',
      newCategory,
      newCode,
      authorName,
      authorId
    );

    setIsPublishing(false);
    setNewTitle('');
    setNewDescription('');
    setNewCode('');
    await loadScripts();
  };

  const filteredScripts = scripts.filter((s) => {
    return activeCategory === 'ALL' || s.category === activeCategory;
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
          border: '1px solid rgba(255, 49, 49, 0.45)',
          boxShadow: '0 25px 60px -10px rgba(255, 49, 49, 0.3)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
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
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
            borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Code2 className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1rem', letterSpacing: '0.5px' }}>
                SYNTAX FACTORY - TOPLULUK C# SCRIPT PAZARI
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Oyuncuların yazdığı otonom C# betiklerini keşfedin veya kendi kodunuzu toplulukla paylaşın
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Filter & Action Bar */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`ui-btn ${activeCategory === 'ALL' ? 'ui-btn-cyan' : 'ui-btn-secondary'}`}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
            >
              Tümü
            </button>
            <button
              onClick={() => setActiveCategory('MINING')}
              className={`ui-btn ${activeCategory === 'MINING' ? 'ui-btn-cyan' : 'ui-btn-secondary'}`}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
            >
              <Pickaxe className="w-3 h-3 text-cyan-400" />
              <span>Madencilik</span>
            </button>
            <button
              onClick={() => setActiveCategory('REPAIR')}
              className={`ui-btn ${activeCategory === 'REPAIR' ? 'ui-btn-cyan' : 'ui-btn-secondary'}`}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
            >
              <Wrench className="w-3 h-3 text-emerald-400" />
              <span>Tamir</span>
            </button>
            <button
              onClick={() => setActiveCategory('DEFENSE')}
              className={`ui-btn ${activeCategory === 'DEFENSE' ? 'ui-btn-cyan' : 'ui-btn-secondary'}`}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
            >
              <Shield className="w-3 h-3 text-rose-400" />
              <span>Savunma</span>
            </button>
          </div>

          <button
            onClick={() => setIsPublishing(true)}
            className="ui-btn ui-btn-primary"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.73rem', fontWeight: 700 }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Kendi Betiğini Paylaş</span>
          </button>
        </div>

        {/* Script Cards List */}
        <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isPublishing ? (
            <form onSubmit={handlePublishSubmit} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>Toplulukla Yeni C# Betiği Paylaş</h4>
              <input
                type="text"
                placeholder="Script Başlığı (örn: Otomatik Şarjlı Maden Algoritması)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="ui-input"
                style={{ width: '100%', fontSize: '0.78rem' }}
                required
              />
              <textarea
                placeholder="Açıklama & Çalışma Mantığı..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="ui-input"
                style={{ width: '100%', height: '60px', fontSize: '0.75rem' }}
              />
              <textarea
                placeholder="C# Kod Bloğu..."
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="ui-input"
                style={{ width: '100%', height: '140px', fontFamily: 'Fira Code, monospace', fontSize: '0.72rem' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsPublishing(false)} className="ui-btn ui-btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>
                  İptal
                </button>
                <button type="submit" className="ui-btn ui-btn-cyan" style={{ padding: '0.35rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  Yayınla
                </button>
              </div>
            </form>
          ) : filteredScripts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
              Kriterlere uygun topluluk betiği bulunamadı...
            </div>
          ) : (
            filteredScripts.map((script) => (
              <div
                key={script.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                      {script.category}
                    </span>
                    <h4 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.88rem' }}>{script.title}</h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleLike(script.id)}
                      className="ui-btn ui-btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ThumbsUp className="w-3 h-3 text-cyan-400" />
                      <span>{script.likes}</span>
                    </button>

                    <button
                      onClick={() => handleApplyToRobot(script)}
                      className="ui-btn ui-btn-cyan"
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.73rem', fontWeight: 700 }}
                    >
                      {appliedId === script.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{appliedId === script.id ? 'Uygulandı' : 'Seçili Robota Uygula'}</span>
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{script.description}</p>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Yazar: <strong style={{ color: '#cbd5e1' }}>{script.authorName}</strong> • {script.createdAt}
                </div>
              </div>
            ))
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
