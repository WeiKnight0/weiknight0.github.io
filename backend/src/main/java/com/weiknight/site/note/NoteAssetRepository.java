package com.weiknight.site.note;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @description Provides persistent metadata access for uploaded note images.
 */
public interface NoteAssetRepository extends JpaRepository<NoteAsset, UUID> {
  /** @description Returns uploaded images from newest to oldest. */
  List<NoteAsset> findAllByOrderByCreatedAtDesc();
}
