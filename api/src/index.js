// YourTechBuddy API — Cloudflare Worker + D1. No dependencies.
//
// Public:   GET  /api/health
//           GET  /api/courses                 published courses (admins: ?all=1 includes drafts)
//           GET  /api/courses/:slug
// Auth:     POST /api/auth/google             { credential }  -> { token, user }
//           GET  /api/me
//           GET  /api/progress                -> { progress: { [courseId]: [videoId] } }
//           POST /api/progress                { course_id, video_id, done }
//           POST /api/progress/merge          { items: [{ course_id, video_id }] }
// Admin:    PUT    /api/admin/courses/:slug   full course tree (create or replace)
//           DELETE /api/admin/courses/:slug
//           GET    /api/admin/youtube?url=..&mode=video|playlist

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const enc = new TextEncoder();

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '*',
      'Access-Control-Allow-Headers': 'content-type, authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    let res;
    try {
      res = await route(req, env);
    } catch (e) {
      const status = e.status || 500;
      if (!e.status) console.error(e);
      res = json({ error: e.status ? e.message : 'Server error' }, status);
    }
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    return res;
  },
};

/* ------------------------------ routing ------------------------------ */

async function route(req, env) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const m = req.method;
  let mt;

  if (path === '/api/health') return json({ ok: true });
  if (path === '/api/auth/google' && m === 'POST') return authGoogle(req, env);
  if (path === '/api/me' && m === 'GET') return json({ user: await requireUser(req, env) });

  if (path === '/api/courses' && m === 'GET') {
    const admin = url.searchParams.get('all') === '1' && (await optionalUser(req, env))?.isAdmin;
    return json({ courses: await loadCourses(env, { includeDrafts: !!admin }) });
  }
  if ((mt = path.match(/^\/api\/courses\/([a-z0-9-]+)$/)) && m === 'GET') {
    const admin = (await optionalUser(req, env))?.isAdmin;
    const [course] = await loadCourses(env, { slug: mt[1], includeDrafts: !!admin });
    if (!course) throw httpError(404, 'Not found');
    return json({ course });
  }

  if (path === '/api/progress') {
    const user = await requireUser(req, env);
    if (m === 'GET') return getProgress(env, user);
    if (m === 'POST') return setProgress(env, user, await readJSON(req));
  }
  if (path === '/api/progress/merge' && m === 'POST') {
    const user = await requireUser(req, env);
    return mergeProgress(env, user, await readJSON(req));
  }

  if (path.startsWith('/api/admin/')) {
    await requireAdmin(req, env);
    if ((mt = path.match(/^\/api\/admin\/courses\/([a-z0-9-]+)$/))) {
      if (m === 'PUT') return saveCourse(env, mt[1], await readJSON(req));
      if (m === 'DELETE') return deleteCourse(env, mt[1]);
    }
    if (path === '/api/admin/youtube' && m === 'GET') {
      return youtubeLookup(env, url.searchParams.get('url') || '', url.searchParams.get('mode') || '');
    }
  }

  throw httpError(404, 'Not found');
}

/* ------------------------------ helpers ------------------------------ */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS } });
}
function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
async function readJSON(req) {
  const text = await req.text();
  if (text.length > 1_000_000) throw httpError(413, 'Body too large');
  try { return JSON.parse(text || '{}'); } catch { throw httpError(400, 'Invalid JSON'); }
}
const now = () => Math.floor(Date.now() / 1000);
const parseJSON = (s, d) => { try { return JSON.parse(s); } catch { return d; } };
const str = (v, max = 500) => String(v ?? '').trim().slice(0, max);

const b64u = {
  enc(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  encStr(s) { return b64u.enc(enc.encode(s)); },
  dec(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  },
  decStr(s) { return new TextDecoder().decode(b64u.dec(s)); },
};

/* ------------------------------ auth ------------------------------ */

const adminList = (env) => (env.ADMIN_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);

async function authGoogle(req, env) {
  const { credential } = await readJSON(req);
  if (!credential) throw httpError(400, 'Missing credential');
  const g = await verifyGoogleIdToken(credential, env.GOOGLE_CLIENT_ID);
  const t = now();
  const row = await env.DB.prepare(
    `INSERT INTO users (google_sub, email, name, picture, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(google_sub) DO UPDATE SET email = excluded.email, name = excluded.name,
       picture = excluded.picture, last_login = excluded.last_login
     RETURNING id`
  ).bind(g.sub, g.email, g.name || '', g.picture || '', t, t).first();

  const user = {
    id: row.id,
    email: g.email,
    name: g.name || g.email,
    picture: g.picture || '',
    isAdmin: adminList(env).includes(g.email.toLowerCase()),
  };
  const token = await signSession(
    { uid: user.id, email: user.email, name: user.name, picture: user.picture, exp: t + 30 * 86400 },
    env.SESSION_SECRET
  );
  return json({ token, user });
}

async function optionalUser(req, env) {
  const h = req.headers.get('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  const p = await verifySession(token, env.SESSION_SECRET);
  if (!p) return null;
  return { id: p.uid, email: p.email, name: p.name, picture: p.picture, isAdmin: adminList(env).includes(String(p.email).toLowerCase()) };
}
async function requireUser(req, env) {
  const u = await optionalUser(req, env);
  if (!u) throw httpError(401, 'Please sign in');
  return u;
}
async function requireAdmin(req, env) {
  const u = await requireUser(req, env);
  if (!u.isAdmin) throw httpError(403, 'Admins only');
  return u;
}

async function hmacKey(secret) {
  if (!secret) throw httpError(500, 'SESSION_SECRET is not set');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function signSession(payload, secret) {
  const h = b64u.encStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64u.encStr(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(`${h}.${p}`));
  return `${h}.${p}.${b64u.enc(sig)}`;
}
async function verifySession(token, secret) {
  try {
    const [h, p, s] = token.split('.');
    if (!s) return null;
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64u.dec(s), enc.encode(`${h}.${p}`));
    if (!ok) return null;
    const payload = JSON.parse(b64u.decStr(p));
    return payload.exp > now() ? payload : null;
  } catch {
    return null;
  }
}

let googleJwks = { keys: null, until: 0 };
async function googleKeys() {
  if (googleJwks.keys && Date.now() < googleJwks.until) return googleJwks.keys;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  const j = await r.json();
  const maxAge = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  googleJwks = { keys: j.keys, until: Date.now() + (maxAge ? Number(maxAge[1]) * 1000 : 3600_000) };
  return j.keys;
}
async function verifyGoogleIdToken(token, clientId) {
  if (!clientId || clientId.startsWith('PASTE_')) throw httpError(500, 'GOOGLE_CLIENT_ID is not set');
  const [h, p, s] = String(token).split('.');
  if (!s) throw httpError(401, 'Invalid Google token');
  let header, payload;
  try { header = JSON.parse(b64u.decStr(h)); payload = JSON.parse(b64u.decStr(p)); }
  catch { throw httpError(401, 'Invalid Google token'); }
  const jwk = (await googleKeys()).find((k) => k.kid === header.kid);
  if (!jwk) throw httpError(401, 'Unknown Google key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u.dec(s), enc.encode(`${h}.${p}`));
  if (!ok) throw httpError(401, 'Invalid Google signature');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) throw httpError(401, 'Invalid issuer');
  if (payload.aud !== clientId) throw httpError(401, 'Token is for a different app');
  if (payload.exp < now()) throw httpError(401, 'Google token expired');
  if (!payload.email || payload.email_verified === false) throw httpError(401, 'Email not verified');
  return payload;
}

/* ------------------------------ courses ------------------------------ */

async function loadCourses(env, { slug = null, includeDrafts = false } = {}) {
  const where = [];
  const binds = [];
  if (slug) { where.push('slug = ?'); binds.push(slug); }
  if (!includeDrafts) where.push('published = 1');
  const sql = `SELECT * FROM courses ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY position, id`;
  const courses = (await env.DB.prepare(sql).bind(...binds).all()).results;
  if (!courses.length) return [];

  const ids = courses.map((c) => c.id);
  const qs = ids.map(() => '?').join(',');
  const sections = (await env.DB.prepare(`SELECT * FROM sections WHERE course_id IN (${qs}) ORDER BY position, id`).bind(...ids).all()).results;
  const lessons = (await env.DB.prepare(`SELECT * FROM lessons WHERE course_id IN (${qs}) ORDER BY position, id`).bind(...ids).all()).results;

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    tagline: c.tagline,
    level: c.level,
    tags: parseJSON(c.tags, []),
    practice: c.practice,
    published: !!c.published,
    position: c.position,
    sections: sections
      .filter((s) => s.course_id === c.id)
      .map((s) => ({
        id: s.id,
        title: s.title,
        lessons: lessons
          .filter((l) => l.section_id === s.id)
          .map((l) => ({ id: l.id, title: l.title, youtube: l.youtube, duration: l.duration })),
      })),
  }));
}

async function saveCourse(env, slugParam, b) {
  const slug = str(b.slug || slugParam, 60).toLowerCase();
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) throw httpError(400, 'Slug may only contain a-z, 0-9 and dashes');
  const title = str(b.title, 200);
  if (!title) throw httpError(400, 'Title is required');
  const sections = Array.isArray(b.sections) ? b.sections : [];
  if (sections.length > 100) throw httpError(400, 'Too many sections');
  let lessonCount = 0;
  for (const s of sections) {
    if (!str(s.title, 200)) throw httpError(400, 'Every section needs a title');
    for (const l of s.lessons || []) {
      lessonCount++;
      if (!str(l.title, 200)) throw httpError(400, 'Every lesson needs a title');
      if (l.youtube && !/^[A-Za-z0-9_-]{11}$/.test(l.youtube)) throw httpError(400, `Invalid YouTube id: ${l.youtube}`);
    }
  }
  if (lessonCount > 1000) throw httpError(400, 'Too many lessons');

  const tags = JSON.stringify((Array.isArray(b.tags) ? b.tags : []).map((t) => str(t, 40)).filter(Boolean).slice(0, 12));
  const fields = [title, str(b.tagline, 300), str(b.level, 60), tags, str(b.practice, 20), b.published ? 1 : 0, Number(b.position) || 0, now()];

  const existing = await env.DB.prepare('SELECT id FROM courses WHERE slug = ?').bind(slugParam).first();
  if (slug !== slugParam || !existing) {
    const clash = await env.DB.prepare('SELECT id FROM courses WHERE slug = ?').bind(slug).first();
    if (clash && (!existing || clash.id !== existing.id)) throw httpError(409, `A course with slug "${slug}" already exists`);
  }

  let id;
  if (existing) {
    id = existing.id;
    await env.DB.prepare(
      'UPDATE courses SET slug = ?, title = ?, tagline = ?, level = ?, tags = ?, practice = ?, published = ?, position = ?, updated_at = ? WHERE id = ?'
    ).bind(slug, ...fields, id).run();
  } else {
    const row = await env.DB.prepare(
      'INSERT INTO courses (slug, title, tagline, level, tags, practice, published, position, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id'
    ).bind(slug, ...fields).first();
    id = row.id;
  }

  // Replace sections + lessons atomically. Lessons find their section via (course_id, position).
  const stmts = [
    env.DB.prepare('DELETE FROM lessons WHERE course_id = ?').bind(id),
    env.DB.prepare('DELETE FROM sections WHERE course_id = ?').bind(id),
  ];
  sections.forEach((s, si) => {
    stmts.push(env.DB.prepare('INSERT INTO sections (course_id, title, position) VALUES (?, ?, ?)').bind(id, str(s.title, 200), si));
    (s.lessons || []).forEach((l, li) => {
      stmts.push(
        env.DB.prepare(
          `INSERT INTO lessons (course_id, section_id, title, youtube, duration, position)
           VALUES (?, (SELECT id FROM sections WHERE course_id = ? AND position = ?), ?, ?, ?, ?)`
        ).bind(id, id, si, str(l.title, 200), str(l.youtube, 11), str(l.duration, 12), li)
      );
    });
  });
  await env.DB.batch(stmts);

  const [course] = await loadCourses(env, { slug, includeDrafts: true });
  return json({ course });
}

async function deleteCourse(env, slug) {
  const c = await env.DB.prepare('SELECT id FROM courses WHERE slug = ?').bind(slug).first();
  if (!c) throw httpError(404, 'Not found');
  await env.DB.batch([
    env.DB.prepare('DELETE FROM progress WHERE course_id = ?').bind(c.id),
    env.DB.prepare('DELETE FROM lessons WHERE course_id = ?').bind(c.id),
    env.DB.prepare('DELETE FROM sections WHERE course_id = ?').bind(c.id),
    env.DB.prepare('DELETE FROM courses WHERE id = ?').bind(c.id),
  ]);
  return json({ ok: true });
}

/* ------------------------------ progress ------------------------------ */

async function getProgress(env, user) {
  const rows = (await env.DB.prepare('SELECT course_id, video_id FROM progress WHERE user_id = ?').bind(user.id).all()).results;
  const progress = {};
  for (const r of rows) (progress[r.course_id] ||= []).push(r.video_id);
  return json({ progress });
}

async function setProgress(env, user, b) {
  const courseId = Number(b.course_id);
  const videoId = str(b.video_id, 11);
  if (!courseId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw httpError(400, 'course_id and video_id are required');
  if (b.done) {
    await env.DB.prepare('INSERT OR IGNORE INTO progress (user_id, course_id, video_id, completed_at) VALUES (?, ?, ?, ?)')
      .bind(user.id, courseId, videoId, now()).run();
  } else {
    await env.DB.prepare('DELETE FROM progress WHERE user_id = ? AND course_id = ? AND video_id = ?').bind(user.id, courseId, videoId).run();
  }
  return json({ ok: true });
}

async function mergeProgress(env, user, b) {
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 2000)
    .filter((i) => Number(i.course_id) && /^[A-Za-z0-9_-]{11}$/.test(String(i.video_id)));
  if (items.length) {
    const t = now();
    await env.DB.batch(items.map((i) =>
      env.DB.prepare('INSERT OR IGNORE INTO progress (user_id, course_id, video_id, completed_at) SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM courses WHERE id = ?)')
        .bind(user.id, Number(i.course_id), String(i.video_id), t, Number(i.course_id))
    ));
  }
  return getProgress(env, user);
}

/* ------------------------------ YouTube ------------------------------ */

function parseYouTube(input) {
  input = String(input || '').trim();
  try {
    const u = new URL(input);
    const list = u.searchParams.get('list');
    let v = u.searchParams.get('v');
    if (!v && u.hostname.endsWith('youtu.be')) v = u.pathname.slice(1, 12);
    if (!v) v = (u.pathname.match(/\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/) || [])[1];
    return { video: v ? v.slice(0, 11) : null, playlist: list || null };
  } catch {}
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return { video: input, playlist: null };
  if (/^(PL|UU|OL|FL)[A-Za-z0-9_-]{10,}$/.test(input)) return { video: null, playlist: input };
  return { video: null, playlist: null };
}

function isoDuration(iso) {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return '';
  const h = Number(m[1] || 0) * 24 + Number(m[2] || 0);
  const mi = Number(m[3] || 0);
  const s = Number(m[4] || 0);
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(mi)}:${pad(s)}` : `${mi}:${pad(s)}`;
}

async function ytApi(env, endpoint, params) {
  const qs = new URLSearchParams({ ...params, key: env.YOUTUBE_API_KEY });
  const r = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${qs}`);
  const j = await r.json();
  if (!r.ok) throw httpError(502, `YouTube API: ${j.error?.message || r.status}`);
  return j;
}

async function videoDetails(env, ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 50) {
    const j = await ytApi(env, 'videos', { part: 'snippet,contentDetails', id: ids.slice(i, i + 50).join(','), maxResults: '50' });
    for (const v of j.items || []) out[v.id] = { title: v.snippet.title, duration: isoDuration(v.contentDetails.duration) };
  }
  return out;
}

async function youtubeLookup(env, input, mode) {
  const { video, playlist } = parseYouTube(input);
  const wantPlaylist = playlist && (mode === 'playlist' || !video);

  if (wantPlaylist) {
    if (!env.YOUTUBE_API_KEY) throw httpError(400, 'Playlist import needs YOUTUBE_API_KEY on the API (see README)');
    const meta = await ytApi(env, 'playlists', { part: 'snippet', id: playlist });
    if (!meta.items?.length) throw httpError(404, 'Playlist not found — check the link is complete and the playlist is public/unlisted');
    const ids = [];
    let pageToken = '';
    do {
      const j = await ytApi(env, 'playlistItems', { part: 'contentDetails', playlistId: playlist, maxResults: '50', ...(pageToken ? { pageToken } : {}) });
      for (const it of j.items || []) ids.push(it.contentDetails.videoId);
      pageToken = j.nextPageToken || '';
    } while (pageToken && ids.length < 500);
    const details = await videoDetails(env, ids);
    const items = ids.filter((id) => details[id]).map((id) => ({ youtube: id, ...details[id] })); // drops private/deleted
    return json({ type: 'playlist', playlist, title: meta.items[0].snippet.title, items });
  }

  if (video) {
    if (env.YOUTUBE_API_KEY) {
      const d = (await videoDetails(env, [video]))[video];
      if (!d) throw httpError(404, 'Video not found or private');
      return json({ type: 'video', item: { youtube: video, ...d }, playlist });
    }
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + video)}`);
    if (!r.ok) throw httpError(404, 'Video not found or private');
    const j = await r.json();
    return json({ type: 'video', item: { youtube: video, title: j.title, duration: '' }, playlist });
  }

  throw httpError(400, "That doesn't look like a YouTube video or playlist link");
}
