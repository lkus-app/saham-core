import React from 'react';
import { 
  Search, 
  Table as TableIcon, 
  LayoutGrid, 
  PieChart, 
  Grid2X2, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { FilterOptions, ViewMode } from '../types';
import { SECTORS } from '../data/defaultStocks';

interface FilterBarProps {
  filters: FilterOptions;
  onChangeFilter: (filters: FilterOptions) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilter,
  viewMode,
  onChangeViewMode,
  totalFiltered,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilter({ ...filters, search: e.target.value });
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilter({ ...filters, sector: e.target.value });
  };

  const handleValuationChange = (val: string) => {
    onChangeFilter({ ...filters, valuation: val });
  };

  const handleConvictionChange = (tier: string) => {
    onChangeFilter({ ...filters, conviction: tier });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as FilterOptions['sortBy'];
    onChangeFilter({ ...filters, sortBy: val });
  };

  const handleSortOrderToggle = () => {
    onChangeFilter({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const resetFilters = () => {
    onChangeFilter({
      search: '',
      sector: 'Semua Sektor',
      valuation: 'Semua',
      conviction: 'Semua',
      minDividend: 0,
      sortBy: 'marginOfSafety',
      sortOrder: 'desc',
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.sector !== 'Semua Sektor' ||
    filters.valuation !== 'Semua' ||
    filters.conviction !== 'Semua' ||
    filters.minDividend > 0;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      {/* Top row: Search, Sector, Sort, View Toggle */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search & Sector */}
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Cari emiten (cth: BBCA, Astra, Bank)..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {filters.search && (
              <button
                onClick={() => onChangeFilter({ ...filters, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sector Select */}
          <div className="w-full sm:w-auto min-w-[180px]">
            <select
              value={filters.sector}
              onChange={handleSectorChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 px-3 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Switcher & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          {/* Sort options */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden sm:inline">Urutkan:</span>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="rounded-xl border border-slate-700 bg-slate-950 py-2 px-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="marginOfSafety">Diskon (MOS %)</option>
              <option value="dividendYield">Dividen Yield</option>
              <option value="roe">Kualitas (ROE %)</option>
              <option value="peRatio">PER (P/E)</option>
              <option value="currentPrice">Harga Terakhir</option>
              <option value="ticker">Kode Saham</option>
            </select>
            <button
              onClick={handleSortOrderToggle}
              title={`Urutan: ${filters.sortOrder === 'asc' ? 'Naik (A-Z / Rendah-Tinggi)' : 'Turun (Z-A / Tinggi-Rendah)'}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-xs font-mono text-slate-200 hover:bg-slate-800"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 p-1">
            <button
              onClick={() => onChangeViewMode('table')}
              title="Tampilan Tabel Lengkap"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Tabel</span>
            </button>
            <button
              onClick={() => onChangeViewMode('cards')}
              title="Tampilan Kartu Visual"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'cards'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Kartu</span>
            </button>
            <button
              onClick={() => onChangeViewMode('sectors')}
              title="Kelompok Sektor"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'sectors'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChart className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sektor</span>
            </button>
            <button
              onClick={() => onChangeViewMode('matrix')}
              title="Matriks Valuasi (ROE vs MOS)"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'matrix'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid2X2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Matriks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Quick Filter Pills (Valuation Status & Conviction Tier) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
        {/* Valuation pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Valuasi:</span>
          {['Semua', 'Undervalued', 'Fair Value', 'Overvalued'].map((st) => (
            <button
              key={st}
              onClick={() => handleValuationChange(st)}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                filters.valuation === st
                  ? st === 'Undervalued'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : st === 'Overvalued'
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'bg-teal-600 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {st === 'Undervalued' ? 'Diskon (Undervalued)' : st}
            </button>
          ))}
        </div>

        {/* Conviction pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Kategori:</span>
          {['Semua', 'Tier 1 (Core Utama)', 'Tier 2 (Core Pendukung)', 'Watchlist'].map((c) => (
            <button
              key={c}
              onClick={() => handleConvictionChange(c)}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                filters.conviction === c
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {c.replace(' (Core Utama)', '').replace(' (Core Pendukung)', '')}
            </button>
          ))}

          {/* Reset button if filtered */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="ml-2 text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}

          <span className="text-xs text-slate-500 ml-2">
            ({totalFiltered} saham ditemukan)
          </span>
        </div>
      </div>
    </div>
  );
};
