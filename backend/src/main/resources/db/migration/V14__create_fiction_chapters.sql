CREATE TABLE fiction_chapters (
    id BIGSERIAL PRIMARY KEY,
    novel_id BIGINT NOT NULL REFERENCES fiction_entries(id) ON DELETE CASCADE,
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(240) NOT NULL,
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fiction_chapters_novel_slug_unique UNIQUE (novel_id, slug)
);

CREATE INDEX fiction_chapters_novel_order_idx
    ON fiction_chapters (novel_id, display_order, title);
