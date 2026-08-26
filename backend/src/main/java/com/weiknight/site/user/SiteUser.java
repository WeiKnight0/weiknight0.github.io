package com.weiknight.site.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * @description Stores a persistent site account, public profile, and authorization role.
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

  @Column(name = "display_name", nullable = false)
  private String displayName;

  @Column(nullable = false)
  private String bio;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role;

  @JsonIgnore
  @Column(name = "avatar_file_name")
  private String avatarFileName;

  @JsonIgnore
  @Column(name = "avatar_content_type")
  private String avatarContentType;

  @Column(nullable = false)
  private boolean enabled;

  @Column(updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

  /** @description Returns the persistent member identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the member's login name. */
  public String getUsername() {
    return username;
  }

  /** @description Returns the member-facing name shown beside the account avatar. */
  public String getDisplayName() {
    return displayName;
  }

  /** @description Returns the account owner's optional public introduction. */
  public String getBio() {
    return bio;
  }

  /** @description Returns the authorization role persisted for this account. */
  public UserRole getRole() {
    return role;
  }

  /** @description Reports whether the account may use administrator operations. */
  public boolean isAdmin() {
    return role == UserRole.ADMIN;
  }

  /** @description Reports whether the account may authenticate and retain member access. */
  public boolean isEnabled() {
    return enabled;
  }

  /** @description Returns the database-generated account creation time. */
  public Instant getCreatedAt() {
    return createdAt;
  }

  /** @description Returns the latest profile, password, status, or avatar change time. */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * @description Initializes a new account before persistence.
   * @param username Login name chosen by the administrator.
   * @param displayName Member-facing name selected by the administrator.
   * @param passwordHash BCrypt hash of the initial password.
   */
  public void create(String username, String displayName, String passwordHash) {
    create(username, displayName, passwordHash, UserRole.USER);
  }

  /**
   * @description Initializes the first persistent administrator from server configuration.
   * @param username Login name selected by the server operator.
   * @param displayName Initial public name, editable from the personal center.
   * @param passwordHash BCrypt hash of the initial server-provided password.
   */
  public void createAdministrator(String username, String displayName, String passwordHash) {
    create(username, displayName, passwordHash, UserRole.ADMIN);
  }

  private void create(String username, String displayName, String passwordHash, UserRole role) {
    Instant now = Instant.now();
    this.username = username;
    this.displayName = displayName;
    this.bio = "";
    this.passwordHash = passwordHash;
    this.role = role;
    this.enabled = true;
    this.createdAt = now;
    this.updatedAt = now;
  }

  /**
   * @description Replaces administrator-managed account identity and access state.
   * @param username Login name used for future authentication.
   * @param displayName Member-facing name shown throughout the site.
   * @param enabled Whether the account remains permitted to sign in.
   */
  public void update(String username, String displayName, boolean enabled) {
    this.username = username;
    this.displayName = displayName;
    this.enabled = enabled;
    this.updatedAt = Instant.now();
  }

  /**
   * @description Lets an account owner replace their public profile fields.
   * @param displayName New name shown beside the account avatar.
   * @param bio Optional short introduction shown in the personal center.
   */
  public void updateProfile(String displayName, String bio) {
    this.displayName = displayName;
    this.bio = bio;
    this.updatedAt = Instant.now();
  }

  /**
   * @description Replaces the stored credential after password validation succeeds.
   * @param passwordHash BCrypt hash of the new password.
   */
  public void updatePassword(String passwordHash) {
    this.passwordHash = passwordHash;
    this.updatedAt = Instant.now();
  }

  /**
   * @description Associates the account with one validated persistent avatar file.
   * @param fileName Server-generated file name inside the avatar directory.
   * @param contentType Validated image media type returned when streaming the avatar.
   */
  public void updateAvatar(String fileName, String contentType) {
    this.avatarFileName = fileName;
    this.avatarContentType = contentType;
    this.updatedAt = Instant.now();
  }

  /** @description Removes the persistent avatar association and restores the initial fallback. */
  public void removeAvatar() {
    this.avatarFileName = null;
    this.avatarContentType = null;
    this.updatedAt = Instant.now();
  }

  /** @description Reports whether the account owns a stored avatar file. */
  public boolean hasAvatar() {
    return avatarFileName != null;
  }

  /** @description Returns the internal avatar file name after hasAvatar succeeds. */
  public String avatarFileName() {
    return avatarFileName;
  }

  /** @description Returns the validated avatar media type after hasAvatar succeeds. */
  public String avatarContentType() {
    return avatarContentType;
  }

  /** @description Returns the hash used only for server-side credential verification. */
  public String passwordHash() {
    return passwordHash;
  }
}
