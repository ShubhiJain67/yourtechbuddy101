-- Content planner: production status + private notes per video, and an opt-in "coming soon" list per course.
ALTER TABLE lessons ADD COLUMN status TEXT NOT NULL DEFAULT 'idea';   -- idea | scripted | shot | edited | published
ALTER TABLE lessons ADD COLUMN notes TEXT NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN show_upcoming INTEGER NOT NULL DEFAULT 0;
UPDATE lessons SET status = 'published' WHERE youtube <> '';
