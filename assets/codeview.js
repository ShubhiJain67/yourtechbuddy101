/* Embeddable code viewer for the LLD course code (used under the lesson video and on /code/).
   LLDView.mount(el, { item, live, root, compact, state, onChange }) renders examples, Code/Notes tabs, files, highlighted code, Run in Playground. */
(function () {
  const { root: ROOT, esc, b64url, loadScript } = YTB, REPO = YTB.config.codeRepo;
  const ensureLibs = () => Promise.all([
    loadScript(ROOT + 'assets/vendor/marked.min.js').catch(() => false),
    loadScript(ROOT + 'assets/vendor/highlight.min.js').catch(() => false),
  ]);
  function md(src) {
    let html;
    if (window.marked) html = marked.parse(src, { gfm: true });
    else html = src.split(/\n{2,}/).map((p) => p.startsWith('#') ? `<h2>${esc(p.replace(/^#+\s*/, ''))}</h2>` : `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
    const t = document.createElement('template'); t.innerHTML = html;
    t.content.querySelectorAll('script,iframe,object,embed,style,form').forEach((n) => n.remove());
    t.content.querySelectorAll('*').forEach((n) => [...n.attributes].forEach((a) => { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name); }));
    t.content.querySelectorAll('a[href]').forEach((a) => { if (/^https?:/.test(a.getAttribute('href'))) { a.target = '_blank'; a.rel = 'noopener'; } });
    if (window.hljs) t.content.querySelectorAll('pre code').forEach((c) => { try { hljs.highlightElement(c); } catch {} });
    return t.innerHTML;
  }
  const highlight = (code) => { if (window.hljs) { try { return hljs.highlight(code, { language: 'java' }).value; } catch {} } return esc(code); };

  const CSS = `
  .cv{display:flex;flex-direction:column;gap:12px;min-width:0}
  .cv-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .cv-top .sp{flex:1}
  .cv-bigtabs{display:flex;gap:4px;width:100%;border-bottom:1px solid var(--border);margin-bottom:2px}
  .cv-bigtabs button{border:0;background:none;padding:10px 4px 11px;margin-right:18px;font:600 16px var(--sans);color:var(--muted);border-bottom:2.5px solid transparent;margin-bottom:-1px}
  .cv-bigtabs button:hover:not(:disabled){color:var(--text)}
  .cv-bigtabs button[aria-selected="true"]{color:var(--text);border-bottom-color:var(--accent)}
  .cv-bigtabs button:disabled{opacity:.45;cursor:not-allowed}
  .cv-vtabs{display:flex;gap:6px;flex-wrap:wrap}
  .cv-vtabs button{border:1px solid var(--border);background:var(--panel);border-radius:99px;padding:5px 12px;font-size:13px;color:var(--muted)}
  .cv-vtabs button:hover{border-color:var(--border-strong);color:var(--text)}
  .cv-vtabs button[aria-pressed="true"]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent);font-weight:600}
  .cv-vtabs button i{font-style:normal;font:11.5px var(--mono);color:var(--faint);margin-left:4px}
  .cv-ide{display:grid;grid-template-columns:210px minmax(0,1fr);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;background:var(--bg)}
  .cv-files{background:var(--panel2);border-right:1px solid var(--border);padding:6px 0;overflow:auto;max-height:var(--cv-h,600px)}
  .cv-files .dir{font:500 11.5px var(--mono);color:var(--faint);padding:8px 12px 2px}
  .cv-files button{display:block;width:100%;text-align:left;border:0;background:none;padding:5px 12px 5px 18px;font:12.5px var(--mono);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cv-files button:hover{color:var(--text);background:var(--panel3)}
  .cv-files button[aria-current="true"]{color:var(--accent);background:var(--accent-soft);font-weight:600}
  .cv-pane{display:flex;flex-direction:column;min-width:0}
  .cv-bar{display:flex;align-items:center;gap:8px;padding:7px 10px 7px 12px;border-bottom:1px solid var(--border);font:12.5px var(--mono);color:var(--muted);background:var(--panel)}
  .cv-bar .p{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cv-bar button{border:1px solid var(--border);background:var(--panel2);border-radius:6px;padding:3px 9px;font:12px var(--sans);color:var(--muted)}
  .cv-bar button:hover{color:var(--text);border-color:var(--border-strong)}
  .cv-code{display:flex;overflow:auto;max-height:var(--cv-h,600px);font:13px/1.65 var(--mono)}
  .cv-gutter{padding:12px 10px 12px 12px;text-align:right;color:var(--faint);user-select:none;border-right:1px solid var(--border);flex:none}
  .cv-code pre{margin:0;padding:12px 16px;flex:1;tab-size:4}
  .cv-code code{font:inherit;background:none}
  .cv-acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .cv-acts .note{font-size:13px}
  .cv-md{font-size:15px;line-height:1.65;max-width:84ch}
  .cv-md h1{font:600 22px/1.25 var(--sans);margin:4px 0 12px}
  .cv-md h2{font:600 18px/1.3 var(--sans);margin:24px 0 8px}
  .cv-md h3{font:600 15.5px var(--sans);margin:18px 0 6px}
  .cv-md p,.cv-md ul,.cv-md ol{margin:0 0 12px}
  .cv-md hr{border:0;border-top:1px solid var(--border);margin:20px 0}
  .cv-md code{font:13px var(--mono);background:var(--panel2);padding:1px 5px;border-radius:4px}
  .cv-md pre{background:var(--bg);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px 14px;overflow:auto}
  .cv-md pre code{background:none;padding:0}
  .cv-md table{border-collapse:collapse;width:100%;font-size:13.5px;margin:0 0 16px;display:block;overflow-x:auto}
  .cv-md th,.cv-md td{border:1px solid var(--border);padding:7px 10px;text-align:left;vertical-align:top}
  .cv-md th{background:var(--panel2);font-weight:600}
  .cv-md a{color:var(--accent)}
  .cv-md blockquote{margin:0 0 12px;padding:4px 14px;border-left:3px solid var(--accent);color:var(--muted)}
  .cv .hljs-keyword,.cv .hljs-built_in,.cv-md .hljs-keyword{color:#C792EA}
  .cv .hljs-title,.cv-md .hljs-title{color:#82AAFF}
  .cv .hljs-string,.cv-md .hljs-string{color:#C3E88D}
  .cv .hljs-number,.cv .hljs-literal,.cv-md .hljs-number{color:#F78C6C}
  .cv .hljs-comment,.cv-md .hljs-comment{color:var(--faint);font-style:italic}
  .cv .hljs-type,.cv .hljs-meta,.cv-md .hljs-type{color:#FFCB6B}
  [data-theme="light"] .cv .hljs-keyword,[data-theme="light"] .cv .hljs-built_in,[data-theme="light"] .cv-md .hljs-keyword{color:#7C3AED}
  [data-theme="light"] .cv .hljs-title,[data-theme="light"] .cv-md .hljs-title{color:#1D4ED8}
  [data-theme="light"] .cv .hljs-string,[data-theme="light"] .cv-md .hljs-string{color:#15803D}
  [data-theme="light"] .cv .hljs-number,[data-theme="light"] .cv .hljs-literal,[data-theme="light"] .cv-md .hljs-number{color:#B45309}
  [data-theme="light"] .cv .hljs-type,[data-theme="light"] .cv .hljs-meta,[data-theme="light"] .cv-md .hljs-type{color:#A16207}
  @media (max-width:760px){
    .cv-ide{grid-template-columns:minmax(0,1fr)}
    .cv-files{display:flex;gap:6px;overflow-x:auto;padding:8px;border-right:0;border-bottom:1px solid var(--border);max-height:none}
    .cv-files .dir{display:none}
    .cv-files button{width:auto;flex:none;border:1px solid var(--border);border-radius:99px;padding:5px 11px}
    .cv-code{font-size:12.5px;max-height:70vh}
    .cv-gutter{display:none}
  }`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  async function mount(el, opts) {
    await ensureLibs();
    const { item } = opts;
    const L = { code: 'Code', notes: 'Notes', ...(opts.labels || {}) };
    let s = { v: null, f: null, tab: 'code', ...(opts.state || {}) };
    function draw() {
      const v = item.variants.find((x) => x.key === s.v) || item.variants[0];
      s.v = v ? v.key : null;
      const notes = (v && v.readme) || item.readme;
      if (s.tab === 'notes' && !notes) s.tab = 'code';
      const f = v ? (v.files.find((x) => x.path === s.f) || v.files.find((x) => /\/Main\.java$/.test(x.path)) || v.files[0]) : null;
      s.f = f ? f.path : null;
      const baseDir = v ? (v.path.endsWith('.java') ? v.path.slice(0, v.path.lastIndexOf('/')) : v.path) : '';
      const short = (p) => p.slice(baseDir.length + 1) || p.split('/').pop();
      let lastDir = null;
      const fileList = v ? v.files.map((x) => {
        const sh = short(x.path), dir = sh.includes('/') ? sh.slice(0, sh.lastIndexOf('/')) : '';
        const head = dir !== lastDir ? `<div class="dir">${esc(dir || '.')}/</div>` : ''; lastDir = dir;
        return `${head}<button data-cvf="${esc(x.path)}" aria-current="${x.path === s.f}" title="${esc(sh)}">${esc(sh.split('/').pop())}</button>`;
      }).join('') : '';
      const code = f ? f.content : '', lines = code.split('\n').length;
      el.innerHTML = `<div class="cv" style="${opts.height ? `--cv-h:${opts.height}` : ''}">
        <div class="cv-top">
          ${opts.bigTabs
            ? `<div class="cv-bigtabs" role="tablist"><button role="tab" data-cvtab="code" aria-selected="${s.tab === 'code'}">${esc(L.code)}</button><button role="tab" data-cvtab="notes" aria-selected="${s.tab === 'notes'}" ${notes ? '' : 'disabled title="No notes for this lesson yet"'}>${esc(L.notes)}</button></div>`
            : notes ? `<div class="tabs" role="tablist"><button role="tab" data-cvtab="code" aria-selected="${s.tab === 'code'}">${esc(L.code)}</button><button role="tab" data-cvtab="notes" aria-selected="${s.tab === 'notes'}">${esc(L.notes)}</button></div>` : ''}
          ${item.variants.length > 1 ? `<div class="cv-vtabs" role="group" aria-label="Examples">${item.variants.map((x) => `<button data-cvv="${esc(x.key)}" aria-pressed="${x.key === s.v}">${esc(x.title)}<i>${x.files.length}</i></button>`).join('')}</div>` : ''}
        </div>
        ${s.tab === 'notes' ? `<div class="cv-md">${md(notes)}</div>` : v ? `
          <div class="cv-ide">
            <nav class="cv-files" aria-label="Files">${fileList}</nav>
            <div class="cv-pane">
              <div class="cv-bar"><span class="p">${esc(f ? short(f.path) : '')}</span><span>${lines} lines</span><button data-cvact="copy">Copy</button></div>
              <div class="cv-code"><div class="cv-gutter">${Array.from({ length: lines }, (_, i) => i + 1).join('<br>')}</div><pre><code>${highlight(code)}</code></pre></div>
            </div>
          </div>
          <div class="cv-acts">
            ${v.run && opts.run !== false ? `<a class="btn primary sm" href="${ROOT}playground/#lang=java&code=${b64url(v.run)}" target="_blank" rel="noopener">▶ Run in Playground</a>` : ''}
            <a class="btn sm ${opts.run === false ? 'primary' : ''}" href="https://github.com/${REPO}/tree/main/${esc(v.path)}" target="_blank" rel="noopener">${opts.run === false ? 'View on GitHub ↗' : 'GitHub ↗'}</a>
            ${opts.fullLink ? `<a class="btn sm ghost" href="${opts.fullLink}">Open full screen</a>` : ''}
            <span class="note">${opts.run === false ? `${v.files.length} file${v.files.length === 1 ? '' : 's'} · live from GitHub` : v.run ? `${v.files.length} file${v.files.length === 1 ? '' : 's'} · live from GitHub` : 'Support files only'}</span>
          </div>` : '<p class="note">No code for this topic yet.</p>'}
      </div>`;
      opts.onChange && opts.onChange({ ...s });
    }
    el.onclick = (e) => {
      const v = e.target.closest('[data-cvv]'); if (v) { s = { ...s, v: v.dataset.cvv, f: null }; return draw(); }
      const f = e.target.closest('[data-cvf]'); if (f) { s.f = f.dataset.cvf; return draw(); }
      const t = e.target.closest('[data-cvtab]'); if (t && !t.disabled) { s.tab = t.dataset.cvtab; return draw(); }
      if (e.target.closest('[data-cvact="copy"]')) {
        const fv = item.variants.find((x) => x.key === s.v), ff = fv && fv.files.find((x) => x.path === s.f);
        if (ff) navigator.clipboard.writeText(ff.content).then(() => window.YTB && YTB.toast('Copied'), () => window.YTB && YTB.toast('Copy failed'));
      }
    };
    draw();
    return { get state() { return { ...s }; } };
  }
  window.LLDView = { mount, md, ensureLibs };
})();
