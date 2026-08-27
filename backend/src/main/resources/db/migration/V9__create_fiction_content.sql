CREATE TABLE fiction_entries (
  id BIGSERIAL PRIMARY KEY,
  entry_type VARCHAR(20) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fiction_entries_type_slug_unique UNIQUE (entry_type, slug)
);

CREATE TABLE commission_assets (
  id UUID PRIMARY KEY,
  stored_name VARCHAR(100) NOT NULL UNIQUE,
  original_name VARCHAR(500) NOT NULL,
  title VARCHAR(240) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO fiction_entries (
  entry_type, slug, title, description, display_order, content, published
) VALUES
(
  'NOVEL',
  'chapter-1',
  '第一章',
  '用 Markdown 编写的故事章节示例。',
  1,
  $$这里是故事正文。

你可以直接用 Markdown 写段落、对白和分节标题。

## 场景

故事从这里开始。$$,
  TRUE
),
(
  'CHARACTER',
  'oc-a',
  'Character A',
  'Replace this with the character name, keywords, and a short hook.',
  1,
  $$## Profile

Waiting for character details.

## Personality / History

Waiting for character details.

## Relationships

Waiting for character details.

## Visual Materials

Waiting for character details.$$
  , TRUE
),
(
  'CHARACTER',
  'oc-b',
  'Character B',
  'Replace this with the character name, keywords, and a short hook.',
  2,
  $$## Profile

Waiting for character details.

## Personality / History

Waiting for character details.

## Relationships

Waiting for character details.

## Visual Materials

Waiting for character details.$$
  , TRUE
);
