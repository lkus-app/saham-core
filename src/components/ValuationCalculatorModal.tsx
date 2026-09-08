import React, { useState } from 'react';
import { Calculator, X, Sparkles, ArrowRight, Check } from 'lucide-react';

interface ValuationCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFairValue?: (fairValue: number) => void;
}

export const ValuationCalculatorModal: React.FC<ValuationCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyFairValue,
}) => {
  const [activeCalc, setActiveCalc] = useState<'graham' | 'peBand' | 'dividend'>('graham');

  // Graham Number inputs
  const [epsGraham, setEpsGraham] = useState<number>(450);
  const [bvpsGraham, setBvpsGraham] = useState<number>(2200);

  // PE Band inputs
  const [epsPe, setEpsPe] = useState<number>(450);
  const [targetPe, setTargetPe] = useState<number>(14);

  // Dividend Model inputs
  const [dps, setDps] = useState<number>(250); // Dividend Per Share
  const [expectedYield, setExpectedYield] = useState<number>(5.0); // 5%

  if (!isOpen) return null;

  // Graham Number: sqrt(22.5 * EPS * BVPS)
  const grahamValue =
    epsGraham > 0 && bvpsGraham > 0 ? Math.round(Math.sqrt(22.5 * epsGraham * bvpsGraham)) : 0;

  // PE Band: EPS * Target PE
  const peValue = epsPe > 0 && targetPe > 0 ? Math.round(epsPe * targetPe) : 0;

  // Dividend Yield: DPS / (Yield / 100)
  const divValue = dps > 0 && expectedYield > 0 ? Math.round(dps / (expectedYield / 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-teal-800/80 bg-teal-950/50 p-2 text-teal-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kalkulator Nilai Wajar (Fair Value)
              </h2>
              <p className="text-xs text-slate-400">
                Hitung harga intrinsik saham menggunakan metode fundamental
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-5 text-xs font-medium">
          <button
            onClick={() => setActiveCalc('graham')}
            className={`py-3 px-3 border-b-2 transition ${
              activeCalc === 'graham'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Graham Number
          </button>
          <button
            onClick={() => setActiveCalc('peBand')}
            className={`py-3 px-3 border-b-2 transition ${
              activeCalc === 'peBand'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            P/E Multiple Band
          </button>
          <button
            onClick={() => setActiveCalc('dividend')}
            className={`py-3 px-3 border-b-2 transition ${
              activeCalc === 'dividend'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Target Yield Dividen
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {activeCalc === 'graham' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Metode klasik Benjamin Graham (Bapak Value Investing). Rumus:{' '}
                <code className="text-emerald-400 font-mono">
                  &radic;(22.5 &times; EPS &times; BVPS)
                </code>
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    EPS (Laba per Saham) - Rp
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={epsGraham}
                    onChange={(e) => setEpsGraham(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    BVPS (Nilai Buku per Saham) - Rp
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bvpsGraham}
                    onChange={(e) => setBvpsGraham(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Result Showcase */}
              <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  Estimasi Nilai Wajar Graham Number
                </span>
                <div className="mt-1 font-mono text-2xl sm:text-3xl font-black text-emerald-400">
                  Rp {grahamValue.toLocaleString('id-ID')}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Batas atas harga wajar konservatif untuk saham defensif
                </p>
              </div>
            </div>
          )}

          {activeCalc === 'peBand' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Menghitung harga wajar berdasarkan target P/E rata-rata historis (5-Year PE Mean). Rumus:{' '}
                <code className="text-emerald-400 font-mono">EPS &times; Target PE</code>
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    EPS (Laba per Saham) - Rp
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={epsPe}
                    onChange={(e) => setEpsPe(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Target / Rata-rata P/E Ratio (x)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={targetPe}
                    onChange={(e) => setTargetPe(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Result Showcase */}
              <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-4 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  Estimasi Nilai Wajar PE Band
                </span>
                <div className="mt-1 font-mono text-2xl sm:text-3xl font-black text-teal-400">
                  Rp {peValue.toLocaleString('id-ID')}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Target harga pada saat valuasi kembali ke rata-rata rasio labanya
                </p>
              </div>
            </div>
          )}

          {activeCalc === 'dividend' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Menghitung harga beli maksimal agar investor mendapatkan yield dividen yang diinginkan. Rumus:{' '}
                <code className="text-emerald-400 font-mono">DPS / (Target Yield / 100)</code>
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    DPS (Dividen per Lembar Saham) - Rp
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dps}
                    onChange={(e) => setDps(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Target Dividend Yield Minimum (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={expectedYield}
                    onChange={(e) => setExpectedYield(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Result Showcase */}
              <div className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  Maksimal Harga Beli untuk Yield {expectedYield}%
                </span>
                <div className="mt-1 font-mono text-2xl sm:text-3xl font-black text-amber-400">
                  Rp {divValue.toLocaleString('id-ID')}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Beli di bawah harga ini untuk mengunci yield dividen di atas {expectedYield}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
