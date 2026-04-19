const express = require('express');
const Database = require('better-sqlite3');
const crypto = require('crypto');

const app = express();
const db = new Database('/app/data/visits.db');

db.exec(`CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT,
  page TEXT,
  referrer TEXT,
  visitor_hash TEXT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static('/app/public'));

function parseReferrer(ref) {
  if (!ref) return 'direct';
  try {
    return new URL(ref).hostname.replace(/^www\./, '');
  } catch {
    return 'direct';
  }
}

// Track a visit
app.post('/track', (req, res) => {
  const { page, site } = req.body;
  const referrer = parseReferrer(req.body.referrer);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const visitor_hash = crypto
    .createHash('sha256')
    .update(ip + (req.headers['user-agent'] || ''))
    .digest('hex');

  db.prepare(
    'INSERT INTO visits (site, page, referrer, visitor_hash) VALUES (?, ?, ?, ?)'
  ).run(site || 'unknown', page || '/', referrer, visitor_hash);

  res.json({ ok: true });
});

// Unique visitor count — optionally filtered by site
app.get('/count', (req, res) => {
  const { site } = req.query;
  const { count } = site
    ? db.prepare('SELECT COUNT(DISTINCT visitor_hash) as count FROM visits WHERE site = ?').get(site)
    : db.prepare('SELECT COUNT(DISTINCT visitor_hash) as count FROM visits').get();
  res.json({ count });
});

// Full stats dashboard — nested by site
app.get('/dashboard', (req, res) => {
  const sites = db.prepare('SELECT DISTINCT site FROM visits').all().map(r => r.site);

  const result = sites.map(site => {
    const { total_hits } = db.prepare(
      'SELECT COUNT(*) as total_hits FROM visits WHERE site = ?'
    ).get(site);

    const { total_unique } = db.prepare(
      'SELECT COUNT(DISTINCT visitor_hash) as total_unique FROM visits WHERE site = ?'
    ).get(site);

    const sources = db.prepare(`
      SELECT referrer as source,
        COUNT(DISTINCT visitor_hash) AS unique_visitors,
        COUNT(*) AS hits
      FROM visits
      WHERE site = ?
      GROUP BY referrer
      ORDER BY hits DESC
    `).all(site);

    const pages = db.prepare(`
      SELECT page,
        COUNT(DISTINCT visitor_hash) AS unique_visitors,
        COUNT(*) AS hits
      FROM visits
      WHERE site = ?
      GROUP BY page
      ORDER BY hits DESC
    `).all(site);

    return { site, total_hits, total_unique, sources, pages };
  });

  res.json(result);
});

app.listen(3000, '0.0.0.0', () => console.log('korgostats running on :3000'));
