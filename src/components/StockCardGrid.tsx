import React from 'react';
import { CoreStock } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Coins, 
  Layers, 
  Eye, 
  Edit3,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface StockCardGridProps {
  stocks: CoreStock[];
  onSelectStock: (stock: CoreStock) => void;
  onEditStock: (stock: CoreStock) => void;
}

export const StockCardGrid: React.FC<StockCardGridProps> = ({
  stocks,
  onSelectStock,
  onEditStock,
}) => {
  if (stocks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">Tidak ada saham yang cocok dengan filter pencarian.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stocks.map((stock) => {
        const isGoodMos = stock.marginOfSafety >= 15;
        const isPositiveMos = stock.marginOfSafety > 0;
        const inBuyZone =
          stock.currentPrice >= stock.buyAreaLow && stock.currentPrice <= stock.buyAreaHigh;

        // Calculate progress percentage of current price towards fair value
        const minVal = Math.min(stock.currentPrice, stock.buyAreaLow) * 0.9;
        const maxVal = Math.max(stock.fairValue, stock.targetPrice) * 1.05;
        const currentPct = Math.min(Math.max(((stock.currentPrice - minVal) / (maxVal - minVal)) * 100, 5), 95);
        const fairPct = Math.min(Math.max(((stock.fairValue - minVal) / (maxVal - minVal)) * 100, 5), 95);

        return (
          <div
            key={stock.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl hover:shadow-slate-950/50"
          >
            {/* Top Bar: Ticker + Conviction + MOS */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectStock(stock)}
                      className="font-mono text-xl font-extrabold text-white group-hover:text-emerald-400 transition"
                    >
                      {stock.ticker}
                    </button>
                    <span className="rounded-md border border-slate-700 bg-slate-800/90 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                      {stock.conviction.split(' ')[0]}
                    </span>
                    {inBuyZone && (
                      <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                        In Buy Zone
                      </span>
                    )}
                  </div>
                  <h3 className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                    {stock.name}
                  </h3>
                  <p className="text-[10px] text-slate-500">{stock.sector}</p>
                </div>

                {/* MOS Badge */}
                <div
                  className={`flex flex-col items-end rounded-xl border px-2.5 py-1 text-right ${
                    isGoodMos
                      ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300'
                      : isPositiveMos
                      ? 'border-teal-800/80 bg-teal-950/40 text-teal-300'
                      : 'border-rose-800/80 bg-rose-950/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isPositiveMos ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-rose-400" />
                    )}
                    <span className="font-mono text-sm font-bold">
                      {isPositiveMos ? `+${stock.marginOfSafety}%` : `${stock.marginOfSafety}%`}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">
                    Margin of Safety
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      Harga Saat Ini
                    </span>
                    <div className="font-mono text-base font-bold text-white">
                      Rp {stock.currentPrice.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      Nilai Wajar (Fair Value)
                    </span>
                    <div className="font-mono text-base font-bold text-teal-400">
                      Rp {stock.fairValue.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="relative mt-3 pt-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        isGoodMos ? 'bg-emerald-500' : isPositiveMos ? 'bg-teal-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${currentPct}%` }}
                    />
                  </div>
                  {/* Marker for Fair Value */}
                  <div
                    className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                    style={{ left: `${fairPct}%` }}
                    title={`Fair Value: Rp ${stock.fairValue.toLocaleString('id-ID')}`}
                  >
                    <div className="h-4 w-1 rounded-full bg-teal-400 shadow-sm shadow-teal-400"></div>
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Buy: {stock.buyAreaLow.toLocaleString('id-ID')}</span>
                    <span>TP: {stock.targetPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Key Fundamental Metrics */}
              <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                <div className="rounded-lg border border-slate-800 bg-slate-950/40 py-1 px-1">
                  <div className="text-[9px] text-slate-400">PER</div>
                  <div className="font-mono text-xs font-semibold text-slate-200">
                    {stock.peRatio}x
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/40 py-1 px-1">
                  <div className="text-[9px] text-slate-400">PBV</div>
                  <div className="font-mono text-xs font-semibold text-slate-200">
                    {stock.pbvRatio}x
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/40 py-1 px-1">
                  <div className="text-[9px] text-slate-400">ROE</div>
                  <div
                    className={`font-mono text-xs font-semibold ${
                      stock.roe >= 18 ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {stock.roe}%
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/40 py-1 px-1">
                  <div className="text-[9px] text-slate-400">Yield Div</div>
                  <div
                    className={`font-mono text-xs font-semibold ${
                      stock.dividendYield >= 5 ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    {stock.dividendYield}%
                  </div>
                </div>
              </div>

              {/* Notes / Catalysts Preview */}
              {(stock.catalysts || stock.notes) && (
                <div className="mt-3 rounded-lg bg-slate-950/40 p-2 text-[11px] text-slate-400 line-clamp-2">
                  <span className="font-semibold text-slate-300">Thesis: </span>
                  {stock.catalysts || stock.notes}
                </div>
              )}
            </div>

            {/* Card Footer: Recommendation & Buttons */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span className="rounded-md border border-slate-700/80 bg-slate-800/60 px-2 py-0.5 text-xs font-semibold text-slate-200">
                {stock.recommendation}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditStock(stock)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition"
                  title="Edit Saham"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onSelectStock(stock)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-emerald-600 hover:text-white transition"
                >
                  <span>Detail</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
