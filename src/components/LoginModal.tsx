import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  Sparkles,
  Server
} from 'lucide-react';
import { saveUserSession, clearUserSession } from '../services/googleScriptService';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  webAppUrl: string;
}

const DEFAULT_API_URL = "https://lapin-idx-proxy.lkusdewanto.workers.dev";

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  webAppUrl,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Silakan masukkan email dan password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const baseUrl = (webAppUrl && webAppUrl.trim() !== '') ? webAppUrl.trim() : DEFAULT_API_URL;
      const targetUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}action=login&email=${encodeURIComponent(cleanEmail)}&password=${encodeURIComponent(cleanPass)}`;

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const res = await response.json();
      console.log('HASIL RESPONSE SERVER:', res);

      // =========================================================================
      // STRICT FILTER:
      // 1. authenticated WAJIB true
      // 2. WAJIB punya objek user
      // 3. TIDAK BOLEH berupa array saham screener
      // =========================================================================
      const isRealUser = 
        res &&
        res.authenticated === true &&
        res.user &&
        typeof res.user.email === 'string' &&
        !Array.isArray(res.data);

      if (isRealUser) {
        const profile: UserProfile = {
          email: res.user.email,
          name: res.user.name || cleanEmail.split('@')[0],
          role: res.user.role || 'VIP Member',
          isVip: true,
          loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          token: res.user.token || 'TOKEN_ACTIVE',
        };

        saveUserSession(profile);
        onLoginSuccess(profile);
        setSuccessMessage('Login berhasil! Selamat datang di Terminal Saham Core VIP.');

        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        // MUTLAK TOLAK LOGIN ASAL / SALAH
        setErrorMessage(res?.message || 'Email atau password salah. Akses ditolak!');
      }
    } catch (err: any) {
      setErrorMessage('Koneksi gagal: ' + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = () => {
    clearUserSession();
    onLogout();
    setSuccessMessage('Anda telah keluar dari akun.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl font-mono text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {currentUser ? 'Profil Akber Member' : 'Login Akun & Member VIP'}
              </h2>
              <p className="text-[11px] text-slate-400">Google Apps Script Auth API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="block font-bold">Autentikasi Gagal:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content: Logged in State */}
        {currentUser ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Status Akun:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="h-3 w-3" /> VIP ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                <span className="text-slate-400">Role:</span>
                <span className="text-slate-300">{currentUser.role || 'Member'}</span>
              </div>
              {currentUser.loginTime && (
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                  <span className="text-slate-400">Login Terakhir:</span>
                  <span className="text-slate-400">{currentUser.loginTime}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Sesi Anda aktif dan tersimpan. Akses penuh fitur VIP telah terbuka.</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/30 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar (Logout)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Content: Login Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <Server className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span>Login diverifikasi langsung ke sheet <code className="text-emerald-300 font-bold">Users</code> Google Spreadsheet.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Akun:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                Password:
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                {isLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Masuk Akun</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
