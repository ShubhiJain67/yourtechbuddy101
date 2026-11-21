// Site configuration. Leave apiBase empty to run without logins (courses.js + browser-only progress).
window.YTB_CONFIG = {
  // Your Cloudflare Worker URL, e.g. 'https://yourtechbuddy-api.<your-subdomain>.workers.dev'
  apiBase: 'https://yourtechbuddy-api.yourtechbuddy.workers.dev',
  // Google OAuth Web Client ID (same value as GOOGLE_CLIENT_ID in api/wrangler.toml)
  googleClientId: '191165526401-dd71tv54d0f1pn45ud2jtg22i2b35fvn.apps.googleusercontent.com',
  // GitHub repo with the LLD course code (shown live under each lesson)
  codeRepo: 'ShubhiJain67/low-level-design-101',
};
