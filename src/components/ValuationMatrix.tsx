import React from 'react';
import { CoreStock } from '../types';
import { Sparkles, Star, Target, ArrowUpRight } from 'lucide-react';

interface ValuationMatrixProps {
  stocks: CoreStock[];
  onSelectStock: (stock: CoreStock) => void;
}

export const ValuationMatrix: React.FC<ValuationMatrixProps> = ({
  stocks,
  onSelectStock,
}) => {
  // Quadrant 1: High ROE (>= 16%), High MOS (>= 15%) -> "Bargain Champions"
  const bargainChampions = stocks.filter((s) => s.roe >= 16 && s.marginOfSafety >= 15);

  // Quadrant 2: High ROE (>= 16%), Lower MOS (< 15%) -> "Quality Compounders (Fair Value)"
  const qualityCompounders = stocks.filter((s) => s.roe >= 16 && s.marginOfSafety < 15);

  // Quadrant 3: Lower ROE (< 16%), High MOS (>= 15%) -> "Deep Value Plays"
  const deepValue = stocks.filter((s) => s.roe < 16 && s.marginOfSafety >= 15);

  // Quadrant 4: Lower ROE (< 16%), Lower MOS (< 15%) -> "Watchlist / Hold"
  const watchlist = stocks.filter((s) => s.roe < 16 && s.marginOfSafety < 15);

  const renderStockPill = (s: CoreStock, colorTheme: string) => (
    <button
      key={s.id}
      onClick={() => onSelectStock(s)}
      className={`group flex items-center justify-between rounded-xl border p-2.5 text-left transition hover:scale-[1.02] ${colorTheme}`}
    >
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-bold text-white group-hover:text-emerald-300">
            {s.ticker}
          </span>
          <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{s.name}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-300">
          <span>Rp {s.currentPrice.toLocaleString('id-ID')}</span>
          <span>&bull;</span>
          <span className="text-amber-300">Div {s.dividendYield}%</span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-xs font-bold text-emerald-400">+{s.marginOfSafety}% MOS</div>
        <div className="text-[10px] text-slate-400 font-mono">ROE {s.roe}%</div>
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Header Explainer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          Matriks Valuasi: Kualitas Bisnis (ROE) vs Margin of Safety (Diskon)
        </h3>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
          Strategi investasi cerdas berfokus pada kuadran{' '}
          <strong className="text-emerald-400 font-semibold">Bargain Champions</strong> (ROE tinggi &ge; 16% dan diskon Margin of Safety &ge; 15%) untuk memaksimalkan potensi return dengan risiko minimum.
        </p>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Kuadran 1: Bargain Champions (Top Pick Area) */}
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900 p-5 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">
                  1. Bargain Champions (Sweet Spot)
                </h4>
                <p className="text-[11px] text-emerald-400/80">
                  ROE Tinggi (&ge;16%) + Diskon Lebar (MOS &ge;15%)
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
              {bargainChampions.length} Saham
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {bargainChampions.map((s) =>
              renderStockPill(
                s,
                'border-emerald-800/80 bg-emerald-950/30 hover:border-emerald-500 hover:bg-emerald-900/40'
              )
            )}
          </div>
          {bargainChampions.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-500">Tidak ada saham di kuadran ini.</p>
          )}
        </div>

        {/* Kuadran 2: Quality Compounders (High ROE, Fair/Lower MOS) */}
        <div className="rounded-2xl border border-cyan-800/50 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-400">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-cyan-300">
                  2. Quality Compounders
                </h4>
                <p className="text-[11px] text-slate-400">
                  ROE Tinggi (&ge;16%), Valuasi Wajar / MOS &lt;15%
                </p>
              </div>
            </div>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-300">
              {qualityCompounders.length} Saham
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {qualityCompounders.map((s) =>
              renderStockPill(
                s,
                'border-cyan-900/60 bg-cyan-950/20 hover:border-cyan-600 hover:bg-cyan-900/30'
              )
            )}
          </div>
          {qualityCompounders.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-500">Tidak ada saham di kuadran ini.</p>
          )}
        </div>

        {/* Kuadran 3: Deep Value Plays (Lower ROE, High MOS) */}
        <div className="rounded-2xl border border-amber-800/50 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-400">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  3. Deep Value & Cyclical
                </h4>
                <p className="text-[11px] text-slate-400">
                  ROE Moderat (&lt;16%), Diskon Margin of Safety Lebar (&ge;15%)
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
              {deepValue.length} Saham
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {deepValue.map((s) =>
              renderStockPill(
                s,
                'border-amber-900/60 bg-amber-950/20 hover:border-amber-600 hover:bg-amber-900/30'
              )
            )}
          </div>
          {deepValue.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-500">Tidak ada saham di kuadran ini.</p>
          )}
        </div>

        {/* Kuadran 4: Watchlist & Neutral */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-800 p-1.5 text-slate-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">
                  4. Watchlist & Wait for Dip
                </h4>
                <p className="text-[11px] text-slate-400">
                  ROE Moderat (&lt;16%) dan Diskon Terbatas (&lt;15%)
                </p>
              </div>
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-400">
              {watchlist.length} Saham
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {watchlist.map((s) =>
              renderStockPill(
                s,
                'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
              )
            )}
          </div>
          {watchlist.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-500">Tidak ada saham di kuadran ini.</p>
          )}
        </div>
      </div>
    </div>
  );
};
