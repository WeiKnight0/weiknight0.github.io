package com.weiknight.site.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * @description Stores a login-only member account provisioned by the administrator.
 */
@Entity
@Table(name = "site_users")
public class SiteUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String username;

  @JsonIgnore
  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(insertable = false, updatable = false)
  private Instant createdAt;

  /** @description Returns the persistent member identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the member's login name. */
  public String getUsername() {
    return username;
  }

  /** @description Returns the database-generated account creation time. */
  public Instant getCreatedAt() {
    return createdAt;
  }

  /**
   * @description Initializes a new account before persistence.
   * @param username Login name chosen by the administrator.
   * @param passwordHash BCrypt hash of the initial password.
   */
  public void create(String username, String passwordHash) {
    this.username = username;
    this.passwordHash = passwordHash;
  }

  /** @description Returns the hash used only for server-side credential verification. */
  public String passwordHash() {
    return passwordHash;
  }
}
