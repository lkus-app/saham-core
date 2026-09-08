import React from 'react';
import { CoreStock } from '../types';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface StockTableProps {
  stocks: CoreStock[];
  onSelectStock: (stock: CoreStock) => void;
  onEditStock: (stock: CoreStock) => void;
  onDeleteStock: (stockId: string) => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  onSelectStock,
  onEditStock,
  onDeleteStock,
}) => {
  if (stocks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">Tidak ada saham yang cocok dengan filter pencarian.</p>
      </div>
    );
  }

  const getRecommendationBadge = (rec: CoreStock['recommendation']) => {
    switch (rec) {
      case 'Strong Buy':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Buy on Weakness':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'Hold / Monitor':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Take Profit / Overpriced':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getValuationBadge = (status: CoreStock['valuationStatus']) => {
    switch (status) {
      case 'Undervalued':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50';
      case 'Fair Value':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50';
      case 'Overvalued':
        return 'bg-rose-950/60 text-rose-300 border-rose-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3.5 pl-4 pr-3 sm:pl-6">Emiten / Saham</th>
              <th className="py-3.5 px-3">Harga Terakhir</th>
              <th className="py-3.5 px-3">Nilai Wajar</th>
              <th className="py-3.5 px-3 min-w-[130px]">Margin of Safety</th>
              <th className="py-3.5 px-3 hidden lg:table-cell">Area Beli (Buy Zone)</th>
              <th className="py-3.5 px-3 hidden md:table-cell">Valuasi (PER / PBV)</th>
              <th className="py-3.5 px-3">Kualitas & Dividen</th>
              <th className="py-3.5 px-3">Rekomendasi</th>
              <th className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {stocks.map((stock) => {
              const isPositiveMos = stock.marginOfSafety > 0;
              const isGoodMos = stock.marginOfSafety >= 15;
              const isNearBuyArea =
                stock.currentPrice >= stock.buyAreaLow && stock.currentPrice <= stock.buyAreaHigh;

              return (
                <tr
                  key={stock.id}
                  className="group transition-colors hover:bg-slate-800/40"
                >
                  {/* Ticker & Name */}
                  <td className="py-3.5 pl-4 pr-3 sm:pl-6">
                    <div className="flex items-center gap-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="font-mono text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition"
                          >
                            {stock.ticker}
                          </button>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-medium border ${getValuationBadge(
                              stock.valuationStatus
                            )}`}
                          >
                            {stock.valuationStatus === 'Undervalued' ? 'Diskon' : stock.valuationStatus}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[170px] sm:max-w-[210px]">
                          {stock.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{stock.sector}</div>
                      </div>
                    </div>
                  </td>

                  {/* Current Price */}
                  <td className="py-3.5 px-3 font-mono font-medium text-white">
                    Rp {stock.currentPrice.toLocaleString('id-ID')}
                    {isNearBuyArea && (
                      <span className="ml-1.5 inline-flex items-center rounded bg-emerald-500/10 px-1 py-0.5 text-[10px] font-sans font-medium text-emerald-400">
                        In Zone
                      </span>
                    )}
                  </td>

                  {/* Fair Value */}
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    Rp {stock.fairValue.toLocaleString('id-ID')}
                    <div className="text-[10px] text-slate-500">
                      TP: Rp {stock.targetPrice.toLocaleString('id-ID')}
                    </div>
                  </td>

                  {/* Margin of Safety */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {isPositiveMos ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      )}
                      <span
                        className={`font-mono text-sm font-bold ${
                          isGoodMos
                            ? 'text-emerald-400'
                            : isPositiveMos
                            ? 'text-teal-300'
                            : 'text-rose-400'
                        }`}
                      >
                        {isPositiveMos ? `+${stock.marginOfSafety}%` : `${stock.marginOfSafety}%`}
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isGoodMos
                            ? 'bg-emerald-500'
                            : isPositiveMos
                            ? 'bg-teal-500'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.min(Math.max(stock.marginOfSafety * 2, 5), 100)}%`,
                        }}
                      />
                    </div>
                  </td>

                  {/* Buy Zone */}
                  <td className="py-3.5 px-3 hidden lg:table-cell">
                    <div className="font-mono text-xs text-slate-300">
                      {stock.buyAreaLow.toLocaleString('id-ID')} -{' '}
                      {stock.buyAreaHigh.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      SL: {stock.stopLoss ? `Rp ${stock.stopLoss.toLocaleString('id-ID')}` : '-'}
                    </div>
                  </td>

                  {/* Valuation metrics */}
                  <td className="py-3.5 px-3 hidden md:table-cell">
                    <div className="font-mono text-xs">
                      <span className="text-slate-400">PE: </span>
                      <span className="font-semibold text-slate-200">{stock.peRatio}x</span>
                    </div>
                    <div className="font-mono text-xs">
                      <span className="text-slate-400">PBV: </span>
                      <span className="text-slate-300">{stock.pbvRatio}x</span>
                    </div>
                  </td>

                  {/* Quality & Div */}
                  <td className="py-3.5 px-3">
                    <div className="font-mono text-xs">
                      <span className="text-slate-400">ROE: </span>
                      <span
                        className={`font-semibold ${
                          stock.roe >= 18 ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {stock.roe}%
                      </span>
                    </div>
                    <div className="font-mono text-xs">
                      <span className="text-slate-400">Div: </span>
                      <span
                        className={`font-semibold ${
                          stock.dividendYield >= 5 ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {stock.dividendYield}%
                      </span>
                    </div>
                  </td>

                  {/* Recommendation */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getRecommendationBadge(
                        stock.recommendation
                      )}`}
                    >
                      {stock.recommendation}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectStock(stock)}
                        title="Lihat Detail & Analisis"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditStock(stock)}
                        title="Edit Data Saham"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStock(stock.id)}
                        title="Hapus dari Database"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
