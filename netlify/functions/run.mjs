// Tiny proxy to the free Wandbox compiler API (https://wandbox.org).
//   GET  /api/run  -> list of available compilers
//   POST /api/run  -> compile & run { code, compiler, stdin }
// Keeps the browser off third-party CORS rules and gives us one place to add limits later.

const WANDBOX = 'https://wandbox.org/api';
const MAX_BODY = 100 * 1024; // 100 KB of code + stdin is plenty for a playground

const json = (body, status = 200, extra = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extra },
  });

export default async (req) => {
  try {
    if (req.method === 'GET') {
      const r = await fetch(`${WANDBOX}/list.json`);
      return json(await r.text(), r.status, { 'cache-control': 'public, max-age=3600' });
    }

    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const raw = await req.text();
    if (raw.length > MAX_BODY) return json({ error: 'Code too large' }, 413);

    let input;
    try { input = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON' }, 400); }
    if (typeof input.code !== 'string' || typeof input.compiler !== 'string') {
      return json({ error: 'code and compiler are required' }, 400);
    }

    const payload = {
      code: input.code,
      compiler: input.compiler,
      stdin: typeof input.stdin === 'string' ? input.stdin : '',
      save: false,
    };

    const r = await fetch(`${WANDBOX}/compile.json`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json(await r.text(), r.status);
  } catch (err) {
    return json({ error: 'Upstream error', detail: String(err) }, 502);
  }
};

export const config = { path: '/api/run' };
