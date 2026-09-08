import { QuantStock, StockpickItem } from '../types';

export const USER_DEPLOYED_URL =
  'https://script.google.com/macros/s/AKfycbxp569_Wia0XPhzP81dSCcUte5kaK0nW2yM6GbpXYh5EeYsqwr-SiK_50M_qBeGUK1FfQ/exec';

// Generate synthetic historical chart points for technical modal around actual current price
export function generateTechnicalPoints(basePrice: number) {
  const points = 30;
  const prices: number[] = [];
  const ma20: number[] = [];
  const ma50: number[] = [];
  const ma200: number[] = [];
  const rsi: number[] = [];
  const macd: number[] = [];
  const signal: number[] = [];
  const hist: number[] = [];

  let current = basePrice * 0.94;
  for (let i = 0; i < points; i++) {
    const change = (Math.sin(i / 2) + (Math.random() - 0.48) * 0.8) * 0.015 * basePrice;
    current = Math.round(current + change);
    prices.push(current);

    const m20 = Math.round(current * (1 - 0.012 * Math.sin(i / 3)));
    const m50 = Math.round(current * (1 - 0.025 * Math.cos(i / 4)));
    const m200 = Math.round(current * 0.96);
    ma20.push(m20);
    ma50.push(m50);
    ma200.push(m200);

    const r = Math.min(85, Math.max(25, Math.round(48 + 18 * Math.sin(i / 2.5) + (Math.random() - 0.5) * 8)));
    rsi.push(r);

    const mc = Number((Math.sin(i / 3) * 10 + (Math.random() - 0.5) * 3).toFixed(2));
    const sg = Number((Math.sin((i - 2) / 3) * 8).toFixed(2));
    macd.push(mc);
    signal.push(sg);
    hist.push(Number((mc - sg).toFixed(2)));
  }

  // Ensure last point is the basePrice
  prices[prices.length - 1] = basePrice;

  return { prices, ma20, ma50, ma200, rsi, macd, signal, hist };
}

// Live real-time initial IDX stock quotes
export const INITIAL_QUANT_STOCKS: QuantStock[] = [
  {
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk',
    close: 6625,
    change_pct: -1.12,
    value_idr: 431000000000,
    rsi_14: 42.1,
    ma_status: 'Testing Support MA200',
    strategy: 'BUY_ON_WEAKNESS',
    high: 6750,
    low: 6600,
    volume: 65118000,
  },
  {
    ticker: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    close: 3370,
    change_pct: -0.59,
    value_idr: 474000000000,
    rsi_14: 36.8,
    ma_status: 'Oversold RSI Demand',
    strategy: 'BUY_ON_WEAKNESS',
    high: 3400,
    low: 3330,
    volume: 140651200,
  },
  {
    ticker: 'BMRI',
    name: 'Bank Mandiri Tbk',
    close: 4390,
    change_pct: -0.68,
    value_idr: 416000000000,
    rsi_14: 45.4,
    ma_status: 'Consolidation Area',
    strategy: 'SWING',
    high: 4450,
    low: 4370,
    volume: 94899700,
  },
  {
    ticker: 'BBNI',
    name: 'Bank Negara Indonesia Tbk',
    close: 3910,
    change_pct: -0.76,
    value_idr: 84000000000,
    rsi_14: 41.2,
    ma_status: 'Near Support MA50',
    strategy: 'SWING',
    high: 3930,
    low: 3880,
    volume: 21661900,
  },
  {
    ticker: 'ASII',
    name: 'Astra International Tbk',
    close: 4910,
    change_pct: 0.20,
    value_idr: 204000000000,
    rsi_14: 56.7,
    ma_status: 'Rebound MA20',
    strategy: 'SWING',
    high: 4910,
    low: 4770,
    volume: 41646800,
  },
  {
    ticker: 'TLKM',
    name: 'Telkom Indonesia Tbk',
    close: 2610,
    change_pct: 0.00,
    value_idr: 109000000000,
    rsi_14: 38.5,
    ma_status: 'Sideways Base Rebound',
    strategy: 'BUY_ON_WEAKNESS',
    high: 2620,
    low: 2600,
    volume: 42030200,
  },
  {
    ticker: 'PTBA',
    name: 'Bukit Asam Tbk',
    close: 3010,
    change_pct: 4.51,
    value_idr: 278000000000,
    rsi_14: 69.2,
    ma_status: 'Breakout MA20 Vol 3x',
    strategy: 'SCALPING',
    high: 3040,
    low: 2900,
    volume: 92569800,
  },
  {
    ticker: 'INDF',
    name: 'Indofood Sukses Makmur Tbk',
    close: 7350,
    change_pct: 1.73,
    value_idr: 57000000000,
    rsi_14: 63.4,
    ma_status: 'Bullish Momentum',
    strategy: 'GOLDEN_CROSS',
    high: 7375,
    low: 7225,
    volume: 7819800,
  },
  {
    ticker: 'AMMN',
    name: 'Amman Mineral Internasional Tbk',
    close: 4410,
    change_pct: 0.46,
    value_idr: 132000000000,
    rsi_14: 52.8,
    ma_status: 'MA20 Rebound',
    strategy: 'SCALPING',
    high: 4430,
    low: 4360,
    volume: 30029000,
  },
  {
    ticker: 'BREN',
    name: 'Barito Renewables Energy Tbk',
    close: 3330,
    change_pct: -0.89,
    value_idr: 39500000000,
    rsi_14: 48.6,
    ma_status: 'Base Building',
    strategy: 'ALL',
    high: 3380,
    low: 3310,
    volume: 11867200,
  },
  {
    ticker: 'BRPT',
    name: 'Barito Pacific Tbk',
    close: 1770,
    change_pct: -1.12,
    value_idr: 93000000000,
    rsi_14: 47.9,
    ma_status: 'Retest MA50',
    strategy: 'SWING',
    high: 1810,
    low: 1765,
    volume: 52507400,
  },
  {
    ticker: 'ANTM',
    name: 'Aneka Tambang Tbk',
    close: 3080,
    change_pct: -1.28,
    value_idr: 224000000000,
    rsi_14: 51.5,
    ma_status: 'Gold Trend Pullback',
    strategy: 'SWING',
    high: 3120,
    low: 3070,
    volume: 72342200,
  },
  {
    ticker: 'ICBP',
    name: 'Indofood CBP Sukses Makmur Tbk',
    close: 7250,
    change_pct: -0.34,
    value_idr: 51000000000,
    rsi_14: 44.0,
    ma_status: 'Defensive Value Test',
    strategy: 'DIVIDEND_PLAY',
    high: 7675,
    low: 7250,
    volume: 6982400,
  },
  {
    ticker: 'ADRO',
    name: 'Alamtri Resources Indonesia Tbk',
    close: 2700,
    change_pct: -0.74,
    value_idr: 86000000000,
    rsi_14: 46.2,
    ma_status: 'High Dividend Support',
    strategy: 'DIVIDEND_PLAY',
    high: 2760,
    low: 2680,
    volume: 32017200,
  },
];

export const INITIAL_STOCKPICKS: StockpickItem[] = [
  {
    id: 'post-1',
    ticker: 'BBCA',
    title: 'Akumulasi Asing di Demand Support 6.600',
    entry: '6.550 - 6.650',
    tp: '7.250',
    sl: '6.450',
    ta_rationale:
      'BBCA menyentuh zona demand kuat di Rp 6.600 dengan volume seller yang mulai menipis dan RSI di zona jenuh jual.',
    bandar_rationale:
      'Top broker asing mencatatkan net inflow konsisten pada harga 6.625. Potensi pantulan technical swing menuju resistance 7.250.',
    chart_url:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
    created_at: 'Hari ini',
  },
  {
    id: 'post-2',
    ticker: 'PTBA',
    title: 'Breakout Volume Tinggi + Sentimen Dividen Jumbo',
    entry: '2.950 - 3.010',
    tp: '3.300',
    sl: '2.850',
    ta_rationale:
      'Volume breakout masif 3x rata-rata 20 hari menembus level psikologis Rp 3.000 dengan candle marubozu hijau.',
    bandar_rationale:
      'Akumulasi masif dari investor institusi lokal dan asing menjelang estimasi pengumuman dividen tahunan.',
    chart_url:
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=800&auto=format&fit=crop',
    created_at: 'Hari ini',
  },
];
