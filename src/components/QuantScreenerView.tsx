import React, { useState } from 'react';
import { QuantStock } from '../types';
import { LiveQuote } from '../services/marketDataService';
import { 
  Activity, 
  Zap, 
  Compass, 
  Shield, 
  Award, 
  Layers, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  Radio
} from 'lucide-react';

interface QuantScreenerViewProps {
  stocks: QuantStock[];
  onSelectStock: (stock: QuantStock) => void;
  selectedStrategy: string;
  onSelectStrategy: (strategy: string) => void;
  ihsgQuote?: LiveQuote;
  onRefreshLiveQuotes?: () => void;
  isRefreshingLive?: boolean;
  lastLiveUpdate?: string;
}

export const QuantScreenerView: React.FC<QuantScreenerViewProps> = ({
  stocks,
  onSelectStock,
  selectedStrategy,
  onSelectStrategy,
  ihsgQuote,
  onRefreshLiveQuotes,
  isRefreshingLive = false,
  lastLiveUpdate,
}) => {
  const [search, setSearch] = useState('');

  const strategies = [
    { id: 'ALL', label: 'ALL (155 EMITEN)', icon: Layers },
    { id: 'SCALPING', label: '⚡ SCALPING (1 JAM)', icon: Zap, color: 'text-amber-400' },
    { id: 'SWING', label: 'SWING (1D)', icon: Compass, color: 'text-sky-400' },
    { id: 'BUY_ON_WEAKNESS', label: 'BUY ON WEAKNESS (1D)', icon: Shield, color: 'text-teal-400' },
    { id: 'GOLDEN_CROSS', label: 'GOLDEN CROSS (1D)', icon: Activity, color: 'text-emerald-400' },
    { id: 'DIVIDEND_PLAY', label: 'DIVIDEND PLAY (1D)', icon: Award, color: 'text-indigo-400' },
  ];

  const ihsgPrice = ihsgQuote?.price ?? 6619.67;
  const ihsgChangePct = ihsgQuote?.changePct ?? -0.25;
  const ihsgIsUp = ihsgChangePct >= 0;
  const ihsgLow = ihsgQuote?.low ?? 6610.93;
  const ihsgHigh = ihsgQuote?.high ?? 6667.75;

  const filtered = stocks.filter((s) => {
    if (selectedStrategy !== 'ALL' && s.strategy !== selectedStrategy && s.strategy !== 'ALL') {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.ticker.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Real-time Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold tracking-wide">
            LIVE MARKET FEED (IDX / YAHOO FINANCE API)
          </span>
          {lastLiveUpdate && (
            <span className="text-slate-400 text-[11px]">
              &bull; Diperbarui: {lastLiveUpdate}
            </span>
          )}
        </div>

        {onRefreshLiveQuotes && (
          <button
            onClick={onRefreshLiveQuotes}
            disabled={isRefreshingLive}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshingLive ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isRefreshingLive ? 'Memuat Harga...' : 'Refresh Harga Real-Time'}</span>
          </button>
        )}
      </div>

      {/* Intraday & Market Flow Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* IHSG Intraday */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${ihsgIsUp ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></span>
              IHSG INTRADAY
            </span>
            <span className={`font-bold flex items-center gap-0.5 ${ihsgIsUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {ihsgIsUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {ihsgPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              ({ihsgIsUp ? '+' : ''}{ihsgChangePct.toFixed(2)}%)
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between py-1 border-t border-slate-800/80 mt-2">
            <span>Rentang Hari Ini:</span>
            <span className="text-slate-200 font-semibold">
              {ihsgLow.toLocaleString('id-ID', { minimumFractionDigits: 2 })} - {ihsgHigh.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-12 flex items-end gap-1 pt-2">
            {[65, 62, 59, 58, 55, 52, 50, 48, 47, 45, 46, 44, 45].map((h, i) => (
              <div
                key={i}
                className={`flex-1 ${ihsgIsUp ? 'bg-emerald-500/30 hover:bg-emerald-400' : 'bg-rose-500/30 hover:bg-rose-400'} transition rounded-t`}
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Top Gainers Liquid */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono shadow-sm">
          <span className="text-xs text-slate-400 block mb-2 font-bold tracking-wider">
            TOP GAINERS (LIQUID)
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-white font-bold">PTBA</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Rp 3.010</span>
                <span className="text-emerald-400 font-bold">+4,51%</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-white font-bold">INDF</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Rp 7.350</span>
                <span className="text-emerald-400 font-bold">+1,73%</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-white font-bold">KLBF</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Rp 785</span>
                <span className="text-emerald-400 font-bold">+1,29%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Foreign Inflow NBSA */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono shadow-sm">
          <span className="text-xs text-slate-400 block mb-2 font-bold tracking-wider">
            TOP FOREIGN INFLOW (NBSA)
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">BBCA</span>
                <span className="text-[11px] text-slate-400">Rp 6.625</span>
              </div>
              <span className="text-emerald-400 font-bold">+Rp 240,5 M</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">BMRI</span>
                <span className="text-[11px] text-slate-400">Rp 4.390</span>
              </div>
              <span className="text-emerald-400 font-bold">+Rp 185,2 M</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">ASII</span>
                <span className="text-[11px] text-slate-400">Rp 4.910</span>
              </div>
              <span className="text-emerald-400 font-bold">+Rp 62,8 M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategies Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          {strategies.map((strat) => {
            const isActive = selectedStrategy === strat.id;
            return (
              <button
                key={strat.id}
                onClick={() => onSelectStrategy(strat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{strat.label}</span>
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Cari ticker quant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none w-full sm:w-48"
        />
      </div>

      {/* Screener Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Ticker</th>
                <th className="p-3.5">Nama Perusahaan</th>
                <th className="p-3.5 text-right">Harga Terakhir</th>
                <th className="p-3.5 text-right">Change %</th>
                <th className="p-3.5 text-right">Value (IDR)</th>
                <th className="p-3.5 text-center">RSI (14)</th>
                <th className="p-3.5">Setup Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    Tidak ada saham yang memenuhi kriteria setup strategi ini.
                  </td>
                </tr>
              ) : (
                filtered.map((stock) => {
                  const isUp = stock.change_pct >= 0;
                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <td className="p-3.5 text-emerald-400 font-bold text-sm">
                        {stock.ticker}
                      </td>
                      <td className="p-3.5 text-slate-300 text-xs truncate max-w-[160px]">
                        {stock.name || '-'}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-white">
                        Rp {stock.close.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`p-3.5 text-right font-bold ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {stock.change_pct.toFixed(2)}%
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-200">
                        Rp {(stock.value_idr / 1e9).toFixed(1)} M
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            stock.rsi_14 > 70
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                              : stock.rsi_14 < 40
                              ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {stock.rsi_14}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                          {stock.ma_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock);
                          }}
                          className="rounded-lg border border-cyan-700/60 bg-cyan-950/40 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900/60 transition"
                        >
                          CHART &amp; MA &nearr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
