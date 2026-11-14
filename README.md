# YourTechBuddy Playground

A free in-browser code editor: pick a language, write code, give it input, and hit Run.

| Language | Where it runs |
|---|---|
| JavaScript | In the browser (Web Worker) |
| Python | In the browser ([Pyodide](https://pyodide.org)) |
| C, C++, Java, Go, Rust | Compiled on [Wandbox](https://wandbox.org) through `/api/run` |

Other features: the VS Code editor (Monaco), stdin, a 10s timeout for runaway loops, code autosaved per language, and share links (the code is encoded in the URL).

## Run locally

```bash
npx netlify-cli dev      # http://localhost:8888, with the /api/run proxy working
```

You can also just double-click `index.html`. JS and Python always work that way. Compiled languages then call Wandbox directly, which may be blocked by CORS.

## Deploy

```bash
npx netlify-cli deploy --prod
```

## Files

- `index.html`: the whole frontend
- `netlify/functions/run.mjs`: a small proxy to Wandbox, which caps the body size and validates input
- `netlify.toml`: Netlify config
