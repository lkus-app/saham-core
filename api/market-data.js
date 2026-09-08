export default async function handler(req, res) {
  try {
    const tickersParam = req.query.tickers || '^JKSE,BBCA,BBRI,BMRI,BBNI,ASII,TLKM,ICBP,INDF,UNVR,ADRO,PTBA,AMMN,BREN,BRPT,ANTM,KLBF,ACES';
    const tickers = tickersParam.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);

    const quotes = {};

    await Promise.all(
      tickers.map(async (ticker) => {
        const symbol = ticker.startsWith('^') ? ticker : `${ticker}.JK`;
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                Accept: 'application/json',
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
          // ignore per ticker error
        }
      })
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      status: 'ok',
      data: quotes,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: String(err) });
  }
}
