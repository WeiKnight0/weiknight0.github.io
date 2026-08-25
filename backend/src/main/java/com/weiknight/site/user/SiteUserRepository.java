package com.weiknight.site.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @description Provides account lookup for authentication and administrator management.
 */
public interface SiteUserRepository extends JpaRepository<SiteUser, Long> {
  /**
   * @description Looks up the member addressed by a submitted login name.
   * @param username Login name submitted by the client.
   */
  Optional<SiteUser> findByUsername(String username);
}
