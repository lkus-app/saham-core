import React from 'react';
import { 
  TrendingUp, 
  Plus, 
  RefreshCw, 
  FileSpreadsheet, 
  Rocket, 
  Calculator, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { GoogleScriptConfig, AppSection } from '../types';

interface NavbarProps {
  config: GoogleScriptConfig;
  activeSection: AppSection;
  onChangeSection: (section: AppSection) => void;
  onOpenGoogleScriptModal: () => void;
  onOpenDeployModal: () => void;
  onOpenCalculatorModal: () => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onSyncGoogleScript: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  activeSection,
  onChangeSection,
  onOpenGoogleScriptModal,
  onOpenDeployModal,
  onOpenCalculatorModal,
  onOpenAddModal,
  onExportCSV,
  onExportJSON,
  onSyncGoogleScript,
  isSyncing,
}) => {
  const isConnected = Boolean(config.webAppUrl && config.webAppUrl.trim());

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20">
              <span className="font-mono font-black text-slate-950 text-xl">Q</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
                  IDX <span className="text-emerald-400">QUANT ANALYST</span>
                </h1>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-slate-700">
                  SAHAM CORE VIP
                </span>
              </div>
              <p className="hidden text-xs text-slate-400 sm:block font-mono">
                Google Apps Script Integration Active
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => onChangeSection('screener')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeSection === 'screener'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⊞</span> SCREENER SAHAM
            </button>
            <button
              onClick={() => onChangeSection('stockpicks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeSection === 'stockpicks'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>★</span> STOCKPICK VIP
            </button>
            <button
              onClick={() => onChangeSection('fundamental')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeSection === 'fundamental'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💎</span> VALUASI &amp; MOS
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Google Script Connection Badge / Trigger */}
            <button
              onClick={onOpenGoogleScriptModal}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-mono font-medium transition ${
                isConnected
                  ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'border-amber-800/80 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
              }`}
              title="Google Apps Script Endpoint"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Google Script</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            </button>

            {/* Sync Button */}
            {isConnected && (
              <button
                onClick={onSyncGoogleScript}
                disabled={isSyncing}
                title="Tarik data terbaru dari Google Apps Script"
                className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition disabled:opacity-50 font-mono"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden lg:inline">Sync</span>
              </button>
            )}

            {/* Calculator Button */}
            <button
              onClick={onOpenCalculatorModal}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-800 transition"
              title="Kalkulator Nilai Wajar Graham Number"
            >
              <Calculator className="h-3.5 w-3.5 text-teal-400" />
              <span>Valuasi</span>
            </button>

            {/* Deploy Guide Button */}
            <button
              onClick={onOpenDeployModal}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-700/80 bg-indigo-950/50 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-semibold text-indigo-300 hover:bg-indigo-900/60 transition"
              title="Panduan Deploy ke GitHub & Vercel"
            >
              <Rocket className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Deploy Vercel</span>
            </button>

            {/* Add Stock button (for Fundamental mode) */}
            {activeSection === 'fundamental' && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition font-mono"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Tambah Saham</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-800/80 py-2 font-mono text-xs">
          <button
            onClick={() => onChangeSection('screener')}
            className={`px-2 py-1 rounded ${
              activeSection === 'screener' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            ⊞ SCREENER
          </button>
          <button
            onClick={() => onChangeSection('stockpicks')}
            className={`px-2 py-1 rounded ${
              activeSection === 'stockpicks' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            ★ STOCKPICK
          </button>
          <button
            onClick={() => onChangeSection('fundamental')}
            className={`px-2 py-1 rounded ${
              activeSection === 'fundamental' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            💎 VALUASI
          </button>
        </div>
      </div>
    </header>
  );
};
