package com.weiknight.site.fiction;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** @description Provides ordered listing and slug lookup for novels. */
public interface NovelRepository extends JpaRepository<Novel, Long> {
  /** @description Lists novels in their configured display order. */
  List<Novel> findAllByOrderByDisplayOrderAscTitleAsc();

  /** @description Finds one novel by its public URL identifier. */
  Optional<Novel> findBySlug(String slug);

  /** @description Reports whether an automatically generated novel slug is already occupied. */
  boolean existsBySlug(String slug);
}
