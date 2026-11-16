-- YourTechBuddy API schema (Cloudflare D1 / SQLite)
-- Apply:  npx wrangler d1 execute yourtechbuddy --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub  TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  picture     TEXT NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL,
  last_login  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  level       TEXT NOT NULL DEFAULT '',
  tags        TEXT NOT NULL DEFAULT '[]',   -- JSON array
  practice    TEXT NOT NULL DEFAULT '',     -- Playground language
  published   INTEGER NOT NULL DEFAULT 0,
  position    INTEGER NOT NULL DEFAULT 0,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sections_course ON sections(course_id, position);

CREATE TABLE IF NOT EXISTS lessons (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_id  INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  youtube     TEXT NOT NULL DEFAULT '',     -- 11-char video id, '' = coming soon
  duration    TEXT NOT NULL DEFAULT '',
  position    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, position);

-- Progress is keyed by YouTube video id, so re-arranging lessons never loses progress.
CREATE TABLE IF NOT EXISTS progress (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  video_id     TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, course_id, video_id)
);

-- Private ideas board (admin only)
CREATE TABLE IF NOT EXISTS ideas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  notes       TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'other',   -- youtube | instagram | course | website | other
  status      TEXT NOT NULL DEFAULT 'idea',    -- idea | planned | doing | done
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status, updated_at);
