package com.weiknight.site.content;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @description Provides ordered and slug-based access to persisted blogs.
 */
public interface PostRepository extends JpaRepository<Post, Long> {
  /** @description Returns blogs from newest to oldest. */
  List<Post> findAllByOrderByPublishedAtDesc();

  /**
   * @description Looks up the blog addressed by a public URL.
   * @param slug Stable public URL identifier.
   */
  Optional<Post> findBySlug(String slug);
}
