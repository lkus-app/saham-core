const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxp569_Wia0XPhzP81dSCcUte5kaK0nW2yM6GbpXYh5EeYsqwr-SiK_50M_qBeGUK1FfQ/exec';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const targetUrl = req.query.url || DEFAULT_API_URL;

    if (req.method === 'GET') {
      const urlObj = new URL(targetUrl);
      // Forward all query parameters except 'url'
      Object.entries(req.query).forEach(([key, val]) => {
        if (key !== 'url' && val !== undefined) {
          urlObj.searchParams.set(key, String(val));
        }
      });

      const response = await fetch(urlObj.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'follow',
      });

      const text = await response.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(response.status).send(text);
    }

    if (req.method === 'POST') {
      const bodyPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: bodyPayload,
        redirect: 'follow',
      });

      const text = await response.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(response.status).send(text);
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ success: false, message: String(err) });
  }
}
