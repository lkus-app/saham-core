import { CoreStock, GoogleScriptConfig, QuantStock, UserProfile } from '../types';
import { DEFAULT_STOCKS } from '../data/defaultStocks';

const STORAGE_KEY_STOCKS = 'idx_core_stocks_data_v1';
const STORAGE_KEY_CONFIG = 'idx_google_script_config_v1';
const STORAGE_KEY_USER = 'lapin_user_session_v1';

export const DEFAULT_SHEET_ID = '1uVVRVlZBFQAMPmMMvw4BcXPE3TbEHUERRqzkC7QY4x0';
export const DEFAULT_SHEET_GID = '2051754762';
export const USER_PROJECT_ID = '1uQf_jxtD-s4Jt6SQrJnba9lZua8BrCbNuosY0g2aXZare3cn6liv-IvB';
export const USER_DEPLOYED_URL = 'https://lapin-idx-proxy.lkusdewanto.workers.dev';
export const API_URL = USER_DEPLOYED_URL;

export function getLocalStocks(): CoreStock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STOCKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gagal membaca data dari localStorage:', e);
  }
  return DEFAULT_STOCKS;
}

export function saveLocalStocks(stocks: CoreStock[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(stocks));
  } catch (e) {
    console.error('Gagal menyimpan ke localStorage:', e);
  }
}

export function getGoogleScriptConfig(): GoogleScriptConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.webAppUrl) {
        parsed.webAppUrl = USER_DEPLOYED_URL;
      }
      if (!parsed.sheetId) {
        parsed.sheetId = DEFAULT_SHEET_ID;
      }
      if (!parsed.sheetGid) {
        parsed.sheetGid = DEFAULT_SHEET_GID;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Gagal membaca config dari localStorage:', e);
  }
  return {
    webAppUrl: USER_DEPLOYED_URL,
    sheetId: DEFAULT_SHEET_ID,
    sheetGid: DEFAULT_SHEET_GID,
    autoSync: true,
    lastSyncTime: 'Baru saja',
    syncStatus: 'success',
  };
}

export function saveGoogleScriptConfig(config: Partial<GoogleScriptConfig>): GoogleScriptConfig {
  const current = getGoogleScriptConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  } catch (e) {
    console.error('Gagal menyimpan config ke localStorage:', e);
  }
  return updated;
}

export function parseIndonesianNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  let str = String(val).trim();
  if (!str) return fallback;

  str = str.replace(/^(rp|idr|\$|\€|\¥)\s*/i, '');
  str = str.replace(/\s*(triliun|trillion|t|miliar|billion|b|juta|million|m|%|x)$/i, '');
  str = str.trim();

  if (/\d+\.\d{3},\d+/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/\d+,\d{3}\.\d+/.test(str)) {
    str = str.replace(/,/g, '');
  } else if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } else if (/\d+\.\d{3}$/.test(str)) {
    str = str.replace(/\./g, '');
  }

  const cleanNum = parseFloat(str.replace(/[^0-9.-]/g, ''));
  return isNaN(cleanNum) ? fallback : cleanNum;
}

export function cleanTickerAndName(rawTicker: string, rawName: string): { ticker: string; name: string } {
  let ticker = String(rawTicker || '').trim().toUpperCase();
  let name = String(rawName || '').trim();

  ticker = ticker.replace(/\.JK$/i, '').replace(/^IDX:/i, '').trim();
  ticker = ticker.replace(/^[0-9]+[\.\-\s)]+/, '').trim();

  const dashMatch = ticker.match(/^([A-Z0-9]{4,6})\s*[-–—:]\s*(.+)$/);
  if (dashMatch) {
    ticker = dashMatch[1];
    if (!name || name === rawTicker) {
      name = dashMatch[2].trim();
    }
  }

  const parenMatch = ticker.match(/^([A-Z0-9]{4,6})\s*\((.+)\)$/);
  if (parenMatch) {
    ticker = parenMatch[1];
    if (!name || name === rawTicker) {
      name = parenMatch[2].trim();
    }
  }

  if (!name) {
    name = ticker;
  }

  return { ticker, name };
}

export function normalizeRawRow(raw: Record<string, unknown>, index: number): CoreStock {
  const cleanKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

  const getVal = (possibleKeys: string[]): unknown => {
    for (const k of possibleKeys) {
      const target = cleanKey(k);
      for (const [key, val] of Object.entries(raw)) {
        if (cleanKey(key) === target && val !== undefined && val !== null && String(val).trim() !== '') {
          return val;
        }
      }
    }

    for (const k of possibleKeys) {
      const target = cleanKey(k);
      for (const [key, val] of Object.entries(raw)) {
        const cleaned = cleanKey(key);
        if (cleaned.includes(target) && val !== undefined && val !== null && String(val).trim() !== '') {
          return val;
        }
      }
    }
    return undefined;
  };

  const rawTickerVal = String(
    getVal([
      'ticker', 'kode', 'saham', 'emiten', 'code', 'symbol', 'idx',
      'kodesaham', 'kodeemiten', 'kodeticker', 'tickersaham', 'emitenkode',
      'simbol', 'stockcode', 'stock'
    ]) || `STOCK${index + 1}`
  );

  const rawNameVal = String(
    getVal([
      'name', 'nama', 'perusahaan', 'company', 'perseroan', 'namaperusahaan',
      'namaemiten', 'namasaham', 'namalengkap', 'emitename'
    ]) || ''
  );

  const { ticker, name } = cleanTickerAndName(rawTickerVal, rawNameVal);

  const rawSector = (getVal(['sector', 'sektor', 'industri', 'industry', 'kategori', 'bidang', 'grup']) as string) || '';
  let sector: CoreStock['sector'] = 'Financials (Perbankan)';
  if (rawSector) {
    const sLow = rawSector.toLowerCase();
    if (sLow.includes('bank') || sLow.includes('finan')) sector = 'Financials (Perbankan)';
    else if (sLow.includes('non-cyc') || sLow.includes('konsumsi primer') || sLow.includes('makanan') || sLow.includes('fmcg')) sector = 'Consumer Non-Cyclical (Barang Konsumsi)';
    else if (sLow.includes('cyc') || sLow.includes('sekunder') || sLow.includes('retail') || sLow.includes('otomotif')) sector = 'Consumer Cyclical (Konsumsi Sekunder)';
    else if (sLow.includes('energi') || sLow.includes('tambang') || sLow.includes('coal') || sLow.includes('oil') || sLow.includes('gas') || sLow.includes('metal')) sector = 'Energy & Resources (Energi & Tambang)';
    else if (sLow.includes('industr') || sLow.includes('manufaktur')) sector = 'Industrial (Perindustrian)';
    else if (sLow.includes('infra') || sLow.includes('telko') || sLow.includes('telecom') || sLow.includes('tower')) sector = 'Infrastructure & Telco (Infrastruktur & Telko)';
    else if (sLow.includes('sehat') || sLow.includes('health') || sLow.includes('farma')) sector = 'Healthcare (Kesehatan)';
    else sector = rawSector;
  } else {
    if (['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS', 'BDMN', 'BBTN'].includes(ticker)) sector = 'Financials (Perbankan)';
    else if (['ICBP', 'INDF', 'UNVR', 'MYOR', 'KLBF', 'SIDO', 'CMRY'].includes(ticker)) sector = 'Consumer Non-Cyclical (Barang Konsumsi)';
    else if (['ASII', 'AUTO', 'ACES', 'MAPI', 'ERAA'].includes(ticker)) sector = 'Consumer Cyclical (Konsumsi Sekunder)';
    else if (['ADRO', 'PTBA', 'ITMG', 'ANTM', 'INCO', 'MDKA', 'PGAS', 'MEDC', 'AMMN'].includes(ticker)) sector = 'Energy & Resources (Energi & Tambang)';
    else if (['TLKM', 'ISAT', 'EXCL', 'TOWR', 'TBIG', 'JSMR'].includes(ticker)) sector = 'Infrastructure & Telco (Infrastruktur & Telko)';
    else if (['SMGR', 'INTP', 'UNTR', 'INKP', 'TKIM'].includes(ticker)) sector = 'Industrial (Perindustrian)';
  }

  const currentPrice = parseIndonesianNumber(
    getVal(['currentprice', 'harga', 'hargaterakhir', 'lastprice', 'price', 'close', 'cmp', 'hargapenutupan', 'closingprice', 'hargasaham', 'hargasaatini', 'last']),
    1000
  );

  const fairValue = parseIndonesianNumber(
    getVal(['fairvalue', 'hargawajar', 'fairprice', 'target', 'nilaiwajar', 'targetprice', 'targetharga', 'tp', 'intrinsicvalue', 'nilaiintrinsik', 'fv', 'intrinsic']),
    currentPrice > 0 ? Math.round(currentPrice * 1.2) : 1200
  );

  const rawMos = parseIndonesianNumber(getVal(['marginofsafety', 'mos', 'diskon', 'discount', 'upside', 'potensi', 'mospersen', 'mos%']));
  const marginOfSafety = rawMos !== 0 ? rawMos : (fairValue > 0 ? Number((((fairValue - currentPrice) / fairValue) * 100).toFixed(1)) : 0);

  let valuationStatus = (getVal(['valuationstatus', 'status', 'valuasi', 'statusvaluasi', 'kondisi', 'valuation']) as string) || '';
  if (!valuationStatus) {
    if (marginOfSafety >= 15) valuationStatus = 'Undervalued';
    else if (marginOfSafety <= -10) valuationStatus = 'Overvalued';
    else valuationStatus = 'Fair Value';
  }

  const buyLow = parseIndonesianNumber(getVal(['buyarealow', 'areabelibawah', 'buylow', 'support', 'entrylow', 'areabeli', 'buyzone', 'entry', 'support1', 's1']), Math.round(currentPrice * 0.95));
  const buyHigh = parseIndonesianNumber(getVal(['buyareahigh', 'areabeliatas', 'buyhigh', 'entryhigh', 'resistance', 'targetbeli', 'resistance1', 'r1']), currentPrice);
  const target = parseIndonesianNumber(getVal(['targetprice', 'targetharga', 'tp', 'target', 'tp1', 'tp2']), fairValue);

  const pe = parseIndonesianNumber(getVal(['peratio', 'per', 'pe', 'p/e', 'per(x)', 'per_x']), 12);
  const pbv = parseIndonesianNumber(getVal(['pbvratio', 'pbv', 'pb', 'p/bv', 'p/b', 'pbv(x)']), 1.5);
  const roe = parseIndonesianNumber(getVal(['roe', 'returnonequity', 'roe(%)', 'roepersen']), 15);
  const divYield = parseIndonesianNumber(getVal(['dividendyield', 'divyield', 'yield', 'dividend', 'div', 'div(%)', 'divyield(%)']), 4.0);
  const marketCap = parseIndonesianNumber(getVal(['marketcaptrillion', 'marketcap', 'kapitalisasi', 'mcap', 'kapitalisasipasar']), 100);

  const conviction = (getVal(['conviction', 'tier', 'kategori', 'klasifikasi', 'statuscore', 'priority']) as string) || 'Tier 1 (Core Utama)';
  const recommendation = (getVal(['recommendation', 'rekomendasi', 'action', 'saran', 'call', 'rating']) as string) || (marginOfSafety > 15 ? 'Strong Buy' : 'Buy on Weakness');
  const notes = (getVal(['notes', 'catatan', 'keterangan', 'analisis', 'komentar', 'deskripsi', 'alasan']) as string) || '';
  const catalysts = (getVal(['catalysts', 'katalis', 'driver', 'pemicu', 'prospek']) as string) || '';
  const lastUpdated = String(getVal(['lastupdated', 'tanggal', 'updated_at', 'terakhirupdate']) || new Date().toISOString().split('T')[0]);

  return {
    id: `${ticker.toLowerCase() || 'stock'}-${index}-${Date.now().toString(36)}`,
    ticker,
    name,
    sector: sector as CoreStock['sector'],
    currentPrice,
    fairValue,
    marginOfSafety,
    valuationStatus: valuationStatus as CoreStock['valuationStatus'],
    buyAreaLow: buyLow,
    buyAreaHigh: buyHigh,
    targetPrice: target,
    peRatio: pe,
    pbvRatio: pbv,
    roe,
    dividendYield: divYield,
    marketCapTrillion: marketCap,
    conviction: conviction as CoreStock['conviction'],
    recommendation: recommendation as CoreStock['recommendation'],
    catalysts,
    notes,
    lastUpdated,
  };
}

export interface ParseResult {
  stocks: CoreStock[];
  diagnostics: {
    totalRawRows: number;
    detectedHeaderRowIndex: number;
    delimiter: string;
    detectedHeaders: string[];
    validStocksCount: number;
    skippedRows: { line: number; reason: string; preview: string }[];
    tickers: string[];
  };
}

export function parseDelimitedTextToStocks(rawText: string): ParseResult {
  if (!rawText || !rawText.trim()) {
    throw new Error('Data spreadsheet kosong atau tidak ada teks yang dimasukkan.');
  }

  const firstLines = rawText.split(/\r?\n/).slice(0, 10).join('\n');
  const tabCount = (firstLines.match(/\t/g) || []).length;
  const commaCount = (firstLines.match(/,/g) || []).length;
  const semiCount = (firstLines.match(/;/g) || []).length;

  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  } else if (semiCount > commaCount && semiCount > tabCount) {
    delimiter = ';';
  }

  const grid: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    const nextChar = rawText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some((c) => c.length > 0)) {
        grid.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      grid.push(currentRow);
    }
  }

  if (grid.length === 0) {
    throw new Error('Tidak ada baris data yang terbaca dari teks spreadsheet.');
  }

  const headerKeywords = [
    'ticker', 'kode', 'saham', 'emiten', 'symbol', 'code', 'stock',
    'nama', 'name', 'perusahaan', 'company', 'sektor', 'sector',
    'harga', 'price', 'close', 'last', 'wajar', 'fair', 'target',
    'mos', 'margin', 'diskon', 'per', 'pbv', 'roe', 'yield', 'dividend', 'mcap'
  ];

  let headerRowIndex = 0;
  let maxKeywordMatches = 0;

  for (let r = 0; r < Math.min(grid.length, 15); r++) {
    const row = grid[r];
    let matches = 0;
    for (const cell of row) {
      const clean = cell.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (headerKeywords.some((kw) => clean.includes(kw))) {
        matches++;
      }
    }
    if (matches > maxKeywordMatches) {
      maxKeywordMatches = matches;
      headerRowIndex = r;
    }
  }

  const rawHeaders = grid[headerRowIndex].map((h) => h.replace(/^"|"$/g, '').trim());
  const cleanHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  let fallbackTickerCol = -1;
  const tickerColKeywords = ['ticker', 'kode', 'saham', 'emiten', 'symbol', 'code'];
  fallbackTickerCol = cleanHeaders.findIndex((h) => tickerColKeywords.some((k) => h.includes(k)));

  if (fallbackTickerCol === -1) {
    const colScores: number[] = new Array(rawHeaders.length).fill(0);
    for (let r = headerRowIndex + 1; r < Math.min(grid.length, headerRowIndex + 25); r++) {
      const row = grid[r];
      row.forEach((cell, cIdx) => {
        const clean = cell.replace(/\.JK$/i, '').replace(/^IDX:/i, '').trim().toUpperCase();
        if (/^[A-Z]{4}$/.test(clean)) {
          colScores[cIdx] = (colScores[cIdx] || 0) + 1;
        }
      });
    }
    const maxScore = Math.max(...colScores);
    if (maxScore > 0) {
      fallbackTickerCol = colScores.indexOf(maxScore);
    } else {
      fallbackTickerCol = 0;
    }
  }

  const skippedRows: { line: number; reason: string; preview: string }[] = [];
  const rawRowsObj: Record<string, unknown>[] = [];
  const detectedTickers: string[] = [];
  const seenTickers = new Set<string>();

  for (let r = headerRowIndex + 1; r < grid.length; r++) {
    const row = grid[r];
    const preview = row.slice(0, 4).join(' | ');

    if (row.every((cell) => cell === '')) {
      skippedRows.push({ line: r + 1, reason: 'Baris kosong', preview });
      continue;
    }

    let tickerVal = row[fallbackTickerCol] ? String(row[fallbackTickerCol]).trim().toUpperCase() : '';
    tickerVal = tickerVal.replace(/\.JK$/i, '').replace(/^IDX:/i, '').replace(/^[0-9]+[\.\-\s)]+/, '').trim();

    const isSummary = ['TOTAL', 'JUMLAH', 'AVERAGE', 'RATA-RATA', 'MAX', 'MIN', 'SUBTOTAL', 'KODE', 'TICKER'].includes(tickerVal);
    if (isSummary) {
      skippedRows.push({ line: r + 1, reason: `Baris ringkasan / header berulang (${tickerVal})`, preview });
      continue;
    }

    if (!tickerVal || tickerVal.length < 2 || tickerVal.length > 10) {
      let altTicker = '';
      for (const cell of row.slice(0, 3)) {
        const candidate = cell.replace(/\.JK$/i, '').replace(/^IDX:/i, '').replace(/^[0-9]+[\.\-\s)]+/, '').trim().toUpperCase();
        if (/^[A-Z]{4}$/.test(candidate)) {
          altTicker = candidate;
          break;
        }
      }
      if (!altTicker) {
        skippedRows.push({ line: r + 1, reason: 'Tidak ditemukan kode saham/emiten yang valid', preview });
        continue;
      }
      tickerVal = altTicker;
    }

    if (seenTickers.has(tickerVal)) {
      skippedRows.push({ line: r + 1, reason: `Duplikasi ticker ${tickerVal} dilewati`, preview });
      continue;
    }
    seenTickers.add(tickerVal);
    detectedTickers.push(tickerVal);

    const rowObj: Record<string, unknown> = {
      ticker: tickerVal,
    };

    cleanHeaders.forEach((h, cIdx) => {
      if (h && cIdx < row.length) {
        rowObj[h] = row[cIdx];
      }
    });

    rawRowsObj.push(rowObj);
  }

  if (rawRowsObj.length === 0) {
    throw new Error(
      `Tidak ada emiten yang berhasil dibaca. Pastikan spreadsheet memiliki kolom kode saham. Baris terdeteksi: ${grid.length}.`
    );
  }

  const stocks = rawRowsObj.map((r, idx) => normalizeRawRow(r, idx));

  return {
    stocks,
    diagnostics: {
      totalRawRows: grid.length,
      detectedHeaderRowIndex: headerRowIndex + 1,
      delimiter: delimiter === '\t' ? 'Tab (Google Sheets / Excel Paste)' : delimiter === ';' ? 'Semicolon (;)' : 'Comma (,)',
      detectedHeaders: rawHeaders.filter(Boolean),
      validStocksCount: stocks.length,
      skippedRows,
      tickers: detectedTickers,
    },
  };
}

export function parseCSVToStocks(csvText: string): CoreStock[] {
  const result = parseDelimitedTextToStocks(csvText);
  return result.stocks;
}

export async function fetchFromGoogleSheet(sheetIdOrUrl?: string, sheetGid?: string): Promise<CoreStock[]> {
  const target = (sheetIdOrUrl && sheetIdOrUrl.trim()) || DEFAULT_SHEET_ID;
  const targetGid = (sheetGid && sheetGid.trim()) || DEFAULT_SHEET_GID;

  let sheetId = target.trim();
  const matchId = sheetId.match(/\/d\/([a-zA-Z0-9_-]+)/) || sheetId.match(/^([a-zA-Z0-9_-]{20,})/);
  if (matchId) {
    sheetId = matchId[1];
  }

  let gidsToFetch = [targetGid];
  if (targetGid.includes(',')) {
    gidsToFetch = targetGid.split(',').map((g) => g.trim()).filter(Boolean);
  } else {
    const matchGid = target.match(/gid=([0-9]+)/);
    if (matchGid) {
      gidsToFetch = [matchGid[1]];
    }
  }

  const allMergedStocks: CoreStock[] = [];
  const seenTickers = new Set<string>();

  for (const gid of gidsToFetch) {
    const endpoint = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`;
    const res = await fetch(endpoint);

    if (!res.ok) {
      if (gidsToFetch.length > 1) continue;
      throw new Error(`Gagal memuat Google Sheet (HTTP ${res.status}): ${res.statusText}`);
    }

    const csvText = await res.text();
    if (csvText.includes('accounts.google.com') || csvText.includes('Sign in to your Google Account')) {
      throw new Error(
        `Google Sheet Anda (${sheetId}) masih berstatus Private. Silakan buka Google Sheet Anda, klik 'Bagikan' (Share), lalu ubah Akses Umum menjadi 'Siapa saja yang memiliki link'.`
      );
    }

    try {
      const parsed = parseCSVToStocks(csvText);
      parsed.forEach((s) => {
        if (!seenTickers.has(s.ticker)) {
          seenTickers.add(s.ticker);
          allMergedStocks.push(s);
        }
      });
    } catch (err) {
      if (gidsToFetch.length === 1) throw err;
    }
  }

  if (allMergedStocks.length === 0) {
    throw new Error('Tidak ada emiten yang ditemukan dalam sheet tersebut.');
  }

  return allMergedStocks;
}

export async function fetchFromGoogleScript(webAppUrl: string): Promise<CoreStock[]> {
  if (!webAppUrl || !webAppUrl.trim()) {
    throw new Error('URL Google Apps Script belum diisi');
  }

  const cleanUrl = webAppUrl.trim();
  const response = await fetch(cleanUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  let rawList: Record<string, unknown>[] = [];

  if (Array.isArray(data)) {
    rawList = data;
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) {
      rawList = data.data;
    } else if (Array.isArray(data.stocks)) {
      rawList = data.stocks;
    } else if (Array.isArray(data.rows)) {
      rawList = data.rows;
    } else if (Array.isArray(data.items)) {
      rawList = data.items;
    }
  }

  if (rawList.length === 0) {
    throw new Error('Data berhasil diambil namun tidak ditemukan daftar saham yang valid dalam respon.');
  }

  const normalized = rawList.map((item, index) => normalizeRawRow(item, index));
  return normalized;
}

export async function pushToGoogleScript(webAppUrl: string, stocks: CoreStock[]): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.trim()) {
    throw new Error('URL Google Apps Script belum diisi');
  }

  const cleanUrl = webAppUrl.trim();
  const response = await fetch(cleanUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'syncAll',
      stocks: stocks,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error saat sync: ${response.status} ${response.statusText}`);
  }

  return true;
}

export function exportToCSV(stocks: CoreStock[]): void {
  const headers = [
    'Kode', 'Nama Perusahaan', 'Sektor', 'Harga Terakhir (Rp)', 'Harga Wajar / Fair Value (Rp)',
    'Margin of Safety (%)', 'Status Valuasi', 'Area Beli Bawah', 'Area Beli Atas', 'Target Harga',
    'PER', 'PBV', 'ROE (%)', 'Dividend Yield (%)', 'Market Cap (Rp Triliun)', 'Kategori Core',
    'Rekomendasi', 'Catatan / Analisis', 'Terakhir Update',
  ];

  const rows = stocks.map((s) => [
    `"${s.ticker}"`,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.sector}"`,
    s.currentPrice,
    s.fairValue,
    s.marginOfSafety,
    `"${s.valuationStatus}"`,
    s.buyAreaLow,
    s.buyAreaHigh,
    s.targetPrice,
    s.peRatio,
    s.pbvRatio,
    s.roe,
    s.dividendYield,
    s.marketCapTrillion,
    `"${s.conviction}"`,
    `"${s.recommendation}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
    `"${s.lastUpdated}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `database_saham_core_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(stocks: CoreStock[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stocks, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `database_saham_core_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const IDX_TICKER_NAMES: Record<string, string> = {
  BBCA: 'Bank Central Asia Tbk',
  BBRI: 'Bank Rakyat Indonesia Tbk',
  BMRI: 'Bank Mandiri Tbk',
  BBNI: 'Bank Negara Indonesia Tbk',
  BBTN: 'Bank Tabungan Negara Tbk',
  BDMN: 'Bank Danamon Indonesia Tbk',
  BRIS: 'Bank Syariah Indonesia Tbk',
  MEGA: 'Bank Mega Tbk',
  BJBR: 'Bank BJB Tbk',
  BJTM: 'Bank Jatim Tbk',
  NISP: 'Bank OCBC NISP Tbk',
  ASII: 'Astra International Tbk',
  TLKM: 'Telkom Indonesia Tbk',
  ISAT: 'Indosat Ooredoo Hutchison Tbk',
  EXCL: 'XL Axiata Tbk',
  ICBP: 'Indofood CBP Sukses Makmur Tbk',
  INDF: 'Indofood Sukses Makmur Tbk',
  UNVR: 'Unilever Indonesia Tbk',
  MYOR: 'Mayora Indah Tbk',
  KLBF: 'Kalbe Farma Tbk',
  SIDO: 'Industri Jamu Sido Muncul Tbk',
  ADRO: 'Adaro Energy Indonesia Tbk',
  PTBA: 'Bukit Asam Tbk',
  ITMG: 'Indo Tambangraya Megah Tbk',
  PGAS: 'Perusahaan Gas Negara Tbk',
  MEDC: 'Medco Energi Internasional Tbk',
  AKRA: 'AKR Corporindo Tbk',
  AMMN: 'Amman Mineral Internasional Tbk',
  BREN: 'Barito Renewables Energy Tbk',
  BRPT: 'Barito Pacific Tbk',
  TPIA: 'Chandra Asri Pacific Tbk',
  ANTM: 'Aneka Tambang Tbk',
  INCO: 'Vale Indonesia Tbk',
  MDKA: 'Merdeka Copper Gold Tbk',
  MBMA: 'Merdeka Battery Materials Tbk',
  SMGR: 'Semen Indonesia Tbk',
  INTP: 'Indocement Tunggal Prakarsa Tbk',
  ACES: 'Aspirasi Hidup Indonesia Tbk',
  MAPI: 'Mitra Adiperkasa Tbk',
  MAPA: 'MAP Aktif Adiperkasa Tbk',
  ERAA: 'Erajaya Swasembada Tbk',
  CPIN: 'Charoen Pokphand Indonesia Tbk',
  JPFA: 'Japfa Comfeed Indonesia Tbk',
  GOTO: 'GoTo Gojek Tokopedia Tbk',
  BUKA: 'Bukalapak.com Tbk',
  MTEL: 'Dayamitra Telekomunikasi Tbk',
  TOWR: 'Sarana Menara Nusantara Tbk',
  TBIG: 'Tower Bersama Infrastructure Tbk',
  PWON: 'Pakuwon Jati Tbk',
  BSDE: 'Bumi Serpong Damai Tbk',
  CTRA: 'Ciputra Development Tbk',
  SMRA: 'Summarecon Agung Tbk',
  DMAS: 'Puradelta Lestari Tbk',
  SSIA: 'Surya Semesta Internusa Tbk',
  ARNA: 'Arwana Citramulia Tbk',
  SMDR: 'Samudera Indonesia Tbk',
  TMAS: 'Temas Tbk',
  BIRD: 'Blue Bird Tbk',
  ASSA: 'Adi Sarana Armada Tbk',
  GIAA: 'Garuda Indonesia Tbk',
  UNTR: 'United Tractors Tbk',
  HEXA: 'Hexindo Adiperkasa Tbk',
  MARK: 'Mark Dynamics Indonesia Tbk',
  WSKT: 'Waskita Karya Tbk',
  PTPP: 'PP (Persero) Tbk',
  WIKA: 'Wijaya Karya Tbk',
  ADHI: 'Adhi Karya Tbk',
};

export async function loadScreener(
  filter = 'ALL',
  customApiUrl?: string
): Promise<{ success: boolean; data: QuantStock[]; message?: string }> {
  const targetUrl = (customApiUrl && customApiUrl.trim()) || getGoogleScriptConfig().webAppUrl || USER_DEPLOYED_URL;

  try {
    const directUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=screener&filter=${encodeURIComponent(filter)}`;
    const res = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const json = await res.json();
      if (json && (json.success || Array.isArray(json.data) || Array.isArray(json))) {
        const rawList = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        const stocks = transformRawScreenerData(rawList, filter);
        return { success: true, data: stocks };
      }
    }
  } catch (directErr) {
    console.warn('Gagal memuat screener dari proxy:', directErr);
  }

  return { success: false, data: [], message: 'Gagal memuat data screener.' };
}

function transformRawScreenerData(rawList: Record<string, any>[], activeFilter: string): QuantStock[] {
  return rawList.map((item, idx) => {
    const ticker = String(item.ticker || item.code || item.saham || item.kode || `IDX${idx + 1}`)
      .trim()
      .toUpperCase()
      .replace(/\.JK$/i, '')
      .replace(/^IDX:/i, '');

    const close = Number(item.close || item.harga || item.price || item.last || 0);
    const prevClose = Number(item.prev_close || item.previousClose || close);
    const changePct = typeof item.change_pct === 'number'
      ? item.change_pct
      : prevClose > 0
      ? parseFloat((((close - prevClose) / prevClose) * 100).toFixed(2))
      : 0;

    const valueIdr = Number(item.value_idr || item.value || item.transaksi || (close * (item.volume || 1000000)));
    const volume = Number(item.volume || 0);
    const rsi = Number(item.rsi_14 ?? item.rsi ?? 50);

    const ma20 = item.ma20 ? Number(item.ma20) : undefined;
    const ma50 = item.ma50 ? Number(item.ma50) : undefined;
    const ma200 = item.ma200 ? Number(item.ma200) : undefined;
    const macd = item.macd !== undefined ? Number(item.macd) : undefined;
    const macdSignal = item.macd_signal !== undefined ? Number(item.macd_signal) : undefined;
    const supportLvl = item.support_lvl !== undefined ? Number(item.support_lvl) : undefined;
    const dividendYield = item.dividend_yield !== undefined ? Number(item.dividend_yield) : 0;

    let maStatus = 'Netral / Sideways';
    if (ma20 && ma50 && ma200) {
      if (close > ma20 && ma20 > ma50 && ma50 > ma200) {
        maStatus = 'Bullish Strong (> MA20, 50, 200)';
      } else if (close > ma20 && close > ma50) {
        maStatus = 'Uptrend (> MA20 & MA50)';
      } else if (close < ma20 && close < ma50 && close < ma200) {
        maStatus = 'Bearish (< MA20, 50, 200)';
      } else if (close < ma20 && close >= ma200) {
        maStatus = 'Pullback Support MA200';
      }
    } else if (close > prevClose) {
      maStatus = 'Positive Momentum';
    }

    let strategy = 'ALL';
    if (rsi < 42 || (supportLvl && close <= supportLvl * 1.02)) {
      strategy = 'BUY_ON_WEAKNESS';
    } else if (macd !== undefined && macdSignal !== undefined && macd > macdSignal && changePct > 1.2) {
      strategy = 'GOLDEN_CROSS';
    } else if (changePct > 2.0 && volume > 20000000) {
      strategy = 'SCALPING';
    } else if (dividendYield >= 2.5) {
      strategy = 'DIVIDEND_PLAY';
    } else if (close > (ma20 || close)) {
      strategy = 'SWING';
    }

    const companyName = item.name || IDX_TICKER_NAMES[ticker] || `${ticker} Tbk`;

    return {
      ticker,
      name: companyName,
      close,
      prev_close: prevClose,
      change_pct: changePct,
      value_idr: valueIdr,
      rsi_14: rsi,
      ma20,
      ma50,
      ma200,
      ma_status: maStatus,
      macd,
      macd_signal: macdSignal,
      support_lvl: supportLvl,
      dividend_yield: dividendYield,
      strategy,
      volume,
      high: item.high || close * 1.02,
      low: item.low || close * 0.98,
    };
  });
}

// 2. Login User ke Google Apps Script via Cloudflare Proxy
export async function userLogin(
  email: string,
  password: string,
  customApiUrl?: string
): Promise<{ success: boolean; user?: any; name?: string; role?: string; token?: string; message?: string }> {
  const targetUrl = (customApiUrl && customApiUrl.trim()) || getGoogleScriptConfig().webAppUrl || USER_DEPLOYED_URL;
  const endpoint = targetUrl.includes('?') ? `${targetUrl}&action=login` : `${targetUrl}?action=login`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email: email.trim().toLowerCase(),
        password: password.trim(),
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return json;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Gagal memverifikasi login: ${msg}` };
  }
}

// User Session Management (Strict Mode)
export function saveUserSession(user: { email: string; name?: string; role?: string; isVip?: boolean; token?: string }): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to save user session', e);
  }
}

export function getUserSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Hanya valid jika memiliki token otentikasi dari backend
    if (user && user.email && user.token) {
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem('idx_user_session_v1');
    localStorage.removeItem('lapin_user_session');
    localStorage.removeItem('lapin_user');
    localStorage.removeItem('lapin_token');
  } catch (e) {
    console.warn('Failed to clear user session', e);
  }
}
