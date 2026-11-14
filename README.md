# YourTechBuddy

The site is live at **https://yourtechbuddy101.com**.

| Page | Path |
|---|---|
| Code Playground | `/` |
| Courses | `/courses/` |
| Course player | `/courses/watch.html?c=<slug>` |
| My courses (learners) | `/me/` |
| Admin (add and edit courses) | `/admin/` |

## Everyday commands

```bash
make dev                         # preview locally at http://localhost:8000
make ship m="what you changed"   # commit and push; GitHub Pages is live in about a minute
make api-deploy                  # deploy backend changes (api/src/index.js)
make api-logs                    # live backend logs
```

## How it fits together

- **Frontend:** static files on GitHub Pages, served from the `main` branch of this repo. DNS is at GoDaddy: four A records for `@` pointing to 185.199.108–111.153, and a CNAME for `www` pointing to `shubhijain67.github.io`.
- **Backend:** a Cloudflare Worker (`api/`) with a D1 database. It handles Google sign-in, per-user progress, admin course editing and YouTube import.
- **Without the backend:** if `assets/config.js` is empty, the site still works. Courses come from `courses/courses.js`, and progress is saved in the browser only.

## One-time backend setup (about 10 minutes)

### 1. Google (sign-in and YouTube import)

At https://console.cloud.google.com, create a project (for example "YourTechBuddy"), then:

1. **APIs & Services → OAuth consent screen:** choose External, set the app name to "YourTechBuddy", add your email, then publish the app.
2. **Credentials → Create credentials → OAuth client ID → Web application.** Add these authorized JavaScript origins:
   `https://yourtechbuddy101.com`, `https://www.yourtechbuddy101.com`, `http://localhost:8000`, `http://127.0.0.1:5501`.
   Copy the **Client ID**.
3. **Library → YouTube Data API v3 → Enable.** Then go to **Credentials → Create credentials → API key** and copy the key. You can optionally restrict it to "YouTube Data API v3".

### 2. Cloudflare (API and database)

```bash
cd api
npx wrangler login                        # opens your browser; a free account is fine
npx wrangler d1 create yourtechbuddy      # copy the database_id it prints
```

In `api/wrangler.toml`, paste the `database_id`, and paste your Google Client ID into `GOOGLE_CLIENT_ID`. Then run:

```bash
npx wrangler d1 execute yourtechbuddy --remote --file=schema.sql
openssl rand -hex 32 | npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_EMAILS      # type your Google email (separate several with commas)
npx wrangler secret put YOUTUBE_API_KEY   # paste the YouTube API key
npx wrangler deploy                       # prints https://yourtechbuddy-api.<you>.workers.dev
cd ..
```

### 3. Point the site at the API

In `assets/config.js`, set:

```js
apiBase: 'https://yourtechbuddy-api.<you>.workers.dev',
googleClientId: '<your client id>.apps.googleusercontent.com',
```

Then run `make ship m="Enable logins"`.

### 4. Create your first course

1. Open `/admin/` and sign in with your admin Google account.
2. Click **+ New course** and paste a playlist link.
3. Arrange the sections, tick **Published**, and click **Save**.

If you give a course the slug `lld`, it replaces the old LLD entry from `courses.js`.

## Data and privacy notes

- Only the `ADMIN_EMAILS` secret on the Worker can grant admin rights. The frontend can't.
- Learner progress is stored per YouTube video, so reordering lessons never resets it.
- Deleting a course in admin also deletes learners' progress for that course.
