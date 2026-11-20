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
//           PUT    /api/admin/lessons/:id     { status, notes, youtube, title, duration }
//           GET/PUT/DELETE /api/admin/problems[/:slug]   (practice problems + hidden rubrics)
// Practice: GET /api/practice/problems[/:slug], /api/practice/usage, CRUD /api/practice/attempts[/:id], POST .../review|twist|finish
//           GET/POST /api/admin/ideas, PUT/DELETE /api/admin/ideas/:id   (private ideas board)

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
    return json({ courses: await loadCourses(env, { includeDrafts: !!admin, admin: !!admin }) });
  }
  if ((mt = path.match(/^\/api\/courses\/([a-z0-9-]+)$/)) && m === 'GET') {
    const admin = (await optionalUser(req, env))?.isAdmin;
    const [course] = await loadCourses(env, { slug: mt[1], includeDrafts: !!admin, admin: !!admin });
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

  if (path.startsWith('/api/practice/') || path.startsWith('/api/admin/problems')) {
    const res = await practiceRoutes(req, env, path, m, url);
    if (res) return res;
  }

  if (path.startsWith('/api/admin/')) {
    await requireAdmin(req, env);
    if ((mt = path.match(/^\/api\/admin\/courses\/([a-z0-9-]+)$/))) {
      if (m === 'PUT') return saveCourse(env, mt[1], await readJSON(req));
      if (m === 'DELETE') return deleteCourse(env, mt[1]);
    }
    if ((mt = path.match(/^\/api\/admin\/lessons\/(\d+)$/)) && m === 'PUT') {
      return updateLesson(env, Number(mt[1]), await readJSON(req));
    }
    if (path === '/api/admin/ideas') {
      if (m === 'GET') return listIdeas(env);
      if (m === 'POST') return saveIdea(env, null, await readJSON(req));
    }
    if ((mt = path.match(/^\/api\/admin\/ideas\/(\d+)$/))) {
      if (m === 'PUT') return saveIdea(env, Number(mt[1]), await readJSON(req));
      if (m === 'DELETE') return deleteIdea(env, Number(mt[1]));
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

const LESSON_STATUSES = ['idea', 'scripted', 'shot', 'edited', 'published'];

async function loadCourses(env, { slug = null, includeDrafts = false, admin = false } = {}) {
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
    ...(admin ? { show_upcoming: !!c.show_upcoming } : {}),
    sections: sections
      .filter((s) => s.course_id === c.id)
      .map((s) => ({
        id: s.id,
        title: s.title,
        lessons: lessons
          .filter((l) => l.section_id === s.id)
          // Learners only see published videos (plus "coming soon" titles if the course opts in).
          .filter((l) => admin || l.youtube || c.show_upcoming)
          .map((l) => admin
            ? { id: l.id, title: l.title, youtube: l.youtube, duration: l.duration, status: l.status, notes: l.notes }
            : { id: l.id, title: l.title, youtube: l.youtube, duration: l.duration }),
      }))
      .filter((s) => admin || s.lessons.length),
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
  const fields = [title, str(b.tagline, 300), str(b.level, 60), tags, str(b.practice, 20), b.published ? 1 : 0, Number(b.position) || 0, b.show_upcoming ? 1 : 0, now()];

  const existing = await env.DB.prepare('SELECT id FROM courses WHERE slug = ?').bind(slugParam).first();
  if (slug !== slugParam || !existing) {
    const clash = await env.DB.prepare('SELECT id FROM courses WHERE slug = ?').bind(slug).first();
    if (clash && (!existing || clash.id !== existing.id)) throw httpError(409, `A course with slug "${slug}" already exists`);
  }

  let id;
  if (existing) {
    id = existing.id;
    await env.DB.prepare(
      'UPDATE courses SET slug = ?, title = ?, tagline = ?, level = ?, tags = ?, practice = ?, published = ?, position = ?, show_upcoming = ?, updated_at = ? WHERE id = ?'
    ).bind(slug, ...fields, id).run();
  } else {
    const row = await env.DB.prepare(
      'INSERT INTO courses (slug, title, tagline, level, tags, practice, published, position, show_upcoming, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id'
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
          `INSERT INTO lessons (course_id, section_id, title, youtube, duration, position, status, notes)
           VALUES (?, (SELECT id FROM sections WHERE course_id = ? AND position = ?), ?, ?, ?, ?, ?, ?)`
        ).bind(id, id, si, str(l.title, 200), str(l.youtube, 11), str(l.duration, 12), li, lessonStatus(l), str(l.notes, 5000))
      );
    });
  });
  await env.DB.batch(stmts);

  const [course] = await loadCourses(env, { slug, includeDrafts: true, admin: true });
  return json({ course });
}

function lessonStatus(l) {
  if (LESSON_STATUSES.includes(l.status)) return l.status;
  return l.youtube ? 'published' : 'idea';
}

// Quick edits from the Planner board (status / notes / video link) without re-saving the whole course.
async function updateLesson(env, id, b) {
  const cur = await env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
  if (!cur) throw httpError(404, 'Lesson not found — refresh the page');
  const youtube = b.youtube !== undefined ? str(b.youtube, 11) : cur.youtube;
  if (youtube && !/^[A-Za-z0-9_-]{11}$/.test(youtube)) throw httpError(400, `Invalid YouTube id: ${youtube}`);
  const status = b.status !== undefined ? (LESSON_STATUSES.includes(b.status) ? b.status : cur.status) : cur.status;
  const notes = b.notes !== undefined ? str(b.notes, 5000) : cur.notes;
  const title = b.title !== undefined && str(b.title, 200) ? str(b.title, 200) : cur.title;
  const duration = b.duration !== undefined ? str(b.duration, 12) : cur.duration;
  const row = await env.DB.prepare('UPDATE lessons SET title = ?, youtube = ?, status = ?, notes = ?, duration = ? WHERE id = ? RETURNING *')
    .bind(title, youtube, status, notes, duration, id).first();
  await env.DB.prepare('UPDATE courses SET updated_at = ? WHERE id = ?').bind(now(), cur.course_id).run();
  return json({ lesson: { id: row.id, title: row.title, youtube: row.youtube, duration: row.duration, status: row.status, notes: row.notes } });
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

/* ------------------------------ ideas (admin only) ------------------------------ */

const IDEA_CATEGORIES = ['youtube', 'instagram', 'course', 'website', 'other'];
const IDEA_STATUSES = ['idea', 'planned', 'doing', 'done'];

async function listIdeas(env) {
  const rows = (await env.DB.prepare('SELECT * FROM ideas ORDER BY updated_at DESC, id DESC').all()).results;
  return json({ ideas: rows });
}

async function saveIdea(env, id, b) {
  const title = str(b.title, 200);
  if (!title) throw httpError(400, 'Give the idea a title');
  const notes = str(b.notes, 5000);
  const category = IDEA_CATEGORIES.includes(b.category) ? b.category : 'other';
  const status = IDEA_STATUSES.includes(b.status) ? b.status : 'idea';
  const t = now();
  let row;
  if (id) {
    row = await env.DB.prepare('UPDATE ideas SET title = ?, notes = ?, category = ?, status = ?, updated_at = ? WHERE id = ? RETURNING *')
      .bind(title, notes, category, status, t, id).first();
    if (!row) throw httpError(404, 'Idea not found');
  } else {
    row = await env.DB.prepare('INSERT INTO ideas (title, notes, category, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING *')
      .bind(title, notes, category, status, t, t).first();
  }
  return json({ idea: row });
}

async function deleteIdea(env, id) {
  await env.DB.prepare('DELETE FROM ideas WHERE id = ?').bind(id).run();
  return json({ ok: true });
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

/* ------------------------------ LLD interview practice ------------------------------ */

const PRACTICE_STEPS = ['requirements', 'entities', 'uml', 'code', 'twist'];
const STEP_INFO = {
  requirements: { name: 'Requirements', expect: 'Clarifying questions, functional and non-functional requirements, and an explicit scope (what is in and out).' },
  entities: { name: 'Entities & relationships', expect: 'Core classes/entities, their key attributes, and relationships between them (is-a / has-a, multiplicities).' },
  uml: { name: 'UML + design patterns', expect: 'A UML class diagram (Mermaid classDiagram syntax) and the design patterns used, each with a one-line reason.' },
  code: { name: 'Implementation', expect: 'Code for the core classes and the key methods, consistent with the UML.' },
  twist: { name: 'The twist', expect: "The candidate's answer to the interviewer's follow-up change: what changes in the design and code, and why the change stays contained." },
};
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer', minimum: 0, maximum: 10 },
    verdict: { type: 'string', enum: ['ready', 'revise'] },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    followUp: { type: 'string' },
  },
  required: ['score', 'verdict', 'summary', 'strengths', 'gaps', 'followUp'],
};
const TWIST_SCHEMA = {
  type: 'object',
  properties: { question: { type: 'string' }, focus: { type: 'string' } },
  required: ['question', 'focus'],
};
const QUOTA_MSG = "Today's free AI reviews are used up. They reset at 5:30 AM IST — your answers are saved.";
const clip = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n) + '\n…[truncated]' : s; };
const dayKey = () => new Date().toISOString().slice(0, 10);

async function practiceRoutes(req, env, path, m, url) {
  let mt;
  if (path === '/api/practice/problems' && m === 'GET') {
    const admin = url.searchParams.get('all') === '1' && (await optionalUser(req, env))?.isAdmin;
    const rows = (await env.DB.prepare(`SELECT slug, title, difficulty, summary, published, position FROM problems ${admin ? '' : 'WHERE published = 1'} ORDER BY position, id`).all()).results;
    return json({ problems: rows.map((r) => ({ ...r, published: !!r.published })) });
  }
  if ((mt = path.match(/^\/api\/practice\/problems\/([a-z0-9-]+)$/)) && m === 'GET') {
    const p = await env.DB.prepare('SELECT * FROM problems WHERE slug = ?').bind(mt[1]).first();
    const admin = (await optionalUser(req, env))?.isAdmin;
    if (!p || (!p.published && !admin)) throw httpError(404, 'Problem not found');
    return json({ problem: publicProblem(p, admin) });
  }
  if (path === '/api/practice/usage' && m === 'GET') {
    const user = await requireUser(req, env);
    const row = await env.DB.prepare('SELECT count FROM ai_usage WHERE user_id = ? AND day = ?').bind(user.id, dayKey()).first();
    return json({ used: row ? row.count : 0, limit: dailyLimit(env, user) });
  }
  if (path === '/api/practice/attempts') {
    const user = await requireUser(req, env);
    if (m === 'GET') {
      const rows = (await env.DB.prepare(
        `SELECT a.id, a.step, a.status, a.data, a.updated_at, p.slug, p.title, p.difficulty
         FROM attempts a JOIN problems p ON p.id = a.problem_id WHERE a.user_id = ? ORDER BY a.updated_at DESC LIMIT 50`
      ).bind(user.id).all()).results;
      return json({ attempts: rows.map((r) => {
        const d = parseJSON(r.data, {});
        return { id: r.id, step: r.step, status: r.status, updated_at: r.updated_at, problem: { slug: r.slug, title: r.title, difficulty: r.difficulty },
          scores: Object.fromEntries(PRACTICE_STEPS.filter((s) => d.reviews?.[s]).map((s) => [s, d.reviews[s].score])), signal: d.report?.signal || null };
      }) });
    }
    if (m === 'POST') {
      const b = await readJSON(req);
      const p = await env.DB.prepare('SELECT * FROM problems WHERE slug = ? AND published = 1').bind(str(b.slug, 60)).first();
      if (!p) throw httpError(404, 'Problem not found');
      const t = now();
      const row = await env.DB.prepare("INSERT INTO attempts (user_id, problem_id, data, step, status, created_at, updated_at) VALUES (?, ?, '{}', 1, 'active', ?, ?) RETURNING *")
        .bind(user.id, p.id, t, t).first();
      return json({ attempt: attemptView(row, p) });
    }
  }
  if ((mt = path.match(/^\/api\/practice\/attempts\/(\d+)(?:\/(review|twist|finish))?$/))) {
    const user = await requireUser(req, env);
    const id = Number(mt[1]);
    const row = await env.DB.prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?').bind(id, user.id).first();
    if (!row) throw httpError(404, 'Attempt not found');
    const p = await env.DB.prepare('SELECT * FROM problems WHERE id = ?').bind(row.problem_id).first();
    const data = parseJSON(row.data, {});
    data.answers ||= {}; data.reviews ||= {};
    const action = mt[2];

    if (!action && m === 'GET') return json({ attempt: attemptView(row, p) });
    if (!action && m === 'DELETE') { await env.DB.prepare('DELETE FROM attempts WHERE id = ?').bind(id).run(); return json({ ok: true }); }
    if (!action && m === 'PUT') {
      const b = await readJSON(req);
      mergeAnswers(data, b.answers);
      let step = row.step;
      if (b.step) step = Math.max(1, Math.min(Number(b.step) || 1, maxStep(data)));
      return json({ attempt: attemptView(await saveAttempt(env, id, data, step, row.status), p) });
    }
    if (action === 'review' && m === 'POST') {
      const b = await readJSON(req);
      mergeAnswers(data, b.answers);
      const stepName = PRACTICE_STEPS.includes(b.step) ? b.step : null;
      if (!stepName) throw httpError(400, 'Unknown step');
      const idx = PRACTICE_STEPS.indexOf(stepName) + 1;
      if (idx > maxStep(data)) throw httpError(400, 'Finish the earlier steps first');
      if (stepName === 'twist' && !data.twist?.question) throw httpError(400, 'Get the follow-up question first');
      const answer = stepName === 'code' ? data.answers.code : data.answers[stepName];
      if (!String(answer || '').trim() || String(answer).trim().length < 20) throw httpError(400, 'Write a bit more before asking for a review');
      await spendQuota(env, user);
      let review;
      try { review = await reviewStep(env, p, data, stepName); }
      catch (e) { await refundQuota(env, user); throw e; }
      data.reviews[stepName] = { ...review, at: now(), attempts: (data.reviews[stepName]?.attempts || 0) + 1 };
      const step = Math.max(row.step, Math.min(idx + 1, PRACTICE_STEPS.length));
      return json({ review: data.reviews[stepName], attempt: attemptView(await saveAttempt(env, id, data, step, row.status), p) });
    }
    if (action === 'twist' && m === 'POST') {
      if (!data.reviews.code) throw httpError(400, 'Get your implementation reviewed first');
      if (!data.twist?.question) {
        await spendQuota(env, user);
        try { data.twist = { ...(await makeTwist(env, p, data)), at: now() }; }
        catch (e) { await refundQuota(env, user); throw e; }
      }
      return json({ twist: data.twist, attempt: attemptView(await saveAttempt(env, id, data, Math.max(row.step, 5), row.status), p) });
    }
    if (action === 'finish' && m === 'POST') {
      if (!Object.keys(data.reviews).length) throw httpError(400, 'Get at least one step reviewed first');
      data.report = buildReport(data);
      return json({ attempt: attemptView(await saveAttempt(env, id, data, row.step, 'done'), p) });
    }
  }

  // ---- admin: problem editor ----
  if (path === '/api/admin/problems' && m === 'GET') {
    await requireAdmin(req, env);
    const rows = (await env.DB.prepare('SELECT * FROM problems ORDER BY position, id').all()).results;
    return json({ problems: rows.map((p) => publicProblem(p, true)) });
  }
  if ((mt = path.match(/^\/api\/admin\/problems\/([a-z0-9-]+)$/))) {
    await requireAdmin(req, env);
    if (m === 'PUT') return saveProblem(env, mt[1], await readJSON(req));
    if (m === 'DELETE') {
      await env.DB.prepare('DELETE FROM problems WHERE slug = ?').bind(mt[1]).run();
      return json({ ok: true });
    }
  }
  return null;
}

function publicProblem(p, admin) {
  const out = { slug: p.slug, title: p.title, difficulty: p.difficulty, summary: p.summary, statement: p.statement, published: !!p.published, position: p.position };
  if (admin) out.rubric = parseJSON(p.rubric, {});
  return out;
}
function attemptView(row, p) {
  const d = parseJSON(row.data, {});
  return { id: row.id, step: row.step, status: row.status, created_at: row.created_at, updated_at: row.updated_at,
    answers: d.answers || {}, reviews: d.reviews || {}, twist: d.twist || null, report: d.report || null,
    problem: publicProblem(p, false) };
}
function maxStep(data) {
  // the next step unlocks once the previous one has been reviewed at least once
  let s = 1;
  for (const name of PRACTICE_STEPS.slice(0, -1)) { if (data.reviews?.[name]) s++; else break; }
  return s;
}
function mergeAnswers(data, a) {
  if (!a || typeof a !== 'object') return;
  for (const k of ['requirements', 'entities', 'uml', 'twist']) if (typeof a[k] === 'string') data.answers[k] = a[k].slice(0, 8000);
  if (typeof a.code === 'string') data.answers.code = a.code.slice(0, 15000);
  if (typeof a.lang === 'string') data.answers.lang = a.lang.slice(0, 20);
}
async function saveAttempt(env, id, data, step, status) {
  const body = JSON.stringify(data);
  if (body.length > 120000) throw httpError(413, 'This attempt is too large to save');
  return env.DB.prepare('UPDATE attempts SET data = ?, step = ?, status = ?, updated_at = ? WHERE id = ? RETURNING *')
    .bind(body, step, status, now(), id).first();
}

function dailyLimit(env, user) {
  const base = Number(env.PRACTICE_DAILY_LIMIT) || 8;
  return user.isAdmin ? Math.max(base, 50) : base;
}
async function spendQuota(env, user) {
  const limit = dailyLimit(env, user);
  const row = await env.DB.prepare(
    'INSERT INTO ai_usage (user_id, day, count) VALUES (?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1 RETURNING count'
  ).bind(user.id, dayKey()).first();
  if (row.count > limit) {
    await refundQuota(env, user);
    throw httpError(429, `You've used all ${limit} free AI reviews for today. They reset at 5:30 AM IST — your answers are saved.`);
  }
}
async function refundQuota(env, user) {
  await env.DB.prepare('UPDATE ai_usage SET count = MAX(count - 1, 0) WHERE user_id = ? AND day = ?').bind(user.id, dayKey()).run();
}

async function aiJSON(env, system, user, schema, maxTokens = 900) {
  if (env.AI_MOCK) return mockAI(schema, user);
  if (!env.AI) throw httpError(500, 'AI is not configured on the API (missing [ai] binding)');
  const model = env.AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  let res;
  try {
    res = await env.AI.run(model, {
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      response_format: { type: 'json_schema', json_schema: schema },
      max_tokens: maxTokens,
      temperature: 0.3,
    });
  } catch (e) {
    const msg = String((e && e.message) || e);
    console.error('AI error', msg);
    if (/neuron|limit|quota|429|exceed|capacity|daily/i.test(msg)) throw httpError(429, QUOTA_MSG);
    throw httpError(502, 'The AI reviewer is unavailable right now. Try again in a minute.');
  }
  let r = res && res.response !== undefined ? res.response : res;
  if (typeof r === 'string') {
    const mm = r.match(/\{[\s\S]*\}/);
    try { r = JSON.parse(mm ? mm[0] : r); } catch { throw httpError(502, 'The AI reply could not be read. Try again.'); }
  }
  if (!r || typeof r !== 'object') throw httpError(502, 'The AI reply could not be read. Try again.');
  return r;
}

function mockAI(schema, prompt) {
  if (schema === TWIST_SCHEMA) return { question: 'Mock twist: two requests hit the same resource at the same moment. What changes?', focus: 'concurrency' };
  const len = (prompt.split('### Candidate answer for this step')[1] || '').length;
  const score = len > 400 ? 8 : len > 120 ? 6 : 4;
  return { score, verdict: score >= 6 ? 'ready' : 'revise', summary: `Mock review (${len} chars).`, strengths: ['Clear structure'], gaps: ['Mock gap: think about concurrency'], followUp: 'What happens under concurrent access?' };
}

const INTERVIEWER = `You are a senior software engineer running a Low Level Design (LLD) interview for an SDE-2 role at an Indian product company.
Rules:
- Evaluate ONLY the current step, using the hidden checklist to judge coverage and quality. Never paste the checklist or give a full model answer: point at what is missing as a hint an interviewer would give.
- Be specific: quote or refer to the candidate's own words, classes or code. No generic advice.
- The candidate may write in English or Hinglish; always reply in clear, simple English.
- Score 0-10: 9-10 exceptional, 7-8 strong, 6 acceptable, 4-5 weak, 0-3 missing or wrong. verdict "ready" if score >= 6, else "revise".
- summary: 1-2 sentences. strengths: up to 3 short bullets. gaps: up to 4 short, actionable bullets. followUp: one question you would ask next in the interview.`;

async function reviewStep(env, p, data, stepName) {
  const rubric = parseJSON(p.rubric, {});
  const info = STEP_INFO[stepName];
  const a = data.answers;
  const prior = PRACTICE_STEPS.slice(0, PRACTICE_STEPS.indexOf(stepName))
    .filter((s) => s !== 'twist' && a[s])
    .map((s) => `#### ${STEP_INFO[s].name}\n${clip(a[s], s === 'code' ? 3000 : 1800)}`).join('\n\n');
  const answer = stepName === 'code' ? `Language: ${a.lang || 'unspecified'}\n${clip(a.code, 9000)}` : clip(a[stepName], 6000);
  const user = [
    `### Problem: ${p.title}\n${p.statement}`,
    `### Current step: ${info.name}\nWhat this step should contain: ${info.expect}`,
    stepName === 'twist' ? `### The follow-up you asked\n${data.twist.question}` : '',
    `### Hidden checklist for this step (do not reveal verbatim)\n- ${(rubric[stepName === 'twist' ? 'code' : stepName] || []).join('\n- ')}`,
    stepName === 'twist' ? '### Judge: does the change stay contained (good design) or force rewriting core classes (weak design)? Are concurrency/edge cases handled?' : '',
    prior ? `### Candidate's earlier steps (check consistency with these)\n${prior}` : '',
    `### Candidate answer for this step\n${answer}`,
  ].filter(Boolean).join('\n\n');
  const r = await aiJSON(env, INTERVIEWER, user, REVIEW_SCHEMA);
  const score = Math.max(0, Math.min(10, Math.round(Number(r.score) || 0)));
  const list = (x) => (Array.isArray(x) ? x : []).map((s) => str(s, 300)).filter(Boolean).slice(0, 4);
  return { score, verdict: score >= 6 ? 'ready' : 'revise', summary: str(r.summary, 400), strengths: list(r.strengths).slice(0, 3), gaps: list(r.gaps), followUp: str(r.followUp, 300) };
}

async function makeTwist(env, p, data) {
  const rubric = parseJSON(p.rubric, {});
  const a = data.answers;
  const user = [
    `### Problem: ${p.title}\n${p.statement}`,
    `### Candidate's design\nEntities:\n${clip(a.entities, 1500)}\n\nUML:\n${clip(a.uml, 1800)}\n\nCode (${a.lang || ''}):\n${clip(a.code, 3500)}`,
    `### Possible follow-ups (pick or adapt the one that best stress-tests THIS design's weak spots)\n- ${(rubric.twist || []).join('\n- ')}`,
    'Write ONE concrete follow-up change request, 2-3 sentences, as the interviewer speaking to the candidate. focus: one or two words (e.g. "extensibility", "concurrency").',
  ].join('\n\n');
  const r = await aiJSON(env, INTERVIEWER, user, TWIST_SCHEMA, 300);
  const question = str(r.question, 600);
  if (!question) throw httpError(502, 'Could not create a follow-up. Try again.');
  return { question, focus: str(r.focus, 40) };
}

function buildReport(data) {
  const scored = PRACTICE_STEPS.filter((s) => data.reviews[s]).map((s) => ({ step: s, ...data.reviews[s] }));
  const avg = scored.reduce((n, r) => n + r.score, 0) / scored.length;
  const complete = scored.length === PRACTICE_STEPS.length;
  const signal = !complete ? 'Incomplete' : avg >= 8 ? 'Strong hire' : avg >= 6.5 ? 'Hire' : avg >= 5 ? 'Lean no-hire' : 'No hire';
  const byScore = [...scored].sort((x, y) => x.score - y.score);
  const improvements = byScore.flatMap((r) => (r.gaps || []).slice(0, 1).map((g) => ({ step: STEP_INFO[r.step].name, text: g }))).slice(0, 3);
  const strengths = [...scored].sort((x, y) => y.score - x.score).flatMap((r) => (r.strengths || []).slice(0, 1).map((t) => ({ step: STEP_INFO[r.step].name, text: t }))).slice(0, 3);
  return { average: Math.round(avg * 10) / 10, signal, complete, steps: scored.map((r) => ({ step: r.step, name: STEP_INFO[r.step].name, score: r.score })), improvements, strengths, at: now() };
}

async function saveProblem(env, slugParam, b) {
  const slug = str(b.slug || slugParam, 60).toLowerCase();
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) throw httpError(400, 'Slug may only contain a-z, 0-9 and dashes');
  const title = str(b.title, 120);
  if (!title) throw httpError(400, 'Title is required');
  const rubric = {};
  for (const k of ['requirements', 'entities', 'uml', 'code', 'twist']) {
    rubric[k] = (Array.isArray(b.rubric?.[k]) ? b.rubric[k] : []).map((x) => str(x, 400)).filter(Boolean).slice(0, 20);
  }
  const vals = [title, str(b.difficulty, 20) || 'Medium', str(b.summary, 300), str(b.statement, 4000), JSON.stringify(rubric), b.published ? 1 : 0, Number(b.position) || 0, now()];
  const existing = await env.DB.prepare('SELECT id FROM problems WHERE slug = ?').bind(slugParam).first();
  if (slug !== slugParam || !existing) {
    const clash = await env.DB.prepare('SELECT id FROM problems WHERE slug = ?').bind(slug).first();
    if (clash && (!existing || clash.id !== existing.id)) throw httpError(409, `A problem with slug "${slug}" already exists`);
  }
  if (existing) {
    await env.DB.prepare('UPDATE problems SET slug = ?, title = ?, difficulty = ?, summary = ?, statement = ?, rubric = ?, published = ?, position = ?, updated_at = ? WHERE id = ?')
      .bind(slug, ...vals, existing.id).run();
  } else {
    await env.DB.prepare('INSERT INTO problems (slug, title, difficulty, summary, statement, rubric, published, position, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(slug, ...vals).run();
  }
  const p = await env.DB.prepare('SELECT * FROM problems WHERE slug = ?').bind(slug).first();
  return json({ problem: publicProblem(p, true) });
}
