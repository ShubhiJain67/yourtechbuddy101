# YourTechBuddy Playground

Live at **https://yourtechbuddy101.com**. It's a free code editor in the browser: pick a language, write code, add input, and click Run.

| Language | Where it runs |
|---|---|
| JavaScript | In the browser (Web Worker) |
| Python | In the browser ([Pyodide](https://pyodide.org)) |
| C, C++, Java, Go, Rust | Compiled on [Wandbox](https://wandbox.org) |

## Ship a change

```bash
make ship m="what you changed"
```

This commits everything and pushes to `main`, and GitHub Pages redeploys automatically in about a minute.

## Hosting

- GitHub Pages serves the site from `main` at `/ (root)`. The `CNAME` file sets the custom domain.
- DNS is at GoDaddy: four A records for `@` pointing to 185.199.108–111.153, and a CNAME for `www` pointing to `shubhijain67.github.io`.

## Run locally

Open `index.html` in a browser.
