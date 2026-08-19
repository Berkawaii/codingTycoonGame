import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  loginWithEmail,
  registerWithEmail,
  sendResetPassword,
  checkDisplayNameExists,
  resendVerificationEmailToUser,
} from '../services/firebaseService';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, X, Globe } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const { t, language, setLanguage } = useGameStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [unverifiedUserObj, setUnverifiedUserObj] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setUnverifiedUserObj(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setErrorMsg(t('display_name_label'));
          setLoading(false);
          return;
        }

        // Check if Engineer Callsign (displayName) is already taken
        const nameExists = await checkDisplayNameExists(displayName.trim());
        if (nameExists) {
          setErrorMsg(t('name_already_taken'));
          setLoading(false);
          return;
        }

        const res = await registerWithEmail(email.trim(), password, displayName.trim());
        localStorage.setItem('syntax_factory_user_name', displayName.trim());
        setLoading(false);
        setInfoMsg(t('registration_success_verify', { email: email.trim() }));
        setUnverifiedUserObj(res.user);
      } else if (mode === 'login') {
        const res = await loginWithEmail(email.trim(), password);

        // Check mandatory email verification
        if (res.user && !res.user.emailVerified) {
          setUnverifiedUserObj(res.user);
          setErrorMsg(t('email_not_verified_error', { email: email.trim() }));
          setLoading(false);
          return;
        }

        if (res.user?.displayName) {
          localStorage.setItem('syntax_factory_user_name', res.user.displayName);
        }
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'reset') {
        if (!email.trim()) {
          setErrorMsg(t('email_label'));
          setLoading(false);
          return;
        }
        await sendResetPassword(email.trim());
        setLoading(false);
        setInfoMsg(t('reset_link_sent'));
      }
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/display-name-taken') {
        setErrorMsg(t('name_already_taken'));
      } else if (err.code === 'auth/email-not-verified') {
        setUnverifiedUserObj(err.user);
        setErrorMsg(t('email_not_verified_error', { email: email.trim() }));
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setErrorMsg(t('invalid_credentials'));
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg(t('email_already_in_use'));
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg(t('weak_password'));
      } else {
        setErrorMsg(err.message || 'Error occurred.');
      }
    }
  };

  const handleResendEmail = async () => {
    if (!unverifiedUserObj) return;
    try {
      await resendVerificationEmailToUser(unverifiedUserObj);
      setInfoMsg(t('verification_sent_info'));
    } catch (err: any) {
      setErrorMsg(err.message || 'Resend error.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(10px)',
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
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '450px',
          overflow: 'hidden',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(255, 49, 49, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
            borderBottom: '1px solid rgba(255, 49, 49, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo_only.svg" alt="Syntax Factory Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <h3 style={{ fontFamily: 'var(--font-hud)', fontWeight: 700, color: '#ffffff', fontSize: '1rem', letterSpacing: '0.75px' }}>
              SYNTAX <span style={{ color: 'var(--brand-red)' }}>FACTORY</span>
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language Selector TR / EN Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#38bdf8',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>

            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setInfoMsg(null);
              setUnverifiedUserObj(null);
            }}
            style={{
              padding: '0.65rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: mode === 'login' ? '#38bdf8' : '#64748b',
              background: mode === 'login' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid #06b6d4' : 'none',
              cursor: 'pointer',
            }}
          >
            {t('login_tab')}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setInfoMsg(null);
              setUnverifiedUserObj(null);
            }}
            style={{
              padding: '0.65rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: mode === 'register' ? '#38bdf8' : '#64748b',
              background: mode === 'register' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid #06b6d4' : 'none',
              cursor: 'pointer',
            }}
          >
            {t('register_tab')}
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.25rem' }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                padding: '0.55rem 0.75rem',
                marginBottom: '1rem',
                fontSize: '0.74rem',
                color: '#f87171',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
              {unverifiedUserObj && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: '4px',
                    background: 'rgba(239, 68, 68, 0.25)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ✉️ {t('resend_verification')}
                </button>
              )}
            </div>
          )}

          {infoMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '6px',
                padding: '0.55rem 0.75rem',
                marginBottom: '1rem',
                fontSize: '0.74rem',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  {t('display_name_label')}:
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <UserIcon className="w-4 h-4 text-slate-400 style-icon" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="text"
                    required
                    placeholder="CyberMiner_X"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="ui-input"
                    style={{ width: '100%', paddingLeft: '32px', fontSize: '0.78rem' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                {t('email_label')}:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail className="w-4 h-4 text-slate-400 style-icon" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="email"
                  required
                  placeholder="engineer@syntaxfactory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%', paddingLeft: '32px', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('password_label')}:</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMsg(null);
                        setInfoMsg(null);
                        setUnverifiedUserObj(null);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      {t('reset_tab')}?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock className="w-4 h-4 text-slate-400 style-icon" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ui-input"
                    style={{ width: '100%', paddingLeft: '32px', fontSize: '0.78rem' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ui-btn ui-btn-primary"
              style={{ padding: '0.7rem', fontSize: '0.82rem', fontWeight: 800, width: '100%', marginTop: '0.5rem' }}
            >
              {loading
                ? '...'
                : mode === 'register'
                ? t('register_btn')
                : mode === 'reset'
                ? t('reset_btn')
                : t('login_btn')}
            </button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setInfoMsg(null);
                  setUnverifiedUserObj(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.73rem', cursor: 'pointer', textAlign: 'center' }}
              >
                {t('back_to_login')}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
