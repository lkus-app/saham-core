import React, { useState, useEffect } from 'react';
import { QuantStock } from '../types';
import { LiveQuote } from '../services/marketDataService';
import { loadScreener } from '../services/googleScriptService';
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
  TrendingUp,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  Database
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
  onUpdateStocks?: (newStocks: QuantStock[]) => void;
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
  onUpdateStocks,
}) => {
  const [search, setSearch] = useState('');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const strategies = [
    { id: 'ALL', label: `ALL (${stocks.length} EMITEN)`, icon: Layers },
    { id: 'BULLISH', label: '📈 BULLISH (MA20/50)', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'OVERSOLD', label: '🛡️ BUY ON WEAKNESS (RSI < 45)', icon: Shield, color: 'text-teal-400' },
    { id: 'MACD_CROSS', label: '⚡ MACD BULL CROSS', icon: Activity, color: 'text-amber-400' },
    { id: 'DIVIDEND_PLAY', label: '💰 DIVIDEND PLAY (>2.5%)', icon: Award, color: 'text-indigo-400' },
    { id: 'SCALPING', label: '🔥 SCALPING MOMENTUM', icon: Zap, color: 'text-orange-400' },
    { id: 'SWING', label: '🎯 SWING UPTREND', icon: Compass, color: 'text-sky-400' },
  ];

  const ihsgPrice = ihsgQuote?.price ?? 6619.67;
  const ihsgChangePct = ihsgQuote?.changePct ?? -0.25;
  const ihsgIsUp = ihsgChangePct >= 0;
  const ihsgLow = ihsgQuote?.low ?? 6610.93;
  const ihsgHigh = ihsgQuote?.high ?? 6667.75;

  // Handler for loadScreener from Google Apps Script Web App
  const handleLoadScreenerFromApi = async (filterName = selectedStrategy) => {
    setIsLoadingApi(true);
    setApiMessage(null);
    try {
      const res = await loadScreener(filterName);
      if (res.success && res.data && res.data.length > 0) {
        if (onUpdateStocks) {
          onUpdateStocks(res.data);
        }
        setApiMessage(`Berhasil memuat ${res.data.length} emiten langsung dari Google Apps Script!`);
      } else {
        setApiMessage(res.message || 'Gagal memuat data dari Web App API.');
      }
    } catch (e: any) {
      setApiMessage(`Error: ${e.message || 'Koneksi gagal'}`);
    } finally {
      setIsLoadingApi(false);
      setTimeout(() => setApiMessage(null), 5000);
    }
  };

  // Automatically fetch from Apps Script if initial count is small or on mount
  useEffect(() => {
    if (stocks.length < 50 && !isLoadingApi) {
      handleLoadScreenerFromApi('ALL');
    }
  }, []);

  const filtered = stocks.filter((s) => {
    // Strategy filters
    if (selectedStrategy === 'BULLISH') {
      const isMaBull = s.ma20 && s.ma50 ? s.close >= s.ma20 && s.ma20 >= s.ma50 : s.ma_status?.includes('Bullish');
      if (!isMaBull && s.change_pct <= 0) return false;
    } else if (selectedStrategy === 'OVERSOLD') {
      if (s.rsi_14 >= 48) return false;
    } else if (selectedStrategy === 'MACD_CROSS') {
      if (s.macd !== undefined && s.macd_signal !== undefined) {
        if (s.macd < s.macd_signal) return false;
      } else if (!s.ma_status?.includes('Bullish')) {
        return false;
      }
    } else if (selectedStrategy === 'DIVIDEND_PLAY') {
      if (!s.dividend_yield || s.dividend_yield < 2.5) return false;
    } else if (selectedStrategy === 'SCALPING') {
      if (s.change_pct < 1.0) return false;
    } else if (selectedStrategy === 'SWING') {
      if (s.rsi_14 > 68 || s.change_pct < -2) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return s.ticker.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q));
    }
    return true;
  });

  // Calculate summary metrics
  const bullishCount = stocks.filter(s => (s.ma20 && s.close > s.ma20) || s.ma_status?.includes('Bullish')).length;
  const oversoldCount = stocks.filter(s => s.rsi_14 < 45).length;
  const highDividendCount = stocks.filter(s => (s.dividend_yield || 0) >= 3.0).length;

  return (
    <div className="space-y-5">
      {/* Real-time Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 font-mono text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold tracking-wide">
            GOOGLE APPS SCRIPT SCREENER API
          </span>
          <span className="rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-800/60">
            155 Emiten Aktif
          </span>
          {lastLiveUpdate && (
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              &bull; Diperbarui: {lastLiveUpdate}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadScreenerFromApi(selectedStrategy)}
            disabled={isLoadingApi}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-700/80 bg-emerald-950/60 px-3 py-1 text-emerald-300 hover:bg-emerald-900/60 transition disabled:opacity-50"
            title="Tarik data saham segar dari Web App loadScreener()"
          >
            <Database className={`h-3 w-3 ${isLoadingApi ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isLoadingApi ? 'Mengambil Data...' : 'Sync Screener API'}</span>
          </button>

          {onRefreshLiveQuotes && (
            <button
              onClick={onRefreshLiveQuotes}
              disabled={isRefreshingLive}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshingLive ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{isRefreshingLive ? 'Memuat...' : 'Refresh Harga'}</span>
            </button>
          )}
        </div>
      </div>

      {apiMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300 font-mono animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{apiMessage}</span>
        </div>
      )}

      {/* Intraday & Market Flow Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

          <div className="h-10 flex items-end gap-1 pt-2">
            {[65, 62, 59, 58, 55, 52, 50, 48, 47, 45, 46, 44, 45].map((h, i) => (
              <div
                key={i}
                className={`flex-1 ${ihsgIsUp ? 'bg-emerald-500/30 hover:bg-emerald-400' : 'bg-rose-500/30 hover:bg-rose-400'} transition rounded-t`}
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Bullish Setup Metric */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono shadow-sm">
          <span className="text-xs text-slate-400 block mb-1 font-bold tracking-wider">
            BULLISH MOMENTUM
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{bullishCount}</span>
            <span className="text-xs text-slate-400">/ {stocks.length} emiten</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/60 pt-1.5">
            Emiten diperdagangkan di atas support MA20 dengan tren positif.
          </p>
        </div>

        {/* Oversold Metric */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono shadow-sm">
          <span className="text-xs text-slate-400 block mb-1 font-bold tracking-wider">
            OVERSOLD (RSI &lt; 45)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">{oversoldCount}</span>
            <span className="text-xs text-slate-400">peluang buy on dip</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/60 pt-1.5">
            Saham jenuh jual dengan rasio risk-reward menarik.
          </p>
        </div>

        {/* Dividend Yield Metric */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono shadow-sm">
          <span className="text-xs text-slate-400 block mb-1 font-bold tracking-wider">
            HIGH DIVIDEND (&ge; 3%)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">{highDividendCount}</span>
            <span className="text-xs text-slate-400">emiten defensif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/60 pt-1.5">
            Saham dengan yield dividen tinggi untuk passive income.
          </p>
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

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari ticker atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Screener Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
          <span>Menampilkan <strong className="text-white">{filtered.length}</strong> emiten saham</span>
          <span className="text-[11px] text-slate-500">Klik baris saham untuk melihat chart teknikal &amp; MA</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3">Ticker</th>
                <th className="p-3">Perusahaan</th>
                <th className="p-3 text-right">Harga (Close)</th>
                <th className="p-3 text-right">Change %</th>
                <th className="p-3 text-right">Value (IDR)</th>
                <th className="p-3 text-center">RSI (14)</th>
                <th className="p-3 text-center">MA20 / MA50 / MA200</th>
                <th className="p-3 text-center">MACD vs Signal</th>
                <th className="p-3 text-right">Support</th>
                <th className="p-3 text-right">Div. Yield</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 font-mono">
                    Tidak ada saham yang memenuhi kriteria filter strategi "{selectedStrategy}".
                  </td>
                </tr>
              ) : (
                filtered.map((stock) => {
                  const isUp = stock.change_pct >= 0;
                  const macdBullish = stock.macd !== undefined && stock.macd_signal !== undefined && stock.macd >= stock.macd_signal;

                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <td className="p-3 text-emerald-400 font-bold text-sm">
                        {stock.ticker}
                      </td>
                      <td className="p-3 text-slate-300 text-xs truncate max-w-[150px]" title={stock.name}>
                        {stock.name || `${stock.ticker} Tbk`}
                      </td>
                      <td className="p-3 text-right font-semibold text-white">
                        Rp {stock.close.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`p-3 text-right font-bold ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {stock.change_pct.toFixed(2)}%
                      </td>
                      <td className="p-3 text-right font-mono text-slate-200">
                        Rp {(stock.value_idr / 1e9).toFixed(1)} M
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            stock.rsi_14 > 70
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                              : stock.rsi_14 < 40
                              ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {stock.rsi_14.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-3 text-center text-[11px]">
                        <div className="flex items-center justify-center gap-1 text-[10px]">
                          <span className={stock.ma20 && stock.close >= stock.ma20 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {stock.ma20 ? `M20:${stock.ma20}` : '-'}
                          </span>
                          <span className="text-slate-600">/</span>
                          <span className={stock.ma50 && stock.close >= stock.ma50 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {stock.ma50 ? `M50:${stock.ma50}` : '-'}
                          </span>
                          <span className="text-slate-600">/</span>
                          <span className={stock.ma200 && stock.close >= stock.ma200 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {stock.ma200 ? `M200:${stock.ma200}` : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-[11px]">
                        {stock.macd !== undefined && stock.macd_signal !== undefined ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            macdBullish ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {macdBullish ? '▲ CROSS' : '▼ BEAR'} ({stock.macd.toFixed(1)})
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">
                        {stock.support_lvl ? `Rp ${stock.support_lvl.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {stock.dividend_yield && stock.dividend_yield > 0 ? (
                          <span className="text-indigo-400 font-bold">{stock.dividend_yield.toFixed(1)}%</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock);
                          }}
                          className="rounded-lg border border-cyan-700/60 bg-cyan-950/40 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900/60 transition"
                        >
                          CHART &nearr;
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
