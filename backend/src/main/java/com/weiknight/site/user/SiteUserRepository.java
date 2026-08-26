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
  Optional<SiteUser> findByUsernameIgnoreCase(String username);

  /** @description Lists accounts in stable login-name order for administration. */
  java.util.List<SiteUser> findAllByOrderByUsernameAsc();

  /**
   * @description Checks whether a session still references an enabled persistent member.
   * @param id Member identifier stored in the HTTP session.
   */
  boolean existsByIdAndEnabledTrue(Long id);

  /**
   * @description Checks that a session still belongs to an enabled account with the required role.
   * @param id Account identifier stored in the HTTP session.
   * @param role Authorization role required by the operation.
   */
  boolean existsByIdAndEnabledTrueAndRole(Long id, UserRole role);

  /**
   * @description Loads an enabled member while rejecting revoked account sessions.
   * @param id Member identifier stored in the HTTP session.
   */
  Optional<SiteUser> findByIdAndEnabledTrue(Long id);
}
