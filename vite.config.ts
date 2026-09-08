import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function marketDataPlugin(): Plugin {
  return {
    name: 'market-data-api',
    configureServer(server) {
      server.middlewares.use('/api/market-data', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const tickersParam = url.searchParams.get('tickers') || '^JKSE,BBCA,BBRI,BMRI,BBNI,ASII,TLKM,ICBP,INDF,UNVR,ADRO,PTBA,AMMN,BREN,BRPT,ANTM,KLBF,ACES';
          const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);

          const quotes: Record<string, any> = {};

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
                    quotes[ticker] = {
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
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = response.status;
            res.end(text);
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
