import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from '../services/supabase';
import { Database, UserCheck, LogOut, Key, ShieldCheck, X, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange?: (user: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onUserChange }) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'settings' | 'sql'>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Supabase Config States
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const { url, key } = getSupabaseConfig();
      setSupabaseUrl(url);
      setSupabaseKey(key);
      checkUser();
    }
  }, [isOpen]);

  const checkUser = async () => {
    try {
      const u = await getCurrentUser();
      setCurrentUser(u);
      if (onUserChange) onUserChange(u);
    } catch {
      setCurrentUser(null);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setAuthSuccess('Kayıt başarılı! Lütfen e-postanızı doğrulayın veya giriş yapın.');
      } else {
        await signInWithEmail(email, password);
        setAuthSuccess('Başarıyla giriş yapıldı!');
        await checkUser();
        setTimeout(onClose, 800);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Giriş/Kayıt sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    if (onUserChange) onUserChange(null);
    setAuthSuccess('Oturum kapatıldı.');
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
    checkUser();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-base font-outfit">
              SUPABASE CLOUD & AUTHENTICATION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              activeTab === 'auth'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {currentUser ? 'Hesabım & Oturum' : 'Giriş Yap / Kayıt Ol'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              activeTab === 'settings'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Supabase Ayarları
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              activeTab === 'sql'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DB SQL Şeması
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {/* Tab 1: Auth & User Profile */}
          {activeTab === 'auth' && (
            <div>
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
                    <UserCheck className="w-8 h-8 text-emerald-400" />
                    <div>
                      <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                        Bulut Oturumu Açık
                      </div>
                      <div className="text-sm font-semibold text-slate-100">{currentUser.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {currentUser.id}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    C# script'leriniz ve oyun ilerlemeniz otomatik olarak Supabase bulut veritabanınıza senkronize edilir.
                  </p>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Oturumu Kapat</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuth} className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-300">
                      {isSignUp ? 'Yeni Hesap Oluştur' : 'Supabase Hesabına Giriş Yap'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      {isSignUp ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt Ol'}
                    </button>
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authSuccess && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">E-Posta Adresi</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="oyuncu@tycoon.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Şifre</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg transition-all"
                  >
                    {loading ? 'İşleniyor...' : isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Supabase Credentials */}
          {activeTab === 'settings' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                Supabase projenizin <strong>Project URL</strong> ve <strong>Anon API Key</strong> bilgilerini buraya girerek bulut senkronizasyonunu aktif edebilirsiniz:
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono">SUPABASE_URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono">SUPABASE_ANON_KEY</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs rounded-lg border border-slate-700 transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>{configSaved ? 'Ayarlar Kaydedildi!' : 'Supabase Yapılandırmasını Kaydet'}</span>
              </button>
            </div>
          )}

          {/* Tab 3: SQL Migration Script */}
          {activeTab === 'sql' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400">
                Supabase SQL Editor panelinde aşağıdaki SQL sorgusunu çalıştırarak <code>user_scripts</code> tablosunu oluşturabilirsiniz:
              </div>

              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto select-all max-h-48">
{`-- User Scripts Table Creation
CREATE TABLE IF NOT EXISTS public.user_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    robot_id TEXT DEFAULT 'robot-1',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, name)
);

-- RLS Row Level Security
ALTER TABLE public.user_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scripts"
ON public.user_scripts
FOR ALL
USING (auth.uid() = user_id);`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
