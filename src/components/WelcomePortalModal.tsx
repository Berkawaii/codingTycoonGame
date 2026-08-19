import React, { useState } from 'react';
import { Play, Trophy, User, X, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useGameStore } from '../store/useGameStore';

interface WelcomePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  onOpenMarketplace?: () => void;
  onOpenTutorial?: () => void;
}

export const WelcomePortalModal: React.FC<WelcomePortalModalProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard,
}) => {
  const { authUser, userDisplayName, startAnonymousSession, logout } = useGameStore();

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  if (!isOpen) return null;

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
            background: 'rgba(9, 13, 22, 0.96)',
            border: '1px solid rgba(255, 49, 49, 0.45)',
            boxShadow: '0 25px 60px -10px rgba(255, 49, 49, 0.35)',
            borderRadius: '18px',
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



          {/* Account Status Badge */}
          <div style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
              {authUser ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Oturum Açıldı: {userDisplayName}</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-amber-400" />
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>Misafir Oyuncu (Bulut Kayıt İçin Kaydolun)</span>
                </>
              )}
            </div>

            {authUser && (
              <button
                onClick={logout}
                style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış Yap</span>
              </button>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                if (!authUser) {
                  startAnonymousSession();
                } else {
                  onClose();
                }
              }}
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
              {!authUser ? (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="ui-btn ui-btn-primary"
                  style={{ padding: '0.7rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap / Kaydol</span>
                </button>
              ) : (
                <div
                  style={{
                    padding: '0.7rem',
                    fontSize: '0.75rem',
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    textAlign: 'center',
                    fontWeight: 700,
                  }}
                >
                  Cloud Sync Aktif
                </div>
              )}

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
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
};
