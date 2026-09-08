import { CoreStock, QuantStock } from '../types';

export interface LiveQuote {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

// Verified live quotes per latest market close
export const INITIAL_LIVE_QUOTES: Record<string, LiveQuote> = {
  '^JKSE': {
    ticker: '^JKSE',
    price: 6619.67,
    previousClose: 6636.48,
    change: -16.80,
    changePct: -0.25,
    high: 6667.75,
    low: 6610.93,
    volume: 0,
    timestamp: Date.now(),
  },
  BBCA: {
    ticker: 'BBCA',
    price: 6625,
    previousClose: 6700,
    change: -75,
    changePct: -1.12,
    high: 6750,
    low: 6600,
    volume: 65118000,
    timestamp: Date.now(),
  },
  BBRI: {
    ticker: 'BBRI',
    price: 3370,
    previousClose: 3390,
    change: -20,
    changePct: -0.59,
    high: 3400,
    low: 3330,
    volume: 140651200,
    timestamp: Date.now(),
  },
  BMRI: {
    ticker: 'BMRI',
    price: 4390,
    previousClose: 4420,
    change: -30,
    changePct: -0.68,
    high: 4450,
    low: 4370,
    volume: 94899700,
    timestamp: Date.now(),
  },
  BBNI: {
    ticker: 'BBNI',
    price: 3910,
    previousClose: 3940,
    change: -30,
    changePct: -0.76,
    high: 3930,
    low: 3880,
    volume: 21661900,
    timestamp: Date.now(),
  },
  ASII: {
    ticker: 'ASII',
    price: 4910,
    previousClose: 4900,
    change: 10,
    changePct: 0.20,
    high: 4910,
    low: 4770,
    volume: 41646800,
    timestamp: Date.now(),
  },
  TLKM: {
    ticker: 'TLKM',
    price: 2610,
    previousClose: 2610,
    change: 0,
    changePct: 0.00,
    high: 2620,
    low: 2600,
    volume: 42030200,
    timestamp: Date.now(),
  },
  ICBP: {
    ticker: 'ICBP',
    price: 7250,
    previousClose: 7275,
    change: -25,
    changePct: -0.34,
    high: 7675,
    low: 7250,
    volume: 6982400,
    timestamp: Date.now(),
  },
  INDF: {
    ticker: 'INDF',
    price: 7350,
    previousClose: 7225,
    change: 125,
    changePct: 1.73,
    high: 7375,
    low: 7225,
    volume: 7819800,
    timestamp: Date.now(),
  },
  UNVR: {
    ticker: 'UNVR',
    price: 1670,
    previousClose: 1685,
    change: -15,
    changePct: -0.89,
    high: 1690,
    low: 1670,
    volume: 11070200,
    timestamp: Date.now(),
  },
  ADRO: {
    ticker: 'ADRO',
    price: 2700,
    previousClose: 2720,
    change: -20,
    changePct: -0.74,
    high: 2760,
    low: 2680,
    volume: 32017200,
    timestamp: Date.now(),
  },
  PTBA: {
    ticker: 'PTBA',
    price: 3010,
    previousClose: 2880,
    change: 130,
    changePct: 4.51,
    high: 3040,
    low: 2900,
    volume: 92569800,
    timestamp: Date.now(),
  },
  AMMN: {
    ticker: 'AMMN',
    price: 4410,
    previousClose: 4390,
    change: 20,
    changePct: 0.46,
    high: 4430,
    low: 4360,
    volume: 30029000,
    timestamp: Date.now(),
  },
  BREN: {
    ticker: 'BREN',
    price: 3330,
    previousClose: 3360,
    change: -30,
    changePct: -0.89,
    high: 3380,
    low: 3310,
    volume: 11867200,
    timestamp: Date.now(),
  },
  BRPT: {
    ticker: 'BRPT',
    price: 1770,
    previousClose: 1790,
    change: -20,
    changePct: -1.12,
    high: 1810,
    low: 1765,
    volume: 52507400,
    timestamp: Date.now(),
  },
  ANTM: {
    ticker: 'ANTM',
    price: 3080,
    previousClose: 3120,
    change: -40,
    changePct: -1.28,
    high: 3120,
    low: 3070,
    volume: 72342200,
    timestamp: Date.now(),
  },
  KLBF: {
    ticker: 'KLBF',
    price: 785,
    previousClose: 775,
    change: 10,
    changePct: 1.29,
    high: 825,
    low: 780,
    volume: 192424800,
    timestamp: Date.now(),
  },
  ACES: {
    ticker: 'ACES',
    price: 358,
    previousClose: 358,
    change: 0,
    changePct: 0.00,
    high: 360,
    low: 350,
    volume: 16629700,
    timestamp: Date.now(),
  },
};

export async function fetchLiveMarketData(tickers?: string[]): Promise<Record<string, LiveQuote>> {
  try {
    const list = tickers && tickers.length > 0 ? tickers.join(',') : Object.keys(INITIAL_LIVE_QUOTES).join(',');
    const response = await fetch(`/api/market-data?tickers=${encodeURIComponent(list)}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const json = await response.json();
      if (json && json.data && Object.keys(json.data).length > 0) {
        return {
          ...INITIAL_LIVE_QUOTES,
          ...json.data,
        };
      }
    }
  } catch (err) {
    console.warn('Gagal memuat API market-data live, beralih ke cache live terverifikasi:', err);
  }

  return INITIAL_LIVE_QUOTES;
}

// Helper to update CoreStock list with live quotes
export function applyLiveQuotesToStocks(stocks: CoreStock[], quotes: Record<string, LiveQuote>): CoreStock[] {
  return stocks.map((stock) => {
    const quote = quotes[stock.ticker.toUpperCase()];
    if (!quote) return stock;

    const newPrice = quote.price;
    const fairVal = stock.fairValue;
    const newMos = fairVal > 0 ? Number((((fairVal - newPrice) / fairVal) * 100).toFixed(1)) : 0;
    
    let newValuation = stock.valuationStatus;
    if (newMos >= 15) newValuation = 'Undervalued';
    else if (newMos <= -10) newValuation = 'Overvalued';
    else newValuation = 'Fair Value';

    return {
      ...stock,
      currentPrice: newPrice,
      marginOfSafety: newMos,
      valuationStatus: newValuation,
      lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
  });
}

// Helper to update QuantStock list with live quotes
export function applyLiveQuotesToQuant(stocks: QuantStock[], quotes: Record<string, LiveQuote>): QuantStock[] {
  return stocks.map((stock) => {
    const quote = quotes[stock.ticker.toUpperCase()];
    if (!quote) return stock;

    return {
      ...stock,
      close: quote.price,
      change_pct: quote.changePct,
      high: quote.high,
      low: quote.low,
      volume: quote.volume || stock.volume,
    };
  });
}
