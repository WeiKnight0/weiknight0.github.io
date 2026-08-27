package com.weiknight.site.fiction;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @description Provides gallery-ordered access to uploaded commission images.
 */
public interface CommissionAssetRepository extends JpaRepository<CommissionAsset, UUID> {
  /** @description Lists all commission images in configured gallery order. */
  List<CommissionAsset> findAllByOrderByDisplayOrderAscCreatedAtDesc();
}
