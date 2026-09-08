import React from 'react';
import { X, TrendingUp, BarChart2, Activity, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { QuantStock } from '../types';
import { generateTechnicalPoints } from '../data/quantData';

interface TechnicalChartModalProps {
  stock: QuantStock | null;
  onClose: () => void;
}

export const TechnicalChartModal: React.FC<TechnicalChartModalProps> = ({ stock, onClose }) => {
  if (!stock) return null;

  const points = generateTechnicalPoints(stock.close);
  const isUp = stock.change_pct >= 0;

  // Chart dimensions
  const svgWidth = 640;
  const svgHeight = 180;
  const padding = 20;

  // Price scale
  const minPrice = Math.min(...points.prices, ...points.ma200) * 0.98;
  const maxPrice = Math.max(...points.prices, ...points.ma20) * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  const getX = (index: number) => padding + (index / (points.prices.length - 1)) * (svgWidth - 2 * padding);
  const getY = (val: number) => svgHeight - padding - ((val - minPrice) / priceRange) * (svgHeight - 2 * padding);

  const pricePath = points.prices.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p)}`).join(' ');
  const ma20Path = points.ma20.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p)}`).join(' ');
  const ma50Path = points.ma50.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p)}`).join(' ');
  const ma200Path = points.ma200.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p)}`).join(' ');

  // RSI scale (0 to 100)
  const rsiHeight = 70;
  const getRsiY = (val: number) => rsiHeight - 10 - (val / 100) * (rsiHeight - 20);
  const rsiPath = points.rsi.map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getRsiY(r)}`).join(' ');

  // MACD scale
  const macdHeight = 70;
  const maxMacd = Math.max(...points.macd.map(Math.abs), 5);
  const getMacdY = (val: number) => macdHeight / 2 - (val / maxMacd) * (macdHeight / 2 - 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-5 sm:p-6 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-emerald-400">{stock.ticker}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              1D
            </span>
            <span className="text-lg font-mono font-semibold text-white">
              Rp {stock.close.toLocaleString('id-ID')}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-mono px-2 py-0.5 rounded font-bold border ${
                isUp
                  ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                  : 'bg-rose-950/70 text-rose-400 border-rose-800'
              }`}
            >
              {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {isUp ? '+' : ''}
              {stock.change_pct.toFixed(2)}%
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="text-slate-400 block text-[10px] uppercase">Status MA</span>
            <span className="text-emerald-400 font-bold text-xs truncate block">{stock.ma_status}</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="text-slate-400 block text-[10px] uppercase">RSI (14)</span>
            <span
              className={`font-bold text-xs ${
                stock.rsi_14 > 70 ? 'text-amber-400' : stock.rsi_14 < 40 ? 'text-cyan-400' : 'text-slate-200'
              }`}
            >
              {stock.rsi_14} ({stock.rsi_14 > 70 ? 'Overbought' : stock.rsi_14 < 40 ? 'Oversold' : 'Neutral'})
            </span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="text-slate-400 block text-[10px] uppercase">Nilai Transaksi</span>
            <span className="text-slate-200 font-bold text-xs">
              Rp {(stock.value_idr / 1e9).toFixed(1)} Miliar
            </span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="text-slate-400 block text-[10px] uppercase">Rentang Hari Ini</span>
            <span className="text-slate-200 font-bold text-xs">
              Rp {stock.low?.toLocaleString('id-ID')} - {stock.high?.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Price & Moving Averages Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Chart Harga &amp; MA Trend
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Harga
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span> MA20
              </span>
              <span className="flex items-center gap-1 text-sky-400">
                <span className="h-2 w-2 rounded-full bg-sky-400"></span> MA50
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="h-2 w-2 rounded-full bg-purple-400"></span> MA200
              </span>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44">
              {/* Horizontal Grid lines */}
              <line x1={0} y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={0} y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={0} y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="#1e293b" strokeDasharray="3 3" />

              {/* Moving Averages */}
              <path d={ma200Path} fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="2 2" />
              <path d={ma50Path} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <path d={ma20Path} fill="none" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Main Price Line */}
              <path d={pricePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* RSI (14) Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Activity className="h-3.5 w-3.5 text-amber-400" />
              RSI (14) Oscillator
            </span>
            <span className="text-[11px] text-amber-400 font-mono">RSI: {stock.rsi_14}</span>
          </div>
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${rsiHeight}`} className="w-full h-16">
              {/* Bands: 70 Overbought & 30 Oversold */}
              <line x1={0} y1={getRsiY(70)} x2={svgWidth} y2={getRsiY(70)} stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <line x1={0} y1={getRsiY(30)} x2={svgWidth} y2={getRsiY(30)} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <path d={rsiPath} fill="none" stroke="#f59e0b" strokeWidth="1.8" />
            </svg>
          </div>
        </div>

        {/* MACD Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <BarChart2 className="h-3.5 w-3.5 text-sky-400" />
              MACD &amp; Histogram
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-sky-400">MACD Line</span>
              <span className="text-rose-400">Signal Line</span>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${macdHeight}`} className="w-full h-16">
              {/* Zero line */}
              <line x1={0} y1={macdHeight / 2} x2={svgWidth} y2={macdHeight / 2} stroke="#334155" strokeWidth="1" />

              {/* Histogram bars */}
              {points.hist.map((h, i) => {
                const barX = getX(i) - 2;
                const zeroY = macdHeight / 2;
                const barY = getMacdY(h);
                const height = Math.abs(barY - zeroY);
                return (
                  <rect
                    key={i}
                    x={barX}
                    y={h >= 0 ? barY : zeroY}
                    width={4}
                    height={Math.max(height, 1)}
                    fill={h >= 0 ? '#10b981' : '#f43f5e'}
                    opacity={0.7}
                  />
                );
              })}

              {/* MACD Line & Signal */}
              <path
                d={points.macd.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getMacdY(m)}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <path
                d={points.signal.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getMacdY(s)}`).join(' ')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Setup teknikal otomatis dari Google Apps Script Quant Model</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
