export default async function handler(req, res) {
  try {
    const rawInput = req.query.sheetId || req.query.url || '1uVVRVlZBFQAMPmMMvw4BcXPE3TbEHUERRqzkC7QY4x0';
    let gid = req.query.gid || '2051754762';

    // Extract sheetId if full URL was provided
    let sheetId = rawInput;
    const matchId = String(rawInput).match(/\/d\/([a-zA-Z0-9_-]+)/) || String(rawInput).match(/^([a-zA-Z0-9_-]{20,})/);
    if (matchId) {
      sheetId = matchId[1];
    }
    const matchGid = String(rawInput).match(/gid=([0-9]+)/);
    if (matchGid && !req.query.gid) {
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
      return res.status(403).json({
        status: 'restricted',
        sheetId,
        gid,
        message:
          'Google Sheet Anda saat ini berstatus Akses Terbatas (Private). Silakan buka Google Sheet Anda, klik tombol "Bagikan" (Share) di pojok kanan atas, lalu ubah Akses Umum menjadi "Siapa saja yang memiliki link" (Anyone with the link can view).',
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ status: 'error', message: String(err) });
  }
}
