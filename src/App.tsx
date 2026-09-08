import React, { useState, useEffect, useMemo } from 'react';
import { 
  CoreStock, 
  GoogleScriptConfig, 
  FilterOptions, 
  ViewMode, 
  AppSection, 
  QuantStock, 
  StockpickItem,
  UserProfile 
} from './types';
import { DEFAULT_STOCKS } from './data/defaultStocks';
import { 
  INITIAL_QUANT_STOCKS, 
  INITIAL_STOCKPICKS, 
  USER_DEPLOYED_URL 
} from './data/quantData';
import { 
  getLocalStocks, 
  saveLocalStocks, 
  getGoogleScriptConfig, 
  saveGoogleScriptConfig, 
  fetchFromGoogleScript, 
  pushToGoogleScript, 
  fetchFromGoogleSheet,
  DEFAULT_SHEET_ID,
  DEFAULT_SHEET_GID,
  exportToCSV, 
  exportToJSON,
  loadScreener,
  getUserSession 
} from './services/googleScriptService';
import {
  fetchLiveMarketData,
  applyLiveQuotesToStocks,
  applyLiveQuotesToQuant,
  INITIAL_LIVE_QUOTES,
  LiveQuote,
} from './services/marketDataService';

import { Navbar } from './components/Navbar';
import { QuantScreenerView } from './components/QuantScreenerView';
import { StockpickView } from './components/StockpickView';
import { TechnicalChartModal } from './components/TechnicalChartModal';
import { LoginModal } from './components/LoginModal';
import { StatCards } from './components/StatCards';
import { FilterBar } from './components/FilterBar';
import { StockTable } from './components/StockTable';
import { StockCardGrid } from './components/StockCardGrid';
import { SectorView } from './components/SectorView';
import { ValuationMatrix } from './components/ValuationMatrix';
import { StockDetailModal } from './components/StockDetailModal';
import { StockFormModal } from './components/StockFormModal';
import { GoogleScriptModal } from './components/GoogleScriptModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { ValuationCalculatorModal } from './components/ValuationCalculatorModal';

import { CheckCircle2, AlertCircle, Info, Sparkles, Layers, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('screener');
  const [stocks, setStocks] = useState<CoreStock[]>(() => getLocalStocks());
  const [config, setConfig] = useState<GoogleScriptConfig>(() => getGoogleScriptConfig());
  
  // Real-time market data state
  const [liveQuotes, setLiveQuotes] = useState<Record<string, LiveQuote>>(INITIAL_LIVE_QUOTES);
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState('16:00 WIB (Market Close)');

  // Quant Screener state
  const [quantStocks, setQuantStocks] = useState<QuantStock[]>(INITIAL_QUANT_STOCKS);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [selectedQuantStock, setSelectedQuantStock] = useState<QuantStock | null>(null);

  // Stockpicks state
  const [stockpicks, setStockpicks] = useState<StockpickItem[]>(INITIAL_STOCKPICKS);

  // Fundamental section state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedStock, setSelectedStock] = useState<CoreStock | null>(null);
  const [stockToEdit, setStockToEdit] = useState<CoreStock | null>(null);

  // User Auth & Session state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getUserSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isGoogleScriptModalOpen, setIsGoogleScriptModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sector: 'Semua Sektor',
    valuation: 'Semua',
    conviction: 'Semua',
    minDividend: 0,
    sortBy: 'marginOfSafety',
    sortOrder: 'desc',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Automatically fetch live market quotes and load screener data from Google Apps Script on launch
  useEffect(() => {
    let isMounted = true;
    const loadInitialLiveQuotes = async () => {
      setIsRefreshingLive(true);
      try {
        const quotes = await fetchLiveMarketData();
        if (!isMounted) return;
        setLiveQuotes(quotes);
        setStocks((prev) => applyLiveQuotesToStocks(prev, quotes));
        setQuantStocks((prev) => applyLiveQuotesToQuant(prev, quotes));
        setLastLiveUpdate(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
      } catch (e) {
        console.warn('Gagal memuat live quotes pertama kali:', e);
      } finally {
        if (isMounted) setIsRefreshingLive(false);
      }
    };

    // Auto-load 155 stocks from Google Apps Script Web App screener
    const loadInitialScreener = async () => {
      try {
        const res = await loadScreener('ALL');
        if (res.success && res.data && res.data.length > 0 && isMounted) {
          setQuantStocks(res.data);
          console.log(`[Google Apps Script] Berhasil memuat ${res.data.length} saham screener.`);
        }
      } catch (e) {
        console.warn('Gagal memuat screener awal dari Apps Script:', e);
      }
    };

    loadInitialLiveQuotes();
    loadInitialScreener();

    return () => {
      isMounted = false;
    };
  }, []);

  // Manual refresh real-time quotes handler
  const handleRefreshLiveQuotes = async () => {
    setIsRefreshingLive(true);
    try {
      const quotes = await fetchLiveMarketData();
      setLiveQuotes(quotes);
      setStocks((prev) => applyLiveQuotesToStocks(prev, quotes));
      setQuantStocks((prev) => applyLiveQuotesToQuant(prev, quotes));
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastLiveUpdate(timeStr);
      showToast(`Harga IHSG & emiten real-time berhasil disinkronisasi! (${timeStr})`);
    } catch (err) {
      showToast('Gagal memuat harga real-time terbaru.', 'error');
    } finally {
      setIsRefreshingLive(false);
    }
  };

  // Sync stocks to local storage
  useEffect(() => {
    saveLocalStocks(stocks);
  }, [stocks]);


  // Handle saving new stockpick
  const handleAddStockpick = (post: StockpickItem) => {
    setStockpicks((prev) => [post, ...prev]);
    showToast(`Setup ${post.ticker} berhasil dipublish!`);
  };

  // Handle saving fundamental stock
  const handleSaveStock = (stock: CoreStock) => {
    setStocks((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === stock.id || s.ticker === stock.ticker);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = stock;
        return copy;
      }
      return [stock, ...prev];
    });
    showToast(`Saham ${stock.ticker} berhasil disimpan!`);
  };

  // Handle deleting a stock
  const handleDeleteStock = (stockId: string) => {
    const stockToDelete = stocks.find((s) => s.id === stockId);
    if (!stockToDelete) return;
    if (confirm(`Hapus saham ${stockToDelete.ticker} dari database?`)) {
      setStocks((prev) => prev.filter((s) => s.id !== stockId));
      if (selectedStock?.id === stockId) setSelectedStock(null);
      showToast(`Saham ${stockToDelete.ticker} telah dihapus.`, 'info');
    }
  };

  // Sync Pull from Google Apps Script Web App URL
  const handleSyncPull = async () => {
    const targetUrl = config.webAppUrl || USER_DEPLOYED_URL;
    setIsSyncing(true);
    try {
      const fetched = await fetchFromGoogleScript(targetUrl);
      if (fetched.length > 0) {
        setStocks(fetched);
        const updatedConfig = saveGoogleScriptConfig({
          webAppUrl: targetUrl,
          lastSyncTime: new Date().toLocaleTimeString('id-ID'),
          syncStatus: 'success',
        });
        setConfig(updatedConfig);
        showToast(`Berhasil menarik ${fetched.length} saham dari Google Apps Script!`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      saveGoogleScriptConfig({ syncStatus: 'error', errorMessage: msg });
      showToast(`Gagal sinkronisasi: ${msg}`, 'error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Pull directly from Google Sheet (CSV / Live)
  const handleSyncPullFromSheet = async (sheetId?: string, gid?: string) => {
    const targetId = sheetId || config.sheetId || DEFAULT_SHEET_ID;
    const targetGid = gid || config.sheetGid || DEFAULT_SHEET_GID;
    setIsSyncing(true);
    try {
      const data = await fetchFromGoogleSheet(targetId, targetGid);
      const updated = applyLiveQuotesToStocks(data, liveQuotes);
      setStocks(updated);
      handleUpdateConfig({
        sheetId: targetId,
        sheetGid: targetGid,
        syncStatus: 'success',
        lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      });
      showToast(`Berhasil membaca ${data.length} saham langsung dari Google Sheet!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      handleUpdateConfig({
        syncStatus: 'error',
        errorMessage: msg,
      });
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Push to Google Apps Script
  const handleSyncPush = async () => {
    const targetUrl = config.webAppUrl || USER_DEPLOYED_URL;
    setIsSyncing(true);
    try {
      await pushToGoogleScript(targetUrl, stocks);
      const updatedConfig = saveGoogleScriptConfig({
        webAppUrl: targetUrl,
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
        syncStatus: 'success',
      });
      setConfig(updatedConfig);
      showToast(`Berhasil mengirim ${stocks.length} saham ke Google Sheet!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal push ke Google Apps Script: ${msg}`, 'error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle importing stocks directly (e.g. from copy-paste spreadsheet)
  const handleImportStocks = async (newStocks: CoreStock[]) => {
    if (!newStocks || newStocks.length === 0) return;
    
    // Merge or replace
    const tickersToFetch = newStocks.map((s) => s.ticker);
    let currentQuotes = liveQuotes;
    try {
      const freshQuotes = await fetchLiveMarketData(tickersToFetch);
      currentQuotes = { ...liveQuotes, ...freshQuotes };
      setLiveQuotes(currentQuotes);
    } catch {
      // use current quotes
    }

    const updated = applyLiveQuotesToStocks(newStocks, currentQuotes);
    setStocks(updated);
    saveLocalStocks(updated);

    // Also update quant stocks if matching ticker exists
    setQuantStocks((prev) => applyLiveQuotesToQuant(prev, currentQuotes));

    showToast(`Berhasil mengimpor ${newStocks.length} saham dari spreadsheet dengan harga live!`);
  };

  const handleUpdateConfig = (newConfig: Partial<GoogleScriptConfig>) => {
    const saved = saveGoogleScriptConfig(newConfig);
    setConfig(saved);
  };

  const handleResetDefaultData = () => {
    const updatedStocks = applyLiveQuotesToStocks(DEFAULT_STOCKS, liveQuotes);
    const updatedQuant = applyLiveQuotesToQuant(INITIAL_QUANT_STOCKS, liveQuotes);
    setStocks(updatedStocks);
    setQuantStocks(updatedQuant);
    setStockpicks(INITIAL_STOCKPICKS);
    showToast('Database berhasil direset dengan harga pasar live.');
  };

  // Filter & sort fundamental stocks
  const filteredStocks = useMemo(() => {
    return stocks
      .filter((stock) => {
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchTicker = stock.ticker.toLowerCase().includes(q);
          const matchName = stock.name.toLowerCase().includes(q);
          const matchSector = stock.sector.toLowerCase().includes(q);
          if (!matchTicker && !matchName && !matchSector) return false;
        }

        if (filters.sector !== 'Semua Sektor' && stock.sector !== filters.sector) {
          return false;
        }

        if (filters.valuation !== 'Semua' && stock.valuationStatus !== filters.valuation) {
          return false;
        }

        if (filters.conviction !== 'Semua' && stock.conviction !== filters.conviction) {
          return false;
        }

        if (filters.minDividend > 0 && stock.dividendYield < filters.minDividend) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: number | string = a[filters.sortBy];
        let valB: number | string = b[filters.sortBy];

        if (typeof valA === 'string') {
          return filters.sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return filters.sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [stocks, filters]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md transition font-mono">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-cyan-400" />}
          <span className="text-xs font-medium text-slate-200">{toast.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        config={config}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
        onOpenGoogleScriptModal={() => setIsGoogleScriptModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenCalculatorModal={() => setIsCalculatorModalOpen(true)}
        onOpenAddModal={() => {
          setStockToEdit(null);
          setIsFormModalOpen(true);
        }}
        onExportCSV={() => {
          exportToCSV(stocks);
          showToast('Data berhasil diekspor ke CSV.');
        }}
        onExportJSON={() => {
          exportToJSON(stocks);
          showToast('Data berhasil diekspor ke JSON.');
        }}
        onSyncGoogleScript={handleSyncPull}
        isSyncing={isSyncing}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Connected Endpoint Status Banner */}
        <div className="rounded-2xl border border-emerald-900/50 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30 font-mono">
                  Google Sheet &amp; Script Connected
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Sheet: <strong className="text-emerald-400">1uVVRVlZBFQAMPmMMvw4BcXPE3TbEHUERRqzkC7QY4x0</strong> (gid: 2051754762)
                </span>
              </div>
              <h2 className="mt-1 text-sm sm:text-base font-bold text-white font-mono">
                IDX Quant Analyst &amp; Saham Core Terminal
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
                Database terhubung dengan Google Sheet &amp; Google Apps Script. Dilengkapi Screener 6 Strategi, Stockpick VIP Feed, Indikator Teknikal MA/RSI/MACD, serta Kalkulator Nilai Wajar Fundamental.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsGoogleScriptModalOpen(true)}
                className="rounded-xl border border-emerald-700/80 bg-emerald-950/50 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-300 hover:bg-emerald-900/60 transition"
              >
                Database Sheet &rarr;
              </button>
              <button
                onClick={() => setIsDeployModalOpen(true)}
                className="rounded-xl border border-indigo-700/80 bg-indigo-950/50 px-3 py-1.5 text-xs font-mono font-semibold text-indigo-300 hover:bg-indigo-900/60 transition"
              >
                Push GitHub &amp; Vercel &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: QUANT SCREENER */}
        {activeSection === 'screener' && (
          <QuantScreenerView
            stocks={quantStocks}
            selectedStrategy={selectedStrategy}
            onSelectStrategy={setSelectedStrategy}
            onSelectStock={(st) => setSelectedQuantStock(st)}
            ihsgQuote={liveQuotes['^JKSE']}
            onRefreshLiveQuotes={handleRefreshLiveQuotes}
            isRefreshingLive={isRefreshingLive}
            lastLiveUpdate={lastLiveUpdate}
            onUpdateStocks={(st) => setQuantStocks(st)}
          />
        )}

        {/* SECTION 2: STOCKPICK VIP FEED */}
        {activeSection === 'stockpicks' && (
          <StockpickView
            stockpicks={stockpicks}
            onAddStockpick={handleAddStockpick}
          />
        )}

        {/* SECTION 3: FUNDAMENTAL & FAIR VALUE */}
        {activeSection === 'fundamental' && (
          <div className="space-y-6">
            {/* Statistical Summary Cards */}
            <StatCards
              stocks={stocks}
              onSelectStock={(st) => setSelectedStock(st)}
            />

            {/* Search, Filters & View Toggle */}
            <FilterBar
              filters={filters}
              onChangeFilter={setFilters}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              totalFiltered={filteredStocks.length}
            />

            {/* Dynamic View Mode */}
            {viewMode === 'table' && (
              <StockTable
                stocks={filteredStocks}
                onSelectStock={(st) => setSelectedStock(st)}
                onEditStock={(st) => {
                  setStockToEdit(st);
                  setIsFormModalOpen(true);
                }}
                onDeleteStock={handleDeleteStock}
              />
            )}

            {viewMode === 'cards' && (
              <StockCardGrid
                stocks={filteredStocks}
                onSelectStock={(st) => setSelectedStock(st)}
                onEditStock={(st) => {
                  setStockToEdit(st);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {viewMode === 'sectors' && (
              <SectorView
                stocks={filteredStocks}
                onSelectStock={(st) => setSelectedStock(st)}
              />
            )}

            {viewMode === 'matrix' && (
              <ValuationMatrix
                stocks={filteredStocks}
                onSelectStock={(st) => setSelectedStock(st)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="text-slate-400 font-medium">
            IDX Quant Analyst &bull; Saham Core VIP Terminal &bull; Google Apps Script Integration
          </p>
          <p className="text-[11px] text-slate-600">
            Didesain untuk deploy instan di Vercel (Vite SPA + Tailwind CSS + Chart Engine).
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TechnicalChartModal
        stock={selectedQuantStock}
        onClose={() => setSelectedQuantStock(null)}
      />

      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onEdit={(st) => {
          setSelectedStock(null);
          setStockToEdit(st);
          setIsFormModalOpen(true);
        }}
      />

      <StockFormModal
        isOpen={isFormModalOpen}
        stockToEdit={stockToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setStockToEdit(null);
        }}
        onSave={handleSaveStock}
      />

      <GoogleScriptModal
        isOpen={isGoogleScriptModalOpen}
        config={config}
        onClose={() => setIsGoogleScriptModalOpen(false)}
        onSaveConfig={handleUpdateConfig}
        onSyncPull={handleSyncPull}
        onSyncPush={handleSyncPush}
        onSyncPullSheet={handleSyncPullFromSheet}
        onImportStocks={handleImportStocks}
        onResetDefaultData={handleResetDefaultData}
      />

      <DeployGuideModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      <ValuationCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Selamat datang kembali, ${user.name || user.email}! Akses VIP Aktif.`);
        }}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Anda telah logout.', 'info');
        }}
        webAppUrl={config.webAppUrl}
      />
    </div>
  );
}
