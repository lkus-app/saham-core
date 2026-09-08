import React from 'react';
import { CoreStock } from '../types';
import { 
  Building2, 
  ShoppingBag, 
  Zap, 
  Radio, 
  HeartPulse, 
  Factory, 
  Cpu, 
  Flame, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface SectorViewProps {
  stocks: CoreStock[];
  onSelectStock: (stock: CoreStock) => void;
}

export const SectorView: React.FC<SectorViewProps> = ({ stocks, onSelectStock }) => {
  // Group stocks by sector
  const sectorGroups: Record<string, CoreStock[]> = {};
  stocks.forEach((stock) => {
    if (!sectorGroups[stock.sector]) {
      sectorGroups[stock.sector] = [];
    }
    sectorGroups[stock.sector].push(stock);
  });

  const getSectorIcon = (sectorName: string) => {
    if (sectorName.includes('Financials') || sectorName.includes('Perbankan')) {
      return <Building2 className="h-5 w-5 text-emerald-400" />;
    }
    if (sectorName.includes('Consumer')) {
      return <ShoppingBag className="h-5 w-5 text-cyan-400" />;
    }
    if (sectorName.includes('Energy') || sectorName.includes('Energi')) {
      return <Flame className="h-5 w-5 text-amber-400" />;
    }
    if (sectorName.includes('Infrastructure') || sectorName.includes('Telco')) {
      return <Radio className="h-5 w-5 text-teal-400" />;
    }
    if (sectorName.includes('Healthcare') || sectorName.includes('Kesehatan')) {
      return <HeartPulse className="h-5 w-5 text-rose-400" />;
    }
    if (sectorName.includes('Technology')) {
      return <Cpu className="h-5 w-5 text-violet-400" />;
    }
    return <Factory className="h-5 w-5 text-slate-400" />;
  };

  const sectors = Object.keys(sectorGroups);

  if (sectors.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400">
        Tidak ada data sektor yang sesuai filter.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sectors.map((secName) => {
        const items = sectorGroups[secName];
        const avgMos = (items.reduce((sum, s) => sum + s.marginOfSafety, 0) / items.length).toFixed(1);
        const undervaluedCount = items.filter((s) => s.valuationStatus === 'Undervalued').length;

        return (
          <div
            key={secName}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm"
          >
            {/* Sector Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl border border-slate-700 bg-slate-950 p-2">
                  {getSectorIcon(secName)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{secName}</h3>
                  <p className="text-xs text-slate-400">
                    {items.length} Saham Core &bull; {undervaluedCount} emiten berstatus Undervalued
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Rata-rata MOS Sektor
                  </span>
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    +{avgMos}%
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of stocks within this sector */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((stock) => {
                const isGoodMos = stock.marginOfSafety >= 15;
                return (
                  <div
                    key={stock.id}
                    onClick={() => onSelectStock(stock)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 transition hover:border-emerald-600/50 hover:bg-slate-950 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-white">
                          {stock.ticker}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                            isGoodMos
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          +{stock.marginOfSafety}% MOS
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400 truncate max-w-[170px]">
                        {stock.name}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>Rp {stock.currentPrice.toLocaleString('id-ID')}</span>
                        <span>&bull;</span>
                        <span className="text-amber-400">Div {stock.dividendYield}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        {stock.recommendation}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-emerald-400 group-hover:translate-x-0.5 transition">
                        <span>Detail</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
