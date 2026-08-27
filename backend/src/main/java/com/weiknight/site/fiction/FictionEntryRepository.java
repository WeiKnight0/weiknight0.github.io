package com.weiknight.site.fiction;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @description Provides type-scoped ordering and slug lookup for managed fictional content.
 */
public interface FictionEntryRepository extends JpaRepository<FictionEntry, Long> {
  /**
   * @description Lists all administrative entries of one type in display order.
   * @param type Fiction section to list.
   */
  List<FictionEntry> findAllByTypeOrderByDisplayOrderAscTitleAsc(FictionEntryType type);

  /**
   * @description Lists visitor-visible entries of one type in display order.
   * @param type Fiction section to list.
   */
  List<FictionEntry> findAllByTypeAndPublishedTrueOrderByDisplayOrderAscTitleAsc(FictionEntryType type);

  /**
   * @description Finds one public entry without allowing slugs to cross fiction sections.
   * @param type Fiction section that owns the entry.
   * @param slug Stable public URL identifier.
   */
  Optional<FictionEntry> findByTypeAndSlugAndPublishedTrue(FictionEntryType type, String slug);
}
