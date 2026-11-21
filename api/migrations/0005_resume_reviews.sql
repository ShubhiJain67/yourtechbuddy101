-- Resume review requests. The file itself is only emailed (never stored here).
CREATE TABLE IF NOT EXISTS resume_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT '',
  level       TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL DEFAULT '',
  filename    TEXT NOT NULL DEFAULT '',
  size        INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_resume_user ON resume_requests(user_id, created_at);
