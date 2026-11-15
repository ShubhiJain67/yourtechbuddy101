/* YourTechBuddy shared client: config, API calls, Google sign-in, courses and progress.
   Works in two modes:
   - API mode (YTB_CONFIG.apiBase set): courses from the API, progress synced to your account when signed in.
   - Offline mode: courses from courses/courses.js, progress saved in this browser only. */
(function () {
  const CFG = window.YTB_CONFIG || {};
  const API = (CFG.apiBase || '').replace(/\/+$/, '');
  const apiOn = !!API;
  const authOn = apiOn && !!CFG.googleClientId;
  const ROOT = new URL('../', document.currentScript.src).pathname; // site root, e.g. "/"

  const LS = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let session = authOn ? LS.get('ytb:session', null) : null; // { token, user }

  /* ---------------- API ---------------- */
  async function api(path, opts = {}) {
    if (!apiOn) throw new Error('API not configured');
    const headers = { 'content-type': 'application/json', ...(opts.headers || {}) };
    if (session && session.token) headers.authorization = 'Bearer ' + session.token;
    const body = opts.body && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body;
    const r = await fetch(API + path, { ...opts, headers, body });
    let data = null;
    try { data = await r.json(); } catch {}
    if (r.status === 401 && session && path !== '/api/auth/google') { clearSession(); }
    if (!r.ok) { const e = new Error((data && data.error) || 'HTTP ' + r.status); e.status = r.status; throw e; }
    return data;
  }

  /* ---------------- Courses ---------------- */
  const localCourses = () => (window.COURSES || []).map((c) => ({ ...c, id: c.slug, _local: true }));

  async function getCourses({ all = false } = {}) {
    if (apiOn) {
      try {
        const { courses } = await api('/api/courses' + (all ? '?all=1' : ''));
        // Keep any courses.js course whose slug isn't in the API yet (handy while migrating).
        const slugs = new Set(courses.map((c) => c.slug));
        return [...courses, ...localCourses().filter((c) => !slugs.has(c.slug))];
      } catch (e) { console.warn('[YTB] API courses unavailable, using courses.js', e); }
    }
    return localCourses();
  }
  async function getCourse(slug) {
    if (apiOn && slug) {
      try { return (await api('/api/courses/' + encodeURIComponent(slug))).course; }
      catch (e) { if (e.status !== 404) console.warn('[YTB] API course unavailable', e); }
    }
    const list = localCourses();
    return (slug ? list.find((c) => c.slug === slug) : list[0]) || null;
  }

  /* ---------------- Progress ---------------- */
  const localKey = (course) => 'ytb:progress:' + course.slug;
  const synced = (course) => !!session && apiOn && typeof course.id === 'number';
  let serverProgress = null;
  function fetchServerProgress() {
    if (!serverProgress) serverProgress = api('/api/progress').then((r) => r.progress).catch((e) => { serverProgress = null; throw e; });
    return serverProgress;
  }

  const progress = {
    async load(course) {
      if (synced(course)) {
        try { return new Set((await fetchServerProgress())[course.id] || []); } catch (e) { console.warn('[YTB] progress', e); }
      }
      return new Set(LS.get(localKey(course), []));
    },
    async loadAll(courses) {
      const out = {};
      let server = null;
      if (session && apiOn) { try { server = await fetchServerProgress(); } catch {} }
      for (const c of courses) {
        out[c.slug] = server && typeof c.id === 'number' ? new Set(server[c.id] || []) : new Set(LS.get(localKey(c), []));
      }
      return out;
    },
    async set(course, videoId, done) {
      const s = new Set(LS.get(localKey(course), []));
      done ? s.add(videoId) : s.delete(videoId);
      LS.set(localKey(course), [...s]);
      if (synced(course)) {
        serverProgress = null;
        try { await api('/api/progress', { method: 'POST', body: { course_id: course.id, video_id: videoId, done } }); }
        catch (e) { console.warn('[YTB] could not save progress', e); }
      }
    },
  };

  async function mergeLocalProgress() {
    const courses = await getCourses();
    const items = [];
    for (const c of courses) {
      if (typeof c.id !== 'number') continue;
      for (const v of LS.get(localKey(c), [])) items.push({ course_id: c.id, video_id: v });
    }
    if (items.length) { try { await api('/api/progress/merge', { method: 'POST', body: { items } }); } catch (e) { console.warn(e); } }
  }

  /* ---------------- Auth ---------------- */
  function clearSession() {
    session = null;
    LS.del('ytb:session');
    Object.keys(localStorage).filter((k) => k.startsWith('ytb:progress:')).forEach((k) => LS.del(k));
  }
  function signOut() {
    clearSession();
    try { window.google && google.accounts.id.disableAutoSelect(); } catch {}
    location.reload();
  }

  let gsiPromise = null;
  function loadGsi() {
    return (gsiPromise ||= new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.onload = resolve; s.onerror = () => reject(new Error('Could not load Google sign-in'));
      document.head.appendChild(s);
    }));
  }
  async function onCredential(resp) {
    try {
      const r = await api('/api/auth/google', { method: 'POST', body: { credential: resp.credential } });
      session = r;
      LS.set('ytb:session', r);
      await mergeLocalProgress();
      location.reload();
    } catch (e) {
      alertBox('Sign-in failed: ' + e.message);
    }
  }
  async function renderGoogleButton(el, opts = {}) {
    await loadGsi();
    google.accounts.id.initialize({ client_id: CFG.googleClientId, callback: onCredential });
    google.accounts.id.renderButton(el, { theme: 'filled_black', size: opts.size || 'medium', shape: 'pill', text: 'signin_with', ...opts });
  }

  function alertBox(msg) {
    const d = document.createElement('div');
    d.className = 'ytb-toast'; d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 5000);
  }

  /* Header auth area: Sign-in button, or avatar menu (My courses / Admin / Sign out). */
  function renderAuth(el) {
    if (!el || !authOn) return;
    if (!session) {
      el.innerHTML = '<div class="ytb-gsi"></div>';
      renderGoogleButton(el.firstChild).catch((e) => console.warn(e));
      return;
    }
    const u = session.user;
    const avatar = u.picture
      ? `<img src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer">`
      : `<span>${esc((u.name || u.email || '?')[0].toUpperCase())}</span>`;
    el.innerHTML = `
      <div class="ytb-user">
        <button class="ytb-avatar" aria-label="Account menu">${avatar}</button>
        <div class="ytb-menu" hidden>
          <div class="ytb-who"><b>${esc(u.name)}</b><small>${esc(u.email)}</small></div>
          <a href="${ROOT}me/">📚 My courses</a>
          ${u.isAdmin ? `<a href="${ROOT}admin/">🛠 Admin</a>` : ''}
          <button data-signout>Sign out</button>
        </div>
      </div>`;
    const menu = el.querySelector('.ytb-menu');
    el.querySelector('.ytb-avatar').addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
    document.addEventListener('click', () => (menu.hidden = true));
    el.querySelector('[data-signout]').addEventListener('click', signOut);
  }

  /* Styles for the auth bits (so every page gets them, including the Playground). */
  let css = `
    .ytb-user{position:relative}
    .ytb-avatar{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);background:var(--panel2);padding:0;cursor:pointer;overflow:hidden;display:grid;place-items:center;color:var(--text);font-weight:600}
    .ytb-avatar img{width:100%;height:100%;object-fit:cover}
    .ytb-menu{position:absolute;right:0;top:42px;min-width:220px;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:6px;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:50}
    .ytb-menu a,.ytb-menu button{display:block;width:100%;text-align:left;padding:8px 10px;border-radius:7px;color:var(--text);text-decoration:none;background:none;border:0;font:inherit;font-size:14px;cursor:pointer}
    .ytb-menu a:hover,.ytb-menu button:hover{background:var(--panel2)}
    .ytb-who{padding:8px 10px 10px;border-bottom:1px solid var(--border);margin-bottom:4px}
    .ytb-who b{display:block;font-size:14px}.ytb-who small{color:var(--muted);font-size:12px}
    .ytb-gsi{min-height:32px;display:flex;align-items:center}
    .ytb-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--border);color:var(--text);box-shadow:0 8px 24px rgba(0,0,0,.25);padding:10px 16px;border-radius:8px;z-index:100;font-size:14px}`;
  css += `
    .theme-toggle{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);background:var(--panel2);color:var(--text);cursor:pointer;display:grid;place-items:center;padding:0;flex:none}
    .theme-toggle:hover{border-color:var(--accent)}
    .theme-toggle svg{width:17px;height:17px}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------------- Light / dark theme ---------------- */
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const getTheme = () => document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  function setTheme(t, save = true) {
    document.documentElement.setAttribute('data-theme', t);
    if (save) { try { localStorage.setItem('ytb:theme', t); } catch {} }
    document.querySelectorAll('.theme-toggle').forEach(paintToggle);
    window.dispatchEvent(new CustomEvent('ytb:theme', { detail: t }));
  }
  function paintToggle(btn) {
    const light = getTheme() === 'light';
    btn.innerHTML = light ? MOON : SUN;
    btn.title = light ? 'Switch to dark mode' : 'Switch to light mode';
    btn.setAttribute('aria-label', btn.title);
  }
  function mountThemeToggle() {
    if (document.querySelector('.theme-toggle')) return;
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    paintToggle(btn);
    btn.addEventListener('click', () => setTheme(getTheme() === 'light' ? 'dark' : 'light'));
    const auth = document.getElementById('auth');
    const header = document.querySelector('header');
    if (auth) auth.parentNode.insertBefore(btn, auth);
    else if (header) header.appendChild(btn);
  }
  // Follow the system setting until the visitor picks a theme themselves.
  try {
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      let saved = null; try { saved = localStorage.getItem('ytb:theme'); } catch {}
      if (!saved) setTheme(e.matches ? 'light' : 'dark', false);
    });
  } catch {}

  window.YTB = {
    config: CFG, apiOn, authOn, root: ROOT, api, esc, LS,
    get session() { return session; },
    get user() { return session && session.user; },
    get isAdmin() { return !!(session && session.user && session.user.isAdmin); },
    getCourses, getCourse, progress, renderAuth, renderGoogleButton, signOut, toast: alertBox,
    get theme() { return getTheme(); }, setTheme,
  };

  function boot() { mountThemeToggle(); renderAuth(document.getElementById('auth')); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
