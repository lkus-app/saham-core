export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawTicker = (req.query.ticker || 'BBCA').trim().toUpperCase();
    const range = req.query.range || '3mo'; // 1mo, 3mo, 6mo, 1y
    const interval = req.query.interval || '1d';
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
      throw new Error(`Yahoo Finance responded with status ${response.status}`);
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];
    if (!result) {
      throw new Error('No chart data returned for ticker ' + cleanTicker);
    }

    const meta = result.meta || {};
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const rawCloses = quote.close || [];
    const rawOpens = quote.open || [];
    const rawHighs = quote.high || [];
    const rawLows = quote.low || [];
    const rawVolumes = quote.volume || [];

    // Filter valid bars
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

    // Calculate Moving Averages (Simple MA)
    function calcSMA(data, period) {
      return data.map((val, idx) => {
        if (idx < period - 1) {
          // Approximate with available data or null
          const slice = data.slice(0, idx + 1);
          return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
        }
        const slice = data.slice(idx - period + 1, idx + 1);
        return Math.round(slice.reduce((a, b) => a + b, 0) / period);
      });
    }

    // Calculate RSI (14)
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
          let prevRsi = rsi[i - 1];
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

    // Calculate EMA
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

    // Calculate MACD (12, 26, 9)
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

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({
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
      volume: meta.regularMarketVolume || volumes[volumes.length - 1] || 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      message: String(err.message || err),
    });
  }
}
