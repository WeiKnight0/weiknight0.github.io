DELETE FROM fiction_entries
WHERE entry_type = 'NOVEL'
  AND slug = 'chapter-1'
  AND title = '第一章'
  AND description = '用 Markdown 编写的故事章节示例。';
