// Site configuration. Leave apiBase empty to run without logins (courses.js + browser-only progress).
window.YTB_CONFIG = {
  // Your Cloudflare Worker URL, e.g. 'https://yourtechbuddy-api.<your-subdomain>.workers.dev'
  apiBase: 'https://yourtechbuddy-api.yourtechbuddy.workers.dev',
  // Google OAuth Web Client ID (same value as GOOGLE_CLIENT_ID in api/wrangler.toml)
  // 1:1 sessions (paid, booked on Topmate)
  topmate: 'https://topmate.io/shubhijain',
  googleClientId: '191165526401-dd71tv54d0f1pn45ud2jtg22i2b35fvn.apps.googleusercontent.com',
};
