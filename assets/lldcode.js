/* The LLD course code, read live from GitHub (repo: YTB.config.codeRepo). No saved copy: if GitHub can't be
   reached, callers show a GitHub link instead. Topics are linked to lessons, problems and patterns by name
   (YTB.match), so new lessons/problems/topics need no code changes. */
(function () {
  const ROOT = YTB.root, REPO = YTB.config.codeRepo, BRANCH = 'main';
  const ls = { get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const github = (path = '') => `https://github.com/${REPO}${path ? `/tree/${BRANCH}/${path}` : ''}`;

  let tree = null;
  async function liveTree() {
    // ETag revalidation: an unchanged repo answers 304, which doesn't count toward GitHub's rate limit
    const key = 'lld:tree:' + REPO, cached = ls.get(key);
    const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`, {
      headers: cached && cached.etag ? { 'If-None-Match': cached.etag } : {}, cache: 'no-cache',
    });
    if (r.status === 304 && cached) return cached;
    if (!r.ok) throw new Error('GitHub ' + r.status);
    const j = await r.json();
    const t = { sha: j.sha, etag: r.headers.get('ETag'), paths: j.tree.filter((x) => x.type === 'blob').map((x) => x.path) };
    ls.set(key, t);
    return t;
  }
  const raw = (sha, p) => fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/${p.split('/').map(encodeURIComponent).join('/')}`)
    .then((r) => { if (!r.ok) throw new Error(p + ' ' + r.status); return r.text(); });

  let idx = null;
  function load() {
    return (idx ||= (async () => {
      await YTB.loadScript(ROOT + 'assets/lldcore.js');
      tree = await liveTree();
      const readme = tree.paths.includes('README.md') ? await raw(tree.sha, 'README.md') : '';
      return LLDCore.buildIndex(tree.paths, { repo: REPO, readme, commit: tree.sha.slice(0, 7) });
    })().catch((e) => { console.warn('[LLD] GitHub unavailable:', e.message); idx = null; return null; }));
  }
  const items = {};
  function item(id) {
    return (items[id] ||= (async () => {
      if (!(await load())) throw new Error('GitHub unavailable');
      const ps = LLDCore.itemPaths(tree.paths, id);
      if (!ps.length) throw new Error('topic not found');
      const texts = await Promise.all(ps.map((p) => raw(tree.sha, p)));
      return LLDCore.buildItem(id, Object.fromEntries(ps.map((p, k) => [p, texts[k]])));
    })().catch((e) => { delete items[id]; throw e; }));
  }

  /* ---- linking by name ---- */
  const topicKeys = (t) => [t.title.replace(/\(.*\)/, ''), (t.title.match(/\((.*)\)/) || [])[1], t.key, ...t.variants.filter((v) => /project/i.test(v.title)).map((v) => v.title)].filter(Boolean);
  async function topics(filter) {
    const i = await load(); if (!i) return [];
    return i.sections.flatMap((s) => s.items.map((t) => ({ ...t, section: s }))).filter(filter || (() => true));
  }
  async function find(text, { prefer } = {}) {
    let all = await topics();
    if (prefer) { const first = YTB.match(text, all.filter(prefer), topicKeys); if (first) return withVariant(first, text); }
    const t = YTB.match(text, all, topicKeys);
    return t ? withVariant(t, text) : null;
  }
  // if the text names one of the topic's projects (e.g. "Vending machine"), point at that example
  const withVariant = (t, text) => ({ ...t, variant: (YTB.match(text, t.variants.filter((v) => /project/i.test(v.title)), (v) => [v.title]) || {}).key || null });
  const notProject = (t) => t.section.key !== 'projects';

  window.LLDCode = {
    load, item, github, repo: REPO,
    topic: async (id) => (await topics((t) => t.id === id))[0] || null,
    // a lesson that says "pattern" is about the pattern even if its example is a project ("Strategy pattern with a parking lot")
    forLesson: (title) => find(title, /pattern/i.test(title || '') ? { prefer: notProject } : {}),
    forPattern: (p) => find([p.name, ...(p.aliases || [])].join(' '), { prefer: notProject }),
    forProblem: (p) => find(`${p.title} ${p.slug.replace(/-/g, ' ')}`),
  };
})();
