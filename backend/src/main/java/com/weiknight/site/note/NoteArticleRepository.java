package com.weiknight.site.note;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @description Provides publication-aware and administrator access to note articles.
 */
public interface NoteArticleRepository extends JpaRepository<NoteArticle, Long> {
  /** @description Returns every article in stable directory-tree order. */
  List<NoteArticle> findAllByOrderByDirectoryAscSortOrderAscTitleAsc();

  /**
   * @description Returns published articles ordered from newest to oldest.
   * @param status Required lifecycle state.
   */
  List<NoteArticle> findAllByStatusOrderByDirectoryAscSortOrderAscTitleAsc(ArticleStatus status);

  /**
   * @description Locates one article by its stable public URL and lifecycle state.
   * @param slug Stable public URL identifier.
   * @param status Required lifecycle state.
   */
  Optional<NoteArticle> findBySlugAndStatus(String slug, ArticleStatus status);

  /**
   * @description Locates an article during idempotent legacy import.
   * @param slug Stable article URL identifier.
   */
  Optional<NoteArticle> findBySlug(String slug);
}
