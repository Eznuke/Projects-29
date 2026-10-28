/**
 * Dinding Pesan bersama untuk X-C Portal (Vercel Serverless Function).
 * Pesan disimpan di Upstash Redis (gratis) supaya tampil di semua perangkat.
 *
 * PASANG (sekali saja)
 *  1. Taruh file ini di  api/wall.js  (huruf kecil, sejajar dengan api/chat.js).
 *  2. Vercel > Project > Storage > Create Database > Upstash Redis (paket Free)
 *     > Connect to Project. Variabel KV_REST_API_URL dan KV_REST_API_TOKEN terisi otomatis.
 *  3. (Opsional) Environment Variables:
 *       DISCORD_WEBHOOK = link webhook Discord  -> kamu dapat notifikasi tiap ada pesan baru
 *       ADMIN_KEY       = kata sandi bebas      -> notifikasi memuat link "hapus" satu ketukan
 *  4. Redeploy.
 *
 * Aturan: kata kasar, link, nomor HP, dan @username ditolak di server (bukan hanya di HTML).
 * Pengunjung hanya bisa menghapus pesannya sendiri (dikenali lewat token acak di perangkatnya).
 */
const crypto = require('crypto');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'xc:wall';
const KEEP = 200, SHOW = 60;

async function redis(cmd) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).result;
}

/* ---- filter (sama dengan di HTML) ---- */
const BAD_LONG = ['anjing','bangsat','bajingan','kontol','memek','ngentot','jancok','jancuk','tolol','goblok','kampret','sialan','brengsek','setan','keparat','pelacur','bokep','fuck','shit','bitch','asshole','pussy','cunt','nigga','nigger','whore','porn','kimak','pantek','pepek','titit','coli','bunuh diri','mampus'];
const BAD_SHORT = ['asu','babi','dick','anj','ajg','bgst','kntl','mmk','pler','sex','idiot','bodoh'];
const collapse = x => x.replace(/(.)\1+/g, '$1');
const normalize = x => x.toLowerCase().replace(/[0]/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/[4@]/g,'a').replace(/[5$]/g,'s').replace(/7/g,'t');
function check(raw) {
  const text = String(raw || '').trim();
  if (text.length < 5) return 'Pesannya terlalu pendek.';
  if (/(https?:|www\.|\.com|\.id|\.net|\.xyz|\bt\.me|discord\.gg|wa\.me)/i.test(text)) return 'Link tidak boleh ada di pesan.';
  if (/(\+?62|\b0)[\s.-]?8[\d\s.-]{7,}/.test(text) || /\d{8,}/.test(text.replace(/[\s.-]/g, ''))) return 'Nomor HP tidak boleh ada di pesan.';
  if (/@\w{3,}/.test(text)) return 'Jangan sebut akun atau @username.';
  const n = normalize(text);
  const tokens = n.split(/[^a-z]+/).filter(Boolean).map(collapse);
  const squashed = collapse(n.replace(/[^a-z]/g, ''));
  if (BAD_SHORT.some(w => tokens.includes(collapse(w)))) return 'Ada kata kasar. Coba pakai kata yang lebih sopan.';
  if (BAD_LONG.some(w => squashed.includes(collapse(w.replace(/ /g, ''))))) return 'Ada kata kasar. Coba pakai kata yang lebih sopan.';
  if (/(.)\1{7,}/.test(text)) return 'Pesannya terlihat seperti spam.';
  return '';
}

const hits = new Map();
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(ip, arr); if (hits.size > 5000) hits.clear();
  return arr.length > 6;
}
const hash = t => crypto.createHash('sha256').update('xc|' + t).digest('hex').slice(0, 32);
const parse = s => { try { return JSON.parse(s); } catch { return null; } };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(500).json({ error: 'penyimpanan belum dipasang' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
  const tok = String(req.headers['x-wall-token'] || '').slice(0, 64);
  const origin = (req.headers['x-forwarded-proto'] || 'https') + '://' + (req.headers['x-forwarded-host'] || req.headers.host || '');

  try {
    /* Hapus lewat link admin: /api/wall?del=ID&key=ADMIN_KEY */
    if (req.method === 'GET' && req.query && req.query.del) {
      if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) return res.status(403).send('Tidak diizinkan');
      const all = await redis(['LRANGE', KEY, 0, KEEP - 1]);
      const hit = (all || []).find(s => (parse(s) || {}).id === req.query.del);
      if (hit) await redis(['LREM', KEY, 1, hit]);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(hit ? 'Pesan dihapus.' : 'Pesan tidak ditemukan (mungkin sudah dihapus).');
    }

    if (req.method === 'GET') {
      const all = await redis(['LRANGE', KEY, 0, SHOW - 1]);
      const me = tok ? hash(tok) : '';
      const notes = (all || []).map(parse).filter(Boolean).map(n => ({ id: n.id, t: n.t, f: n.f, ts: n.ts, mine: !!me && n.o === me }));
      return res.status(200).json({ notes });
    }

    let body = req.body; if (typeof body === 'string') body = parse(body) || {};
    body = body || {};

    if (req.method === 'POST') {
      if (limited(ip)) return res.status(429).json({ error: 'terlalu cepat' });
      if (!tok) return res.status(400).json({ error: 'token kosong' });
      const t = String(body.t || '').replace(/\s+/g, ' ').trim().slice(0, 140);
      const f = (String(body.f || '').replace(/\s+/g, ' ').trim().slice(0, 20)) || 'Anonim';
      const bad = check(t) || (f !== 'Anonim' ? check(f + f).replace('Pesannya terlalu pendek.', '') : '');
      if (bad) return res.status(422).json({ error: bad });
      const note = { id: Date.now().toString(36) + crypto.randomBytes(3).toString('hex'), t, f, ts: Date.now(), o: hash(tok) };
      await redis(['LPUSH', KEY, JSON.stringify(note)]);
      await redis(['LTRIM', KEY, 0, KEEP - 1]);
      if (process.env.DISCORD_WEBHOOK) {
        const del = process.env.ADMIN_KEY ? '\n[Hapus pesan ini](' + origin + '/api/wall?del=' + note.id + '&key=' + encodeURIComponent(process.env.ADMIN_KEY) + ')' : '';
        fetch(process.env.DISCORD_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [{ title: '📌 Pesan baru di Dinding', description: t + '\n\n— ' + f + del, color: 16766029 }] }) }).catch(() => {});
      }
      return res.status(200).json({ note: { id: note.id, t, f, ts: note.ts, mine: true } });
    }

    if (req.method === 'DELETE') {
      if (!tok || !body.id) return res.status(400).json({ error: 'data kurang' });
      const all = await redis(['LRANGE', KEY, 0, KEEP - 1]);
      const hit = (all || []).find(s => { const n = parse(s); return n && n.id === body.id; });
      if (!hit) return res.status(404).json({ error: 'tidak ditemukan' });
      if (parse(hit).o !== hash(tok)) return res.status(403).json({ error: 'bukan pesanmu' });
      await redis(['LREM', KEY, 1, hit]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    return res.status(502).json({ error: 'penyimpanan bermasalah' });
  }
};
