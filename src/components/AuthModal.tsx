import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../services/firebaseService';
import { Mail, Lock, User, AlertCircle, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!displayName.trim()) {
          setErrorMsg('Lütfen bir Mühendis Çağrı Adı belirleyin.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
        localStorage.setItem('syntax_factory_user_name', displayName.trim());
      } else {
        const res = await loginWithEmail(email, password);
        if (res.user?.displayName) {
          localStorage.setItem('syntax_factory_user_name', res.user.displayName);
        }
      }
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Hatalı e-posta veya şifre girdiniz.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Bu e-posta adresi ile zaten kayıt olunmuş.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      } else {
        setErrorMsg(err.message || 'Giriş yapılırken bir hata oluştu.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res && res.user?.displayName) {
        localStorage.setItem('syntax_factory_user_name', res.user.displayName);
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      } else if (res === null) {
        setErrorMsg('Google giriş sayfasına yönlendiriliyorsunuz...');
      }
    } catch (err: any) {
      setLoading(false);
      if (err.message && (err.message.includes('closing') || err.message.includes('closed'))) {
        setErrorMsg('Pencere kapandı. Lütfen tekrar açıp hesap seçin veya E-posta ile giriş yapın.');
      } else {
        setErrorMsg('Google ile giriş yapılırken bir sorun oluştu: ' + (err.message || ''));
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
          border: '1px solid rgba(6, 182, 212, 0.4)',
          boxShadow: '0 20px 50px -10px rgba(6, 182, 212, 0.3)',
          borderRadius: '14px',
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
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo_only.svg" alt="Syntax Factory Logo" style={{ width: '28px', height: '28px' }} />
            <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.95rem' }}>
              {isRegisterMode ? 'SYNTAX FACTORY KAYIT' : 'SYNTAX FACTORY GİRİŞ'}
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
              setIsRegisterMode(false);
              setErrorMsg(null);
            }}
            style={{
              padding: '0.65rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: !isRegisterMode ? '#38bdf8' : '#64748b',
              background: !isRegisterMode ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: !isRegisterMode ? '2px solid #06b6d4' : 'none',
              cursor: 'pointer',
            }}
          >
            Oturum Aç (Login)
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg(null);
            }}
            style={{
              padding: '0.65rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: isRegisterMode ? '#38bdf8' : '#64748b',
              background: isRegisterMode ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: isRegisterMode ? '2px solid #06b6d4' : 'none',
              cursor: 'pointer',
            }}
          >
            Yeni Kayıt (Register)
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

          {/* Google Sign In Quick Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#060911',
              color: '#f8fafc',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '1rem',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google ile Giriş Yap</span>
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#64748b', marginBottom: '1rem', position: 'relative' }}>
            <span>VEYA E-POSTA İLE</span>
          </div>

          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {isRegisterMode && (
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

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Şifre:
              </label>
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

            <button
              type="submit"
              disabled={loading}
              className="ui-btn ui-btn-cyan"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}
            >
              {loading ? 'İşleniyor...' : isRegisterMode ? 'HESAP OLUŞTUR' : 'OTURUM AÇ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
