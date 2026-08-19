import React, { useState } from 'react';
import { Play, Trophy, Code2, GraduationCap, User, Check, X, LogIn } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface WelcomePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  onOpenMarketplace: () => void;
  onOpenTutorial: () => void;
}

export const WelcomePortalModal: React.FC<WelcomePortalModalProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard,
  onOpenMarketplace,
  onOpenTutorial,
}) => {
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem('syntax_factory_user_name') || 'Mühendis Oyuncu'
  );
  const [savedNameSuccess, setSavedNameSuccess] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    localStorage.setItem('syntax_factory_user_name', userName.trim());
    setSavedNameSuccess(true);
    setTimeout(() => setSavedNameSuccess(false), 1500);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 110,
          background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.95) 0%, rgba(5, 8, 15, 0.98) 100%)',
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
            background: 'rgba(9, 14, 23, 0.95)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            boxShadow: '0 25px 60px -10px rgba(6, 182, 212, 0.3)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            padding: '2rem 1.5rem',
            position: 'relative',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>

          {/* Brand Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <img
              src="/logowithname.svg"
              alt="Syntax Factory Logo"
              style={{ width: '220px', height: 'auto', objectFit: 'contain', margin: '0 auto 0.75rem auto' }}
            />
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto' }}>
              Otonom C# robot filosu yönetimi, madencilik lojistiği, güç şebekeleri ve çetin gezegen atmosfer simülasyonu.
            </p>
          </div>

          {/* Engineer Call-sign Card */}
          <form
            onSubmit={handleSaveName}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <User className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Mühendis Çağrı Adınız (örn: CyberCoder)"
                className="ui-input"
                style={{ width: '100%', fontSize: '0.78rem' }}
              />
            </div>
            <button type="submit" className="ui-btn ui-btn-cyan" style={{ padding: '0.35rem 0.75rem', fontSize: '0.73rem', fontWeight: 700 }}>
              {savedNameSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Kaydet'}
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={onClose}
              className="ui-btn"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>OYUNA BAŞLA (SANDBOX SIMULATOR)</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.7rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Yap / Kaydol</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenLeaderboard();
                }}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.7rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Liderlik Tablosu</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              <button
                onClick={() => {
                  onClose();
                  onOpenMarketplace();
                }}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.65rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Script Pazarı</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenTutorial();
                }}
                className="ui-btn ui-btn-cyan"
                style={{ padding: '0.65rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <GraduationCap className="w-4 h-4" />
                <span>C# Akademisi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setUserName(localStorage.getItem('syntax_factory_user_name') || 'Mühendis Oyuncu');
        }}
      />
    </>
  );
};
