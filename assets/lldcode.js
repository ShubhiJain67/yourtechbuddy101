/* Links the site to the LLD course code (code/data, built from github.com/ShubhiJain67/low-level-design-101). */
(function () {
  const ROOT = (window.YTB && window.YTB.root) || '/';
  let idx = null;
  const PATTERN = {
    singleton: 'creational__singleton', factory: 'creational__factory', 'abstract-factory': 'creational__abstractfactory', builder: 'creational__builder', prototype: 'creational__prototype',
    adapter: 'structural__adapter', bridge: 'structural__bridge', composite: 'structural__composite', decorator: 'structural__decorator', facade: 'structural__facade', flyweight: 'structural__flyweight', proxy: 'structural__proxy',
    chain: 'behavioral__chainofresponsibility', command: 'behavioral__command', interpreter: 'behavioral__interpreter', iterator: 'behavioral__iterator', mediator: 'behavioral__mediator', memento: 'behavioral__memento',
    observer: 'behavioral__observer', state: 'behavioral__state', strategy: 'behavioral__strategy', template: 'behavioral__template', visitor: 'behavioral__visitor',
  };
  const PROBLEM = {
    'parking-lot': 'projects__parkinglot', elevator: 'projects__elevatorsystem', bookmyshow: 'projects__movieticketbooking', splitwise: 'projects__splitwise',
    'rate-limiter': 'projects__ratelimiter', 'lru-cache': 'projects__lrucache', 'tic-tac-toe': 'projects__tictactoe', 'snake-ladder': 'projects__snakesandladder', chess: 'projects__chess',
    'vending-machine': 'behavioral__state', 'logging-framework': 'creational__builder',
  };
  // words in a lesson title -> topic (projects first, then patterns)
  const LESSON = [
    [/parking/i, 'projects__parkinglot'], [/splitwise/i, 'projects__splitwise'], [/bookmyshow|movie ticket/i, 'projects__movieticketbooking'],
    [/elevator/i, 'projects__elevatorsystem'], [/tic.?tac/i, 'projects__tictactoe'], [/snake/i, 'projects__snakesandladder'], [/chess/i, 'projects__chess'],
    [/lru/i, 'projects__lrucache'], [/rate limit/i, 'projects__ratelimiter'], [/locker/i, 'projects__locker'],
    [/abstract factory/i, 'creational__abstractfactory'], [/factory/i, 'creational__factory'], [/singleton/i, 'creational__singleton'], [/builder/i, 'creational__builder'], [/prototype/i, 'creational__prototype'],
    [/adapter/i, 'structural__adapter'], [/bridge/i, 'structural__bridge'], [/composite/i, 'structural__composite'], [/decorator/i, 'structural__decorator'], [/facade/i, 'structural__facade'], [/flyweight/i, 'structural__flyweight'], [/proxy/i, 'structural__proxy'],
    [/chain of resp/i, 'behavioral__chainofresponsibility'], [/command/i, 'behavioral__command'], [/interpreter/i, 'behavioral__interpreter'], [/iterator/i, 'behavioral__iterator'], [/mediator/i, 'behavioral__mediator'], [/memento/i, 'behavioral__memento'],
    [/observer/i, 'behavioral__observer'], [/state pattern|state design/i, 'behavioral__state'], [/strategy/i, 'behavioral__strategy'], [/template/i, 'behavioral__template'], [/visitor/i, 'behavioral__visitor'],
    [/thread|concurren|race condition/i, 'concurrency__correctness'], [/dependency injection/i, 'modern__dependencyinjection'], [/repository pattern/i, 'modern__repository'],
  ];
  /* ---- Live from GitHub (fresh within seconds of a push), with the committed snapshot as fallback ---- */
  const REPO = 'ShubhiJain67/low-level-design-101', BRANCH = 'main';
  const ls = { get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  let live = null; // { sha, paths }
  async function liveTree() {
    if (live) return live;
    // ETag revalidation: a 304 "not modified" answer is free (doesn't count toward GitHub's rate limit)
    const cached = ls.get('lld:tree');
    const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`, {
      headers: cached && cached.etag ? { 'If-None-Match': cached.etag } : {}, cache: 'no-cache',
    });
    if (r.status === 304 && cached) return (live = cached);
    if (!r.ok) throw new Error('GitHub ' + r.status);
    const j = await r.json();
    live = { sha: j.sha, etag: r.headers.get('ETag'), paths: j.tree.filter((x) => x.type === 'blob').map((x) => x.path) };
    ls.set('lld:tree', live);
    return live;
  }
  const raw = (sha, p) => fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/${p.split('/').map(encodeURIComponent).join('/')}`).then((r) => { if (!r.ok) throw new Error(p + ' ' + r.status); return r.text(); });
  async function ensureCore() {
    if (window.LLDCore) return;
    await new Promise((res, rej) => { const s = document.createElement('script'); s.src = ROOT + 'assets/lldcore.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function loadLive() {
    await ensureCore();
    const t = await liveTree();
    const readme = t.paths.includes('README.md') ? await raw(t.sha, 'README.md') : '';
    const i = LLDCore.buildIndex(t.paths, { readme, commit: t.sha.slice(0, 7) });
    i.live = true;
    return i;
  }
  async function load() {
    if (!idx) idx = loadLive().catch((e) => {
      console.warn('[LLD] live GitHub load failed, using snapshot:', e.message);
      return fetch(ROOT + 'code/data/index.json').then((r) => (r.ok ? r.json() : null)).then((j) => (j && (j.live = false), j)).catch(() => null);
    });
    return idx;
  }
  const items = {};
  async function item(id) {
    if (items[id]) return items[id];
    const i = await load();
    if (i && i.live) {
      items[id] = (async () => {
        const t = await liveTree();
        const ps = LLDCore.itemPaths(t.paths, id);
        if (!ps.length) throw new Error('topic not found');
        const texts = await Promise.all(ps.map((p) => raw(t.sha, p)));
        return LLDCore.buildItem(id, Object.fromEntries(ps.map((p, k) => [p, texts[k]])));
      })().catch((e) => { console.warn('[LLD] live topic failed, using snapshot:', e.message); delete items[id]; return snapshotItem(id); });
    } else items[id] = snapshotItem(id);
    return items[id];
  }
  const snapshotItem = (id) => fetch(`${ROOT}code/data/${id}.json`).then((r) => { if (!r.ok) throw new Error('not found'); return r.json(); });
  async function topic(id) {
    const i = await load(); if (!i) return null;
    for (const s of i.sections) { const t = s.items.find((x) => x.id === id); if (t) return { ...t, section: s }; }
    return null;
  }
  const url = (id, v) => `${ROOT}code/?t=${encodeURIComponent(id)}${v ? '&v=' + encodeURIComponent(v) : ''}`;
  window.LLDCode = {
    load, item, topic, url,
    forPattern: (key) => topic(PATTERN[key]),
    forProblem: (slug) => topic(PROBLEM[slug]),
    forLesson: (title) => {
      // "Strategy pattern with a parking lot example" is about the pattern, so patterns win when the title says "pattern"
      const list = /pattern/i.test(title || '') ? LESSON.filter(([, id]) => !id.startsWith('projects__')).concat(LESSON.filter(([, id]) => id.startsWith('projects__'))) : LESSON;
      const hit = list.find(([re]) => re.test(title || ''));
      return hit ? topic(hit[1]) : Promise.resolve(null);
    },
    github: (path, repo = 'ShubhiJain67/low-level-design-101') => `https://github.com/${repo}/tree/main/${path}`,
  };
})();
