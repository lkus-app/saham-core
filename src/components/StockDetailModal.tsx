import React, { useState } from 'react';
import { CoreStock } from '../types';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Target, 
  ShieldAlert, 
  Edit3, 
  CheckCircle2, 
  Layers, 
  Building, 
  Calculator,
  Calendar,
  Sparkles
} from 'lucide-react';

interface StockDetailModalProps {
  stock: CoreStock | null;
  onClose: () => void;
  onEdit: (stock: CoreStock) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onEdit,
}) => {
  const [lots, setLots] = useState<number>(100); // default 100 lots = 10,000 lembar

  if (!stock) return null;

  const isPositiveMos = stock.marginOfSafety > 0;
  const isGoodMos = stock.marginOfSafety >= 15;
  const inBuyZone =
    stock.currentPrice >= stock.buyAreaLow && stock.currentPrice <= stock.buyAreaHigh;

  // Dividend simulation
  const shares = lots * 100;
  const totalInvestment = shares * stock.currentPrice;
  const estimatedAnnualDividend = totalInvestment * (stock.dividendYield / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 font-mono text-xl font-black text-emerald-400 border border-slate-700">
              {stock.ticker}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {stock.name}
                </h2>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                  {stock.conviction}
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    stock.valuationStatus === 'Undervalued'
                      ? 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
                      : stock.valuationStatus === 'Overvalued'
                      ? 'border-rose-800 bg-rose-950/60 text-rose-300'
                      : 'border-cyan-800 bg-cyan-950/60 text-cyan-300'
                  }`}
                >
                  {stock.valuationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {stock.sector} &bull; Market Cap: Rp {stock.marketCapTrillion.toLocaleString('id-ID')} T
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Price & Fair Value Showcase */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Current Price */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Harga Terakhir
              </span>
              <div className="mt-1 font-mono text-2xl font-bold text-white">
                Rp {stock.currentPrice.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {inBuyZone ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Berada di Buy Area
                  </span>
                ) : stock.currentPrice > stock.buyAreaHigh ? (
                  <span className="text-slate-400">Di atas buy area</span>
                ) : (
                  <span className="text-teal-400">Di bawah batas bawah buy area</span>
                )}
              </div>
            </div>

            {/* Fair Value */}
            <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-4">
              <span className="text-[11px] uppercase tracking-wider text-teal-400">
                Nilai Wajar (Fair Value)
              </span>
              <div className="mt-1 font-mono text-2xl font-bold text-teal-300">
                Rp {stock.fairValue.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-xs text-slate-400 font-mono">
                Target TP: Rp {stock.targetPrice.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Margin of Safety */}
            <div
              className={`rounded-xl border p-4 ${
                isGoodMos
                  ? 'border-emerald-800/80 bg-emerald-950/30 text-emerald-300'
                  : isPositiveMos
                  ? 'border-teal-800/80 bg-teal-950/30 text-teal-300'
                  : 'border-rose-800/80 bg-rose-950/30 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider">Margin of Safety</span>
                {isPositiveMos ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="mt-1 font-mono text-2xl font-black">
                {isPositiveMos ? `+${stock.marginOfSafety}%` : `${stock.marginOfSafety}%`}
              </div>
              <div className="mt-1 text-xs opacity-80">
                {isGoodMos
                  ? 'Diskon sangat lebar (Safety margin tinggi)'
                  : isPositiveMos
                  ? 'Diskon wajar terhadap nilai intrinsik'
                  : 'Harga di atas nilai wajar (Premium)'}
              </div>
            </div>
          </div>

          {/* Buy & Sell Ranges */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-emerald-400" />
              Rencana Eksekusi Trading & Investasi
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans uppercase">Area Beli (Low)</span>
                <span className="text-white text-sm font-bold">
                  Rp {stock.buyAreaLow.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans uppercase">Area Beli (High)</span>
                <span className="text-white text-sm font-bold">
                  Rp {stock.buyAreaHigh.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans uppercase">Target Profit (TP)</span>
                <span className="text-teal-400 text-sm font-bold">
                  Rp {stock.targetPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans uppercase">Stop Loss (Proteksi)</span>
                <span className="text-rose-400 text-sm font-bold">
                  {stock.stopLoss ? `Rp ${stock.stopLoss.toLocaleString('id-ID')}` : 'Hold / DCA'}
                </span>
              </div>
            </div>
          </div>

          {/* Fundamental Ratios Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Rasio Finansial & Profitabilitas Utama
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-xs text-slate-400">Price to Earnings (PER)</div>
                <div className="mt-1 font-mono text-xl font-bold text-white">
                  {stock.peRatio}x
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stock.peRatio <= 10 ? 'Undervalued' : stock.peRatio <= 18 ? 'Wajar' : 'Growth premium'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-xs text-slate-400">Price to Book (PBV)</div>
                <div className="mt-1 font-mono text-xl font-bold text-white">
                  {stock.pbvRatio}x
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stock.pbvRatio <= 1.2 ? 'Diskon aset buku' : 'Rasio pasar normal'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-xs text-slate-400">Return on Equity (ROE)</div>
                <div
                  className={`mt-1 font-mono text-xl font-bold ${
                    stock.roe >= 18 ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {stock.roe}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stock.roe >= 18 ? 'Profitabilitas sangat tinggi' : 'Tingkat pengembalian modal'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-xs text-slate-400">Dividend Yield</div>
                <div
                  className={`mt-1 font-mono text-xl font-bold ${
                    stock.dividendYield >= 5 ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  {stock.dividendYield}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stock.dividendYield >= 6 ? 'Dividen sangat tinggi' : 'Dividen stabil'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dividend Calculator */}
          <div className="rounded-2xl border border-amber-900/40 bg-amber-950/15 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                Simulasi Dividen Kas Tahunan
              </h4>
              <span className="text-xs text-slate-400">Yield: {stock.dividendYield}%</span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Jumlah Kepemilikan (Lot):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={lots}
                    onChange={(e) => setLots(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    ({(lots * 100).toLocaleString('id-ID')} lbr)
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-slate-400 font-mono">
                  Modal Beli: Rp {Math.round(totalInvestment).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="rounded-xl border border-amber-800/40 bg-slate-950/70 p-3.5 text-right">
                <span className="text-[11px] text-slate-400 block uppercase">
                  Estimasi Dividen Kas / Tahun
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400">
                  Rp {Math.round(estimatedAnnualDividend).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  &plusmn; Rp {Math.round(estimatedAnnualDividend / 12).toLocaleString('id-ID')} / bulan
                </span>
              </div>
            </div>
          </div>

          {/* Thesis, Catalysts & Notes */}
          <div className="space-y-3">
            {stock.catalysts && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Katalis Positif & Pertumbuhan Bisnis
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {stock.catalysts}
                </p>
              </div>
            )}

            {stock.notes && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Catatan Strategis & Manajemen Risiko
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {stock.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Terakhir diperbarui: {stock.lastUpdated}
            </span>
            <span>Rekomendasi: <strong>{stock.recommendation}</strong></span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 p-4 sm:p-5">
          <button
            onClick={() => {
              onClose();
              onEdit(stock);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Saham</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
