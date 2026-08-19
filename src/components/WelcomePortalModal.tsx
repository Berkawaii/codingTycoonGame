import React, { useState } from 'react';
import { Play, Trophy, User, LogIn, LogOut, ShieldCheck, Globe, Map, ExternalLink } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { RoadmapModal } from './RoadmapModal';
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
  const { authUser, userDisplayName, startAnonymousSession, logout, language, setLanguage, t } = useGameStore();

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);

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
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
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
          {/* Top Right TR / EN Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Brand Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src="/logo_only.svg"
              alt="Syntax Factory Logo"
              style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.75rem' }}
            />
            <h2 style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '1px', color: '#ffffff', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              SYNTAX <span style={{ color: 'var(--brand-red)' }}>FACTORY</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto' }}>
              {t('welcome_desc')}
            </p>
          </div>

          {/* Account Status Badge */}
          <div style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
              {authUser ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span style={{ color: '#34d399', fontWeight: 700 }}>{userDisplayName}</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-amber-400" />
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>{t('guest_engineer')}</span>
                </>
              )}
            </div>

            {authUser && (
              <button
                onClick={logout}
                style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
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
              className="ui-btn ui-btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t('start_game')}</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              {!authUser ? (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="ui-btn ui-btn-secondary"
                  style={{ padding: '0.7rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('login_or_register')}</span>
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
                  {t('cloud_sync_active')}
                </div>
              )}

              <button
                onClick={() => {
                  onOpenLeaderboard();
                }}
                className="ui-btn ui-btn-secondary"
                style={{ padding: '0.7rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{t('leaderboard')}</span>
              </button>
            </div>

            {/* Roadmap & Developer Footer */}
            <div style={{ marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsRoadmapOpen(true)}
                className="ui-btn ui-btn-secondary"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Map className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'en' ? 'Development Roadmap' : 'Gelişim Yol Haritası'}</span>
              </button>

              <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                Developed by{' '}
                <a
                  href="https://github.com/Berkawaii"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <span>Berkawaii</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
      />
    </>
  );
};
