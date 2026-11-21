#!/usr/bin/env node
/* Snapshot of the LLD course repo (github.com/ShubhiJain67/low-level-design-101) for the site.
   The site reads the repo LIVE from GitHub; this snapshot is the fallback when GitHub can't be reached.
   Usage: node tools/sync-lld-code.mjs <path-to-local-clone>      (or: make lld-code) */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const here = path.dirname(new URL(import.meta.url).pathname);
const Core = createRequire(import.meta.url)(path.join(here, '..', 'assets', 'lldcore.js'));
const SRC = path.resolve(process.argv[2] || '.lld-repo');
const OUT = path.join(here, '..', 'code', 'data');

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  if (d.name.startsWith('.')) return [];
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : [p];
});

if (!fs.existsSync(path.join(SRC, 'README.md'))) { console.error(`No repo found at ${SRC}`); process.exit(1); }
let commit = '';
try { commit = execSync('git rev-parse --short HEAD', { cwd: SRC }).toString().trim(); } catch {}
const paths = walk(SRC).map((p) => path.relative(SRC, p).split(path.sep).join('/'));
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

const index = Core.buildIndex(paths, { readme: read('README.md'), commit, generated: new Date().toISOString().slice(0, 10) });
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let nVar = 0, nRun = 0, nFiles = 0;
for (const s of index.sections) for (const it of s.items) {
  const contents = Object.fromEntries(Core.itemPaths(paths, it.id).map((p) => [p, read(p)]));
  const item = Core.buildItem(it.id, contents);
  item.variants.forEach((v) => { nVar++; nFiles += v.files.length; if (v.run) nRun++; });
  fs.writeFileSync(path.join(OUT, it.id + '.json'), JSON.stringify(item));
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
console.log(`Snapshot of ${Core.REPO}@${commit || '?'}: ${index.sections.reduce((n, s) => n + s.items.length, 0)} topics, ${nVar} examples (${nRun} runnable), ${nFiles} files -> code/data`);
