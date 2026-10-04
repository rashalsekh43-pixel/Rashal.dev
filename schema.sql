-- ============================================================
-- Rashal Portfolio — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================


-- ── TABLE: contact_messages ───────────────────────────────────────────────────
-- Stores contact form submissions from the portfolio website.

CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL    PRIMARY KEY,
  name       TEXT         NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  email      TEXT         NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message    TEXT         NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  read       BOOLEAN      NOT NULL DEFAULT FALSE  -- lets you mark messages as read
);

-- Index for sorting/filtering by date in the dashboard
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at DESC);

-- Row Level Security: the table is only accessible via the service role key
-- (used by the Express backend). The public anon key cannot read or write it.
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- No RLS policies = no access for anon/authenticated roles.
-- The service role bypasses RLS entirely, so the backend can still insert.


-- ── TABLE: projects ───────────────────────────────────────────────────────────
-- Stores portfolio projects served by GET /api/projects.

CREATE TABLE IF NOT EXISTS projects (
  id            BIGSERIAL    PRIMARY KEY,
  title         TEXT         NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description   TEXT         NOT NULL CHECK (char_length(description) BETWEEN 1 AND 500),
  emoji         TEXT         NOT NULL DEFAULT '🌐',
  tags          TEXT[]       NOT NULL DEFAULT '{}',  -- e.g. ARRAY['React','Node.js']
  live_url      TEXT,                                -- nullable until project is live
  code_url      TEXT,                                -- nullable until repo is public
  display_order SMALLINT     NOT NULL DEFAULT 0,     -- controls sort order on the page
  published     BOOLEAN      NOT NULL DEFAULT TRUE,  -- set FALSE to hide without deleting
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_display_order
  ON projects (display_order ASC);

-- RLS: allow anyone to read published projects (public portfolio data)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published projects"
  ON projects
  FOR SELECT
  USING (published = TRUE);

-- Only the service role (backend) can insert/update/delete
-- No INSERT/UPDATE/DELETE policies needed — service role bypasses RLS


-- ── SEED: initial projects ────────────────────────────────────────────────────
-- Replace these with your real projects. Delete rows you don't need.

INSERT INTO projects (title, description, emoji, tags, live_url, code_url, display_order)
VALUES
  (
    'Project Alpha',
    'A full-stack web application with modern UI and seamless user experience.',
    '🌐',
    ARRAY['React', 'Node.js', 'CSS'],
    NULL,
    NULL,
    1
  ),
  (
    'Project Beta',
    'Creative design system and component library built for scalability.',
    '🎨',
    ARRAY['Figma', 'TypeScript', 'Storybook'],
    NULL,
    NULL,
    2
  ),
  (
    'Project Gamma',
    'Mobile-first responsive app with smooth animations and dark mode.',
    '📱',
    ARRAY['React Native', 'Expo', 'Firebase'],
    NULL,
    NULL,
    3
  );
