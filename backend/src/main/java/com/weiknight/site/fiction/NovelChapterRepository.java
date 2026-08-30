package com.weiknight.site.fiction;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** @description Provides chapter lookup scoped to a parent novel. */
public interface NovelChapterRepository extends JpaRepository<NovelChapter, Long> {
  /** @description Lists one novel's chapters in reading order. */
  List<NovelChapter> findAllByNovelIdOrderByDisplayOrderAscTitleAsc(Long novelId);

  /** @description Finds one chapter without allowing its slug to cross novels. */
  Optional<NovelChapter> findByNovelIdAndSlug(Long novelId, String slug);

  /** @description Reports whether a generated chapter slug is occupied within one novel. */
  boolean existsByNovelIdAndSlug(Long novelId, String slug);
}
