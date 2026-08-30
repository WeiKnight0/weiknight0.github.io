CREATE TABLE fiction_novels (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fiction_characters (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO fiction_novels (id, slug, title, description, display_order, updated_at)
SELECT id, slug, title, description, display_order, updated_at
FROM fiction_entries
WHERE entry_type = 'NOVEL';

INSERT INTO fiction_characters (id, slug, title, description, display_order, content, updated_at)
SELECT id, slug, title, description, display_order, content, updated_at
FROM fiction_entries
WHERE entry_type = 'CHARACTER';

CREATE TABLE fiction_novel_chapters (
  id BIGSERIAL PRIMARY KEY,
  novel_id BIGINT NOT NULL REFERENCES fiction_novels(id) ON DELETE CASCADE,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(240) NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fiction_novel_chapters_novel_slug_unique UNIQUE (novel_id, slug)
);

INSERT INTO fiction_novel_chapters (id, novel_id, slug, title, content, display_order, updated_at)
SELECT id, novel_id, slug, title, content, display_order, updated_at
FROM fiction_chapters;

SELECT setval(
  pg_get_serial_sequence('fiction_novel_chapters', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM fiction_novel_chapters;

INSERT INTO fiction_novel_chapters (novel_id, slug, title, content, display_order, updated_at)
SELECT entry.id, 'legacy-content', 'Legacy content', entry.content, 1, entry.updated_at
FROM fiction_entries entry
WHERE entry.entry_type = 'NOVEL'
  AND BTRIM(entry.content) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM fiction_novel_chapters chapter WHERE chapter.novel_id = entry.id
  );

CREATE INDEX fiction_novels_order_idx
  ON fiction_novels (display_order, title);
CREATE INDEX fiction_characters_order_idx
  ON fiction_characters (display_order, title);
CREATE INDEX fiction_novel_chapters_novel_order_idx
  ON fiction_novel_chapters (novel_id, display_order, title);

SELECT setval(
  pg_get_serial_sequence('fiction_novels', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM fiction_novels;
SELECT setval(
  pg_get_serial_sequence('fiction_characters', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM fiction_characters;
SELECT setval(
  pg_get_serial_sequence('fiction_novel_chapters', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM fiction_novel_chapters;

DROP TABLE fiction_chapters;
DROP TABLE fiction_entries;
