/* Used by the browser (assets/lldcode.js, live from GitHub):
   turns the LLD course repo's file list + contents into topics, examples and one-file runnable Java. Pure functions, no I/O. */
(function (root) {
  const TOP = ['creational', 'structural', 'behavioral', 'concurrency', 'modern', 'projects'];
  const SECTIONS = {
    creational: 'Creational patterns', structural: 'Structural patterns', behavioral: 'Behavioral patterns',
    projects: 'Machine coding projects', concurrency: 'Concurrency', modern: 'Modern patterns',
  };
  const ORDER = ['projects', 'creational', 'structural', 'behavioral', 'concurrency', 'modern'];
  const NAMES = {
    chainofresponsibility: 'Chain of Responsibility', abstractfactory: 'Abstract Factory', template: 'Template Method',
    movieticketbooking: 'Movie Ticket Booking (BookMyShow)', snakesandladder: 'Snake and Ladder', lrucache: 'LRU Cache',
    elevatorsystem: 'Elevator System', parkinglot: 'Parking Lot', ratelimiter: 'Rate Limiter', tictactoe: 'Tic-Tac-Toe',
    locker: 'Amazon Locker', dependencyinjection: 'Dependency Injection', correctness: 'Thread safety & correctness',
    cacheevictionpolicies: 'Cache eviction policies', stockmarket: 'Stock market ticker', vendingmachine: 'Vending machine',
    'custom-logger': 'Custom logger', paymentgatewaysystem: 'Payment gateway system', 'configuration-manager': 'Configuration manager',
  };
  const pretty = (s) => NAMES[s] || String(s).replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, (c) => c.toUpperCase());
  const hasMain = (src) => /static\s+void\s+main\s*\(/.test(src);
  const dirOf = (p) => p.slice(0, p.lastIndexOf('/'));
  const base = (p) => p.slice(p.lastIndexOf('/') + 1);
  const hidden = (p) => p.split('/').some((s) => s.startsWith('.'));

  /* Group an item's .java paths into examples: every folder with a Main.java (outermost wins) is one example;
     any other .java file is its own example (e.g. the concurrency demos). */
  function variantSpecs(itemPath, javaPaths) {
    const mainDirs = [...new Set(javaPaths.filter((p) => base(p) === 'Main.java').map(dirOf))].sort((a, b) => a.length - b.length);
    const roots = mainDirs.filter((d) => !mainDirs.some((o) => o !== d && d.startsWith(o + '/')));
    const specs = roots.map((d) => ({ dir: d, files: javaPaths.filter((p) => p.startsWith(d + '/')) }));
    javaPaths.filter((p) => !roots.some((d) => p.startsWith(d + '/'))).forEach((p) => specs.push({ dir: p, files: [p], single: true }));
    return specs.map((s) => {
      const vrel = s.dir.slice(itemPath.length + 1);
      const parts = vrel.replace(/\.java$/, '').split('/').filter(Boolean);
      const title = s.single ? pretty(parts[parts.length - 1]) : parts.length === 0 ? 'Full project'
        : parts[0] === 'projects' ? `Project · ${pretty(parts[1] || '')}` : parts[0] === 'sample' ? (parts.length > 1 ? `Sample · ${parts.slice(1).join(' / ')}` : 'Sample') : parts.map(pretty).join(' · ');
      return { key: vrel || 'project', title, path: s.dir, files: s.files.sort(), single: !!s.single };
    });
  }

  /* Merge a multi-file, multi-package example into one Main.java the playground (Wandbox) can compile. */
  function mergeJava(files, variantDir) {
    const typeRe = /^(?:public\s+)?(?:(?:abstract|final|sealed|non-sealed|static)\s+)*(?:class|interface|enum|record|@interface)\s+(\w+)/gm;
    const names = new Map();
    for (const f of files) for (const m of f.content.matchAll(typeRe)) {
      if (names.has(m[1]) && names.get(m[1]) !== f.path) return { ok: false, why: `two classes named ${m[1]}` };
      names.set(m[1], f.path);
    }
    const localRoots = new Set(TOP);
    if (variantDir) files.forEach((f) => { const r = f.path.slice(variantDir.length + 1); if (r.includes('/')) localRoots.add(r.split('/')[0]); });
    const localImport = new RegExp(`^import\\s+(static\\s+)?(${[...localRoots].map((x) => x.replace(/[-]/g, '\\-')).join('|')})\\.[\\w.*]+\\s*;\\s*$`, 'gm');
    const imports = new Set(), bodies = [];
    let mainClass = null, mainIdx = -1;
    files.forEach((f, i) => {
      let s = f.content.replace(/\r\n/g, '\n').replace(/^\s*package\s+[\w.]+\s*;\s*$/m, '').replace(localImport, '');
      s = s.replace(/^import\s+[\w.*\s]+;\s*$/gm, (m) => { imports.add(m.trim()); return ''; });
      // no top-level type may be public: Wandbox saves the file as prog.java
      s = s.replace(/^public\s+((?:(?:abstract|final|sealed|non-sealed)\s+)*(?:class|interface|enum|record|@interface)\s)/gm, '$1');
      if (hasMain(s) && !mainClass) { const m = s.match(/^(?:(?:abstract|final)\s+)*class\s+(\w+)/m); if (m) { mainClass = m[1]; mainIdx = i; } }
      bodies.push(`// ===== ${f.path} =====\n${s.trim()}\n`);
    });
    if (!mainClass) return { ok: false, why: 'no main method' };
    // the class with main() goes FIRST: Java's single-file launcher (java prog.java) runs the first class in the file
    let first;
    if (mainClass === 'Main') { first = bodies[mainIdx]; bodies.splice(mainIdx, 1); }
    else first = `// Entry point for the playground\nclass Main {\n    public static void main(String[] args) throws Exception {\n        ${mainClass}.main(args);\n    }\n}\n`;
    const code = [...imports].sort().join('\n') + (imports.size ? '\n\n' : '') + [first, ...bodies].join('\n');
    return { ok: true, code };
  }

  /* Tree (all file paths in the repo) -> index of sections and topics. */
  function buildIndex(paths, { repo = '', readme = '', commit = '', generated = '' } = {}) {
    const files = paths.filter((p) => !hidden(p));
    const index = { repo, branch: 'main', commit, generated, readme, sections: [] };
    for (const sec of ORDER) {
      const keys = [...new Set(files.filter((p) => p.startsWith(sec + '/') && p.split('/').length > 2).map((p) => p.split('/')[1]))].sort();
      const items = [];
      for (const key of keys) {
        const itemPath = `${sec}/${key}`;
        const java = files.filter((p) => p.startsWith(itemPath + '/') && p.endsWith('.java'));
        const hasReadme = files.includes(itemPath + '/README.md');
        if (!java.length && !hasReadme) continue;
        const variants = variantSpecs(itemPath, java).map((v) => ({ key: v.key, title: v.title, files: v.files.length }));
        items.push({ id: `${sec}__${key}`, key, title: pretty(key), path: itemPath, hasReadme, variants });
      }
      if (items.length) index.sections.push({ key: sec, title: SECTIONS[sec] || pretty(sec), items });
    }
    return index;
  }

  /* The paths a topic needs (so the browser fetches only those). */
  function itemPaths(paths, id) {
    const [sec, key] = id.split('__'), itemPath = `${sec}/${key}`;
    return paths.filter((p) => !hidden(p) && p.startsWith(itemPath + '/') && (p.endsWith('.java') || p.endsWith('README.md')));
  }

  /* One topic: READMEs + files (with contents) -> examples with runnable code. getContent(path) -> string. */
  function buildItem(id, contents) {
    const [sec, key] = id.split('__'), itemPath = `${sec}/${key}`;
    const paths = Object.keys(contents);
    const java = paths.filter((p) => p.endsWith('.java'));
    const variants = variantSpecs(itemPath, java).map((v) => {
      const files = v.files.map((p) => ({ path: p, content: contents[p].replace(/\r\n/g, '\n') }));
      const readmeP = !v.single && v.key !== 'project' ? v.path + '/README.md' : null;
      const merged = mergeJava(files, v.single ? null : v.path);
      return { key: v.key, title: v.title, path: v.path, files, readme: readmeP && contents[readmeP] != null ? contents[readmeP] : null, run: merged.ok ? merged.code : null, why: merged.ok ? null : merged.why };
    });
    return { id, sec, key, title: pretty(key), path: itemPath, readme: contents[itemPath + '/README.md'] ?? null, variants };
  }

  const api = { TOP, ORDER, SECTIONS, pretty, buildIndex, itemPaths, buildItem, mergeJava };
  root.LLDCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
