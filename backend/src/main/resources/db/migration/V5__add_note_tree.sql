ALTER TABLE note_articles
  ADD COLUMN directory VARCHAR(1000),
  ADD COLUMN sort_order INTEGER;

DELETE FROM note_articles
WHERE slug IN ('about', 'privacy');

CREATE INDEX note_articles_tree_idx
  ON note_articles (directory, sort_order, title);
