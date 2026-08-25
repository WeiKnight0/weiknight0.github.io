CREATE TABLE note_articles (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(240) NOT NULL,
  summary TEXT NOT NULL,
  cover_url VARCHAR(1000),
  tags VARCHAR(1000) NOT NULL DEFAULT '',
  series VARCHAR(240),
  series_order INTEGER,
  status VARCHAR(20) NOT NULL,
  content_format VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX note_articles_status_published_idx
  ON note_articles (status, published_at DESC);

CREATE TABLE note_assets (
  id UUID PRIMARY KEY,
  stored_name VARCHAR(100) NOT NULL UNIQUE,
  original_name VARCHAR(500) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
