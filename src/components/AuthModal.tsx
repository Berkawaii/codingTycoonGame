import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail, sendResetPassword } from '../services/firebaseService';
import { Mail, Lock, User, AlertCircle, CheckCircle, X } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setErrorMsg('Lütfen bir Mühendis Çağrı Adı belirleyin.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
        localStorage.setItem('syntax_factory_user_name', displayName.trim());
        setLoading(false);
        setInfoMsg('Hesabınız oluşturuldu! E-postanıza aktivasyon bağlantısı gönderildi.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else if (mode === 'login') {
        const res = await loginWithEmail(email, password);
        if (res.user?.displayName) {
          localStorage.setItem('syntax_factory_user_name', res.user.displayName);
        }
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'reset') {
        if (!email.trim()) {
          setErrorMsg('Lütfen e-posta adresinizi girin.');
          setLoading(false);
          return;
        }
        await sendResetPassword(email.trim());
        setLoading(false);
        setInfoMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
      }
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMsg('Hatalı e-posta veya şifre girdiniz.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Bu e-posta adresi ile zaten kayıt olunmuş. Lütfen Oturum Açın.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      } else {
        setErrorMsg(err.message || 'Bir hata oluştu.');
      }
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
          border: '1px solid rgba(255, 49, 49, 0.45)',
          boxShadow: '0 25px 60px -10px rgba(255, 49, 49, 0.3)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
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

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setInfoMsg(null);
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
            Oturum Aç
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setInfoMsg(null);
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
            Yeni Kayıt
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
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
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
                  Mühendis Çağrı Adı:
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User className="w-4 h-4 text-slate-400 style-icon" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="text"
                    required
                    placeholder="örn: CyberMiner_X"
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
                E-Posta Adresi:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail className="w-4 h-4 text-slate-400 style-icon" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="email"
                  required
                  placeholder="muhendis@syntaxfactory.com"
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
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Şifre:</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      Şifremi Unuttum?
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
              className="ui-btn ui-btn-cyan"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}
            >
              {loading
                ? 'İşleniyor...'
                : mode === 'register'
                ? 'HESAP OLUŞTUR VE DOĞRULA'
                : mode === 'reset'
                ? 'ŞİFRE SIFIRLAMA BAĞLANTISI GÖNDER'
                : 'OTURUM AÇ'}
            </button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.73rem', cursor: 'pointer', textAlign: 'center' }}
              >
                Giriş Ekranına Dön
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
