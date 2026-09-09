import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function marketDataPlugin(): Plugin {
  // Shared in-memory market quote cache for all IDX tickers
  const serverMarketQuotes: Record<string, any> = {
    MBMA: { ticker: 'MBMA', price: 545, previousClose: 510, change: 35, changePct: 6.86, volume: 176299400 },
    BUMI: { ticker: 'BUMI', price: 142, previousClose: 139, change: 3, changePct: 2.16, volume: 450120000 },
    DEWA: { ticker: 'DEWA', price: 98, previousClose: 96, change: 2, changePct: 2.08, volume: 189000000 },
    ENRG: { ticker: 'ENRG', price: 220, previousClose: 218, change: 2, changePct: 0.92, volume: 65400000 },
    DOID: { ticker: 'DOID', price: 575, previousClose: 565, change: 10, changePct: 1.77, volume: 42100000 },
    BUKA: { ticker: 'BUKA', price: 124, previousClose: 122, change: 2, changePct: 1.64, volume: 92400000 },
    GOTO: { ticker: 'GOTO', price: 52, previousClose: 51, change: 1, changePct: 1.96, volume: 380500000 },
    ACES: { ticker: 'ACES', price: 835, previousClose: 825, change: 10, changePct: 1.21, volume: 31200000 },
    WIFI: { ticker: 'WIFI', price: 280, previousClose: 274, change: 6, changePct: 2.19, volume: 24500000 },
    KIJA: { ticker: 'KIJA', price: 168, previousClose: 165, change: 3, changePct: 1.82, volume: 18700000 },
  };

  return {
    name: 'market-data-api',
    configureServer(server) {
      server.middlewares.use('/api/market-data', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const tickersParam = url.searchParams.get('tickers') || '^JKSE,BBCA,BBRI,BMRI,BBNI,ASII,TLKM,ICBP,INDF,UNVR,ADRO,PTBA,AMMN,BREN,BRPT,ANTM,KLBF,ACES,MBMA,BUMI,DEWA,ENRG,DOID';
          const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);

          const quotes: Record<string, any> = { ...serverMarketQuotes };

          await Promise.all(
            tickers.map(async (ticker) => {
              const symbol = ticker.startsWith('^') ? ticker : `${ticker}.JK`;
              try {
                const response = await fetch(
                  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
                  {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                      'Accept': 'application/json',
                    },
                  }
                );

                if (response.ok) {
                  const data = await response.json();
                  const meta = data?.chart?.result?.[0]?.meta;
                  if (meta && typeof meta.regularMarketPrice === 'number') {
                    const price = meta.regularMarketPrice;
                    const prev = meta.chartPreviousClose || price;
                    const chg = ((price - prev) / prev) * 100;
                    const quoteObj = {
                      ticker,
                      price,
                      previousClose: prev,
                      change: price - prev,
                      changePct: parseFloat(chg.toFixed(2)),
                      high: meta.regularMarketDayHigh || price,
                      low: meta.regularMarketDayLow || price,
                      volume: meta.regularMarketVolume || 0,
                      timestamp: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
                    };
                    quotes[ticker] = quoteObj;
                    serverMarketQuotes[ticker] = quoteObj;
                  }
                }
              } catch (e) {
                // Silently skip
              }
            })
          );

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'ok', data: quotes, updatedAt: new Date().toISOString() }));
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'error', message: String(err) }));
        }
      });

      server.middlewares.use('/api/sheet-data', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const rawInput = url.searchParams.get('sheetId') || url.searchParams.get('url') || '1uVVRVlZBFQAMPmMMvw4BcXPE3TbEHUERRqzkC7QY4x0';
          let gid = url.searchParams.get('gid') || '2051754762';

          let sheetId = rawInput;
          const matchId = String(rawInput).match(/\/d\/([a-zA-Z0-9_-]+)/) || String(rawInput).match(/^([a-zA-Z0-9_-]{20,})/);
          if (matchId) {
            sheetId = matchId[1];
          }
          const matchGid = String(rawInput).match(/gid=([0-9]+)/);
          if (matchGid && !url.searchParams.get('gid')) {
            gid = matchGid[1];
          }

          const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          const response = await fetch(csvUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          const text = await response.text();

          if (text.includes('accounts.google.com') || text.includes('ServiceLogin') || text.includes('Sign in to your Google Account')) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 403;
            res.end(
              JSON.stringify({
                status: 'restricted',
                sheetId,
                gid,
                message:
                  'Google Sheet Anda saat ini berstatus Akses Terbatas (Private). Silakan buka Google Sheet Anda, klik tombol "Bagikan" (Share) di pojok kanan atas, lalu ubah Akses Umum menjadi "Siapa saja yang memiliki link" (Anyone with the link can view).',
              })
            );
            return;
          }

          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          res.end(text);
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'error', message: String(err) }));
        }
      });

      server.middlewares.use('/api/market-chart', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const rawTicker = (url.searchParams.get('ticker') || 'BBCA').trim().toUpperCase();
          const range = url.searchParams.get('range') || '3mo';
          const interval = url.searchParams.get('interval') || '1d';
          const cleanTicker = rawTicker.replace('.JK', '');
          const symbol = cleanTicker.startsWith('^') ? cleanTicker : `${cleanTicker}.JK`;

          const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
          const response = await fetch(yahooUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              Accept: 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Yahoo Finance status ${response.status}`);
          }

          const json = await response.json();
          const result = json?.chart?.result?.[0];
          if (!result) {
            throw new Error('No chart data returned for ' + cleanTicker);
          }

          const meta = result.meta || {};
          const timestamps = result.timestamp || [];
          const quote = result.indicators?.quote?.[0] || {};
          const rawCloses = quote.close || [];
          const rawOpens = quote.open || [];
          const rawHighs = quote.high || [];
          const rawLows = quote.low || [];
          const rawVolumes = quote.volume || [];

          const bars = [];
          for (let i = 0; i < timestamps.length; i++) {
            const c = rawCloses[i];
            if (c !== null && c !== undefined && !isNaN(c)) {
              const d = new Date(timestamps[i] * 1000);
              const day = String(d.getDate()).padStart(2, '0');
              const month = d.toLocaleDateString('id-ID', { month: 'short' });
              const closeVal = Math.round(c);
              const openVal = rawOpens[i] !== null && rawOpens[i] !== undefined && !isNaN(rawOpens[i])
                ? Math.round(rawOpens[i])
                : (i > 0 && rawCloses[i - 1] ? Math.round(rawCloses[i - 1]) : closeVal);
              const highVal = Math.max(Math.round(rawHighs[i] ?? c), openVal, closeVal);
              const lowVal = Math.min(Math.round(rawLows[i] ?? c), openVal, closeVal);

              bars.push({
                date: `${day} ${month}`,
                timestamp: timestamps[i] * 1000,
                open: openVal,
                high: highVal,
                low: lowVal,
                close: closeVal,
                volume: rawVolumes[i] ?? 0,
              });
            }
          }

          if (bars.length === 0) {
            throw new Error('No valid price bars');
          }

          const labels = bars.map(b => b.date);
          const prices = bars.map(b => b.close);
          const volumes = bars.map(b => b.volume);

          function calcSMA(data, period) {
            return data.map((val, idx) => {
              if (idx < period - 1) {
                const slice = data.slice(0, idx + 1);
                return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
              }
              const slice = data.slice(idx - period + 1, idx + 1);
              return Math.round(slice.reduce((a, b) => a + b, 0) / period);
            });
          }

          function calcRSI(data, period = 14) {
            const rsi = [];
            let gains = 0;
            let losses = 0;
            for (let i = 0; i < data.length; i++) {
              if (i === 0) {
                rsi.push(50);
                continue;
              }
              const diff = data[i] - data[i - 1];
              const gain = diff > 0 ? diff : 0;
              const loss = diff < 0 ? Math.abs(diff) : 0;
              if (i <= period) {
                gains += gain;
                losses += loss;
                if (i === period) {
                  let avgGain = gains / period;
                  let avgLoss = losses / period;
                  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                  rsi.push(Math.round(100 - (100 / (1 + rs))));
                } else {
                  rsi.push(50);
                }
              } else {
                let avgGain = (gains * (period - 1) + gain) / period;
                let avgLoss = (losses * (period - 1) + loss) / period;
                gains = avgGain;
                losses = avgLoss;
                let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                rsi.push(Math.round(100 - (100 / (1 + rs))));
              }
            }
            return rsi;
          }

          function calcEMA(data, period) {
            const k = 2 / (period + 1);
            const ema = [];
            let prev = data[0];
            ema.push(prev);
            for (let i = 1; i < data.length; i++) {
              prev = data[i] * k + prev * (1 - k);
              ema.push(prev);
            }
            return ema;
          }

          const ema12 = calcEMA(prices, 12);
          const ema26 = calcEMA(prices, 26);
          const macdLine = ema12.map((val, i) => val - ema26[i]);
          const signalLine = calcEMA(macdLine, 9);
          const macdHist = macdLine.map((val, i) => parseFloat((val - signalLine[i]).toFixed(1)));

          const ma20 = calcSMA(prices, 20);
          const ma50 = calcSMA(prices, 50);
          const ma200 = calcSMA(prices, 200);
          const rsi = calcRSI(prices, 14);

          const currentPrice = meta.regularMarketPrice ?? prices[prices.length - 1];
          const prevClose = meta.chartPreviousClose ?? prices[prices.length - 2] ?? currentPrice;
          const change = currentPrice - prevClose;
          const changePct = prevClose !== 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;
          const currentVol = meta.regularMarketVolume || volumes[volumes.length - 1] || 0;

          // Save to server-wide quote cache
          serverMarketQuotes[cleanTicker] = {
            ticker: cleanTicker,
            price: currentPrice,
            previousClose: prevClose,
            change,
            changePct,
            high: meta.regularMarketDayHigh || Math.max(...prices.slice(-5)),
            low: meta.regularMarketDayLow || Math.min(...prices.slice(-5)),
            volume: currentVol,
            timestamp: Date.now(),
          };

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            ticker: cleanTicker,
            currency: meta.currency || 'IDR',
            currentPrice,
            previousClose: prevClose,
            change,
            changePct,
            labels,
            prices,
            ohlc: bars.map(b => ({
              open: b.open,
              high: b.high,
              low: b.low,
              close: b.close,
              date: b.date
            })),
            volumes,
            ma20,
            ma50,
            ma200,
            rsi,
            macdHist,
            macdLine: macdLine.map(v => parseFloat(v.toFixed(1))),
            signalLine: signalLine.map(v => parseFloat(v.toFixed(1))),
            high: meta.regularMarketDayHigh || Math.max(...prices.slice(-5)),
            low: meta.regularMarketDayLow || Math.min(...prices.slice(-5)),
            volume: currentVol,
            updatedAt: new Date().toISOString(),
          }));
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, message: String(err.message || err) }));
        }
      });

      server.middlewares.use('/api/apps-script', async (req, res) => {
        const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxp569_Wia0XPhzP81dSCcUte5kaK0nW2yM6GbpXYh5EeYsqwr-SiK_50M_qBeGUK1FfQ/exec';
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const targetUrl = urlObj.searchParams.get('url') || DEFAULT_API_URL;

          if (req.method === 'GET') {
            const destUrl = new URL(targetUrl);
            urlObj.searchParams.forEach((val, key) => {
              if (key !== 'url') {
                destUrl.searchParams.set(key, val);
              }
            });

            const response = await fetch(destUrl.toString(), {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
              redirect: 'follow',
            });

            const text = await response.text();
            let finalText = text;
            try {
              const json = JSON.parse(text);
              if (json && json.success && Array.isArray(json.data)) {
                json.data = json.data.map((item: any) => {
                  const t = (item.ticker || '').toUpperCase().trim();
                  if (serverMarketQuotes[t]) {
                    const q = serverMarketQuotes[t];
                    item.close = q.price;
                    item.price = q.price;
                    item.change = q.changePct;
                    item.change_pct = q.changePct;
                    item.change_percent = q.changePct;
                    item.changePercent = q.changePct;
                    item.volume = q.volume;
                    item.support = Math.round(q.price * 0.96);
                    item.support_lvl = Math.round(q.price * 0.96);
                    item.supportLvl = Math.round(q.price * 0.96);
                  }
                  return item;
                });
                finalText = JSON.stringify(json);
              }
            } catch (e) {
              // pass through raw text
            }

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = response.status;
            res.end(finalText);
            return;
          }

          if (req.method === 'POST') {
            let rawBody = '';
            for await (const chunk of req) {
              rawBody += chunk;
            }

            const response = await fetch(targetUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
              body: rawBody,
              redirect: 'follow',
            });

            const text = await response.text();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = response.status;
            res.end(text);
            return;
          }

          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: String(err) }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), marketDataPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
