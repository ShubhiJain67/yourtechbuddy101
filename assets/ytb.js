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
      const small = window.matchMedia('(max-width: 600px)').matches;
      renderGoogleButton(el.firstChild, small ? { type: 'icon', shape: 'circle', size: 'medium' } : {}).catch((e) => console.warn(e));
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
          <a href="${ROOT}practice/">🧪 Mock interviews</a>
          ${u.isAdmin ? `<a href="${ROOT}admin/">🛠 Admin</a><a href="${ROOT}planner/">🎬 Planner</a><a href="${ROOT}admin/problems.html">🧩 Practice problems</a><a href="${ROOT}ideas/">💡 Ideas</a>` : ''}
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
    body.shell .sn-row .ytb-menu{top:auto;bottom:44px;left:0;right:auto}
    body.shell .sn-row .ytb-user{display:flex}
    @media (max-width:900px){body.shell .sn-row .ytb-menu{bottom:auto;top:44px;left:auto;right:0}}
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


  /* ---------------- App shell: sidebar, mobile tab bar, command palette ---------------- */
  const IC = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    courses: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
    practice: '<path d="M9 3h6M10 3v6L4.5 18.5A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>',
    me: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    plan: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    idea: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    admin: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    puzzle: '<path d="M4 7h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 0-4 0H4v-3a2 2 0 1 0 0-4z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    play: '<path d="m7 4 13 8-13 8z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
  const here = location.pathname.replace(/index\.html$/, '');
  const trackParam = new URLSearchParams(location.search).get('track');
  function isOn(path) {
    const full = ROOT + path;
    if (path === '') return here === ROOT;
    return here.startsWith(full);
  }
  function buildShell() {
    const header = document.querySelector('body > header');
    if (!header || document.body.dataset.shell === 'off' || /\/playground\//.test(location.pathname)) return;
    const admin = !!(session && session.user && session.user.isAdmin);
    const item = (path, label, ic, extra = '') => `<a class="sn-item ${isOn(path) ? 'on' : ''}" href="${ROOT}${path}">${icon(ic)}<span>${label}</span>${extra}</a>`;
    const pr = isOn('practice/');
    const sub = (t, label) => `<a class="sn-item sn-sub ${pr && ((trackParam || 'lld') === t) && !/session/.test(here) ? 'on' : ''}" href="${ROOT}practice/?track=${t}">${label}</a>`;
    const sn = document.createElement('div');
    sn.className = 'sn';
    sn.innerHTML = `
      <a class="sn-brand" href="${ROOT}"><span class="sn-logo">YTB</span><span><b>YourTechBuddy</b><small>LLD &amp; HLD in Hindi</small></span></a>
      <button class="sn-search" data-cmdk>${icon('search')}<span>Search</span><kbd>⌘K</kbd></button>
      ${item('', 'Home', 'home')}
      ${item('courses/', 'Courses', 'courses')}
      <a class="sn-item ${pr && !(trackParam || /session/.test(here)) ? '' : ''} ${pr ? 'on' : ''}" href="${ROOT}practice/">${icon('practice')}<span>Mock interviews</span></a>
      ${sub('lld', 'LLD · classes &amp; code')}
      ${sub('hld', 'HLD · system design')}
      ${item('playground/', 'Playground', 'code')}
      ${session ? item('me/', 'My learning', 'me') : ''}
      ${admin ? `<div class="sn-label">Studio</div>${item('planner/', 'Content planner', 'plan')}${item('ideas/', 'Ideas', 'idea')}${item('admin/problems.html', 'Interview problems', 'puzzle')}${item('admin/', 'Courses admin', 'admin')}` : ''}
      <div class="sn-foot">
        <a class="sn-yt" href="https://www.youtube.com/@yourtechbuddy101" target="_blank" rel="noopener"><i></i>Watch on YouTube</a>
        <div class="sn-row"><span class="sn-slot"></span></div>
      </div>`;
    // the admin "problems" link would also match "admin/"; keep only the most specific one active
    const ons = sn.querySelectorAll('.sn-item.on:not(.sn-sub)');
    if (ons.length > 1) ons.forEach((a, i) => { if (i < ons.length - 1 && a.getAttribute('href').length < ons[ons.length - 1].getAttribute('href').length) a.classList.remove('on'); });
    header.prepend(sn);
    const auth = document.getElementById('auth');
    const slot = sn.querySelector('.sn-slot');
    if (auth) slot.replaceWith(auth); else slot.remove();
    document.body.classList.add('shell');
    const tb = document.createElement('nav');
    tb.className = 'tabbar';
    tb.setAttribute('aria-label', 'Main');
    const tab = (path, label, ic) => `<a class="${isOn(path) ? 'on' : ''}" href="${ROOT}${path}">${icon(ic)}${label}</a>`;
    tb.innerHTML = tab('', 'Home', 'home') + tab('courses/', 'Courses', 'courses') + tab('practice/', 'Interviews', 'practice') + tab('playground/', 'Code', 'code') + (session ? tab('me/', 'Me', 'me') : '');
    document.body.appendChild(tb);
  }

  let cmdkEl = null, cmdkItems = null;
  async function cmdkIndex() {
    if (cmdkItems) return cmdkItems;
    const items = [
      { g: 'Pages', t: 'Home', u: ROOT, ic: 'home' },
      { g: 'Pages', t: 'All courses', u: ROOT + 'courses/', ic: 'courses' },
      { g: 'Pages', t: 'LLD mock interviews', u: ROOT + 'practice/?track=lld', ic: 'layers' },
      { g: 'Pages', t: 'HLD mock interviews', u: ROOT + 'practice/?track=hld', ic: 'server' },
      { g: 'Pages', t: 'Code playground', u: ROOT + 'playground/', ic: 'code' },
    ];
    if (session) items.push({ g: 'Pages', t: 'My learning', u: ROOT + 'me/', ic: 'me' });
    if (session && session.user.isAdmin) items.push({ g: 'Studio', t: 'Content planner', u: ROOT + 'planner/', ic: 'plan' }, { g: 'Studio', t: 'Ideas', u: ROOT + 'ideas/', ic: 'idea' }, { g: 'Studio', t: 'Interview problems', u: ROOT + 'admin/problems.html', ic: 'puzzle' }, { g: 'Studio', t: 'Courses admin', u: ROOT + 'admin/', ic: 'admin' });
    const [courses, probs] = await Promise.all([
      getCourses().catch(() => []),
      apiOn ? api('/api/practice/problems').then((r) => r.problems).catch(() => []) : Promise.resolve([]),
    ]);
    courses.forEach((c) => (c.sections || []).forEach((s) => s.lessons.filter((l) => l.youtube).forEach((l) =>
      items.push({ g: 'Lessons', t: l.title, s: c.title, u: `${ROOT}courses/watch.html?c=${encodeURIComponent(c.slug)}&v=${encodeURIComponent(l.youtube)}`, ic: 'play' }))));
    probs.forEach((p) => items.push({ g: 'Mock interviews', t: p.title, s: `${(p.track || 'lld').toUpperCase()} · ${p.difficulty}`, u: `${ROOT}practice/session.html?p=${encodeURIComponent(p.slug)}`, ic: p.track === 'hld' ? 'server' : 'layers' }));
    return (cmdkItems = items);
  }
  function openCmdk() {
    if (!cmdkEl) {
      cmdkEl = document.createElement('div');
      cmdkEl.className = 'cmdk'; cmdkEl.hidden = true;
      cmdkEl.innerHTML = `<div class="cmdk-box" role="dialog" aria-label="Search">
        <div class="cmdk-in">${icon('search')}<input placeholder="Search lessons, interview problems, pages…" aria-label="Search" autocomplete="off"><kbd>esc</kbd></div>
        <div class="cmdk-list" role="listbox"></div>
        <div class="cmdk-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div></div>`;
      document.body.appendChild(cmdkEl);
      const input = cmdkEl.querySelector('input'), list = cmdkEl.querySelector('.cmdk-list');
      let sel = 0, shown = [];
      const draw = async () => {
        const q = input.value.trim().toLowerCase();
        const all = await cmdkIndex();
        const words = q.split(/\s+/).filter(Boolean);
        shown = all.filter((x) => words.every((w) => (x.t + ' ' + (x.s || '') + ' ' + x.g).toLowerCase().includes(w))).slice(0, 40);
        if (!q) shown = all.filter((x) => x.g !== 'Lessons').concat(all.filter((x) => x.g === 'Lessons').slice(0, 5)).slice(0, 40);
        sel = Math.min(sel, Math.max(0, shown.length - 1));
        let g = '';
        list.innerHTML = shown.map((x, i) => (x.g !== g ? `<div class="cmdk-g">${esc((g = x.g))}</div>` : '') +
          `<a href="${esc(x.u)}" class="${i === sel ? 'sel' : ''}" data-i="${i}" role="option"><span class="ic">${icon(x.ic)}</span><span class="t">${esc(x.t)}</span>${x.s ? `<small>${esc(x.s)}</small>` : ''}</a>`).join('')
          || `<div class="cmdk-empty">Nothing matches “${esc(input.value)}”.</div>`;
        list.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
      };
      input.addEventListener('input', () => { sel = 0; draw(); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); draw(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); draw(); }
        else if (e.key === 'Enter' && shown[sel]) { e.preventDefault(); location.href = shown[sel].u; }
      });
      list.addEventListener('mousemove', (e) => { const a = e.target.closest('[data-i]'); if (a && +a.dataset.i !== sel) { sel = +a.dataset.i; list.querySelectorAll('a').forEach((n) => n.classList.toggle('sel', +n.dataset.i === sel)); } });
      cmdkEl.addEventListener('click', (e) => { if (e.target === cmdkEl) closeCmdk(); });
      cmdkEl._draw = draw;
    }
    cmdkEl.hidden = false;
    const input = cmdkEl.querySelector('input'); input.value = ''; input.focus();
    cmdkEl._draw();
  }
  function closeCmdk() { if (cmdkEl) cmdkEl.hidden = true; }
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      if (/\/playground\//.test(location.pathname) && e.key === '/') return;
      e.preventDefault(); cmdkEl && !cmdkEl.hidden ? closeCmdk() : openCmdk();
    } else if (e.key === 'Escape' && cmdkEl && !cmdkEl.hidden) closeCmdk();
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-cmdk]')) { e.preventDefault(); openCmdk(); } });
  const thumb = (id, q = 'mqdefault') => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/${q}.jpg`;

  window.YTB = {
    config: CFG, apiOn, authOn, root: ROOT, api, esc, LS,
    get session() { return session; },
    get user() { return session && session.user; },
    get isAdmin() { return !!(session && session.user && session.user.isAdmin); },
    getCourses, getCourse, progress, renderAuth, renderGoogleButton, signOut, toast: alertBox,
    get theme() { return getTheme(); }, setTheme, icon, thumb, openCmdk,
  };

  function boot() { buildShell(); mountThemeToggle(); renderAuth(document.getElementById('auth')); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
