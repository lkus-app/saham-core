export type SectorType =
  | 'Financials (Perbankan)'
  | 'Consumer Non-Cyclical (Barang Konsumsi)'
  | 'Consumer Non-Cyclicals (Barang Konsumsi)'
  | 'Consumer Cyclical (Konsumsi Sekunder)'
  | 'Energy & Resources (Energi & Tambang)'
  | 'Energy & Coal (Energi & Tambang)'
  | 'Industrial (Perindustrian)'
  | 'Infrastructure & Telco (Infrastruktur & Telko)'
  | 'Healthcare (Kesehatan)'
  | string;

export type ValuationStatus = 'Undervalued' | 'Fair Value' | 'Overvalued';

export type ConvictionTier = 'Tier 1 (Core Utama)' | 'Tier 2 (Core Pendukung)' | 'Watchlist';

export type RecommendationType =
  | 'Strong Buy'
  | 'Buy on Weakness'
  | 'Hold'
  | 'Hold / Monitor'
  | 'Take Profit'
  | 'Take Profit / Overpriced';

export interface CoreStock {
  id: string;
  ticker: string;
  name: string;
  sector: SectorType;
  currentPrice: number;
  fairValue: number;
  marginOfSafety: number; // percentage (e.g. +21.1% or -5.5%)
  valuationStatus: ValuationStatus;
  buyAreaLow: number;
  buyAreaHigh: number;
  targetPrice: number;
  stopLoss?: number;
  peRatio: number;
  pbvRatio: number;
  roe: number;
  dividendYield: number;
  marketCapTrillion: number;
  conviction: ConvictionTier;
  recommendation: RecommendationType;
  catalysts?: string;
  notes?: string;
  lastUpdated: string;
}

// User's Google Script Quant Screener item
export interface QuantStock {
  ticker: string;
  name?: string;
  close: number;
  change_pct: number;
  value_idr: number;
  rsi_14: number;
  ma_status: string;
  strategy: string; // 'ALL' | 'SCALPING' | 'SWING' | 'BUY_ON_WEAKNESS' | 'GOLDEN_CROSS' | 'DIVIDEND_PLAY'
  high?: number;
  low?: number;
  volume?: number;
}

// User's Google Script Stockpick item
export interface StockpickItem {
  id?: string;
  ticker: string;
  title: string;
  entry: string;
  tp: string;
  sl: string;
  ta_rationale: string;
  bandar_rationale: string;
  chart_url: string;
  created_at?: string;
}

export type ViewMode = 'table' | 'cards' | 'sectors' | 'matrix';
export type AppSection = 'screener' | 'stockpicks' | 'fundamental';

export interface FilterOptions {
  search: string;
  sector: string;
  valuation: string;
  conviction: string;
  minDividend: number;
  sortBy: keyof CoreStock;
  sortOrder: 'asc' | 'desc';
}

export interface GoogleScriptConfig {
  webAppUrl: string;
  sheetId?: string;
  sheetGid?: string;
  autoSync: boolean;
  lastSyncTime: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}
