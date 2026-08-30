package com.weiknight.site.fiction;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** @description Provides ordered listing and slug lookup for original characters. */
public interface OriginalCharacterRepository extends JpaRepository<OriginalCharacter, Long> {
  /** @description Lists characters in their configured display order. */
  List<OriginalCharacter> findAllByOrderByDisplayOrderAscTitleAsc();

  /** @description Finds one character by its public URL identifier. */
  Optional<OriginalCharacter> findBySlug(String slug);

  /** @description Reports whether an automatically generated character slug is already occupied. */
  boolean existsBySlug(String slug);
}
