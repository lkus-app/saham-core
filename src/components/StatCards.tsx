import React from 'react';
import { CoreStock } from '../types';
import { 
  Percent, 
  Coins, 
  Layers, 
  Target, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface StatCardsProps {
  stocks: CoreStock[];
  onSelectStock: (stock: CoreStock) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ stocks, onSelectStock }) => {
  const totalStocks = stocks.length;
  const undervaluedStocks = stocks.filter((s) => s.valuationStatus === 'Undervalued');
  const undervaluedCount = undervaluedStocks.length;
  const undervaluedPct = totalStocks > 0 ? ((undervaluedCount / totalStocks) * 100).toFixed(0) : '0';

  const avgMos = totalStocks > 0 
    ? (stocks.reduce((acc, s) => acc + s.marginOfSafety, 0) / totalStocks).toFixed(1)
    : '0';

  const avgDivYield = totalStocks > 0
    ? (stocks.reduce((acc, s) => acc + s.dividendYield, 0) / totalStocks).toFixed(1)
    : '0';

  // Find top pick by highest MOS among undervalued or all
  const topPick = [...stocks].sort((a, b) => b.marginOfSafety - a.marginOfSafety)[0];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {/* Total Saham */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Database Core</span>
          <Layers className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{totalStocks}</span>
          <span className="text-xs text-slate-400">Emiten Terdaftar</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span>Blue chip & Core Conviction</span>
        </div>
      </div>

      {/* Undervalued / Diskon */}
      <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 transition hover:border-emerald-800">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-xs font-medium">Saham Undervalued</span>
          <Target className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">{undervaluedCount}</span>
          <span className="text-xs font-medium text-emerald-300">({undervaluedPct}% emiten)</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-400/80">
          Di bawah fair value / Buy Zone
        </div>
      </div>

      {/* Rata-rata MOS */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Rata-rata MOS</span>
          <Percent className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${Number(avgMos) >= 15 ? 'text-emerald-400' : 'text-cyan-300'}`}>
            {avgMos}%
          </span>
          <span className="text-xs text-slate-400">Margin of Safety</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Proteksi harga terhadap risiko
        </div>
      </div>

      {/* Rata-rata Dividend Yield */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Avg Dividend Yield</span>
          <Coins className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{avgDivYield}%</span>
          <span className="text-xs text-slate-400">P.A.</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Passive income kas dividen
        </div>
      </div>

      {/* Top Discount Pick */}
      {topPick ? (
        <div 
          onClick={() => onSelectStock(topPick)}
          className="col-span-2 sm:col-span-1 rounded-xl border border-teal-800/60 bg-gradient-to-br from-teal-950/40 to-slate-900/80 p-4 cursor-pointer transition hover:border-teal-600 hover:shadow-lg hover:shadow-teal-950/30"
        >
          <div className="flex items-center justify-between text-teal-400">
            <span className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              Diskon Tertinggi
            </span>
            <ArrowUpRight className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{topPick.ticker}</span>
            <span className="text-sm font-bold text-emerald-400">+{topPick.marginOfSafety}% MOS</span>
          </div>
          <div className="mt-2 truncate text-[11px] text-slate-300">
            Rp {topPick.currentPrice.toLocaleString('id-ID')} &rarr; FV Rp {topPick.fairValue.toLocaleString('id-ID')}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Belum ada data</span>
        </div>
      )}
    </div>
  );
};
