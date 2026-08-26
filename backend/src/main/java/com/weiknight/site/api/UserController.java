package com.weiknight.site.api;

import com.weiknight.site.user.SiteUser;
import com.weiknight.site.user.SiteUserRepository;
import com.weiknight.site.user.UserAvatarService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Lets the administrator provision and revoke login-only member accounts.
 */
@RestController
@RequestMapping("/api/v1/admin/users")
public class UserController {
  private final SiteUserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final SessionAccess access;
  private final UserAvatarService avatars;

  UserController(
      SiteUserRepository users,
      PasswordEncoder passwordEncoder,
      SessionAccess access,
      UserAvatarService avatars) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.access = access;
    this.avatars = avatars;
  }

  /**
   * @description Lists member accounts without exposing password hashes.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   */
  @GetMapping
  public List<UserResponse> list(HttpSession session) {
    access.requireAdmin(session);
    return users.findAllByOrderByUsernameAsc().stream()
        .filter(user -> !user.isAdmin())
        .map(UserResponse::from)
        .toList();
  }

  /**
   * @description Creates a member account; public self-registration remains unavailable.
   * @param input Administrator-supplied username and initial password.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public UserResponse create(@Valid @RequestBody UserInput input, HttpSession session) {
    access.requireAdmin(session);
    requireMatchingPasswords(input.password(), input.passwordConfirmation());
    String username = input.username().trim();
    SiteUser user = new SiteUser();
    user.create(username, input.displayName().trim(), passwordEncoder.encode(input.password()));
    return UserResponse.from(users.save(user));
  }

  /**
   * @description Updates the selected member's login name, display name, and access state.
   * @param id Persistent member identifier selected by the administrator.
   * @param input Validated replacement account profile.
   * @param session Session that must represent the administrator.
   * @throws ResourceNotFoundException when the account no longer exists.
   */
  @PutMapping("/{id}")
  public UserResponse update(
      @PathVariable Long id,
      @Valid @RequestBody UserUpdate input,
      HttpSession session) {
    access.requireAdmin(session);
    SiteUser user = find(id);
    String username = input.username().trim();
    user.update(username, input.displayName().trim(), input.enabled());
    return UserResponse.from(users.save(user));
  }

  /**
   * @description Replaces the selected member password after confirmation matches.
   * @param id Persistent member identifier selected by the administrator.
   * @param input New password entered twice by the administrator.
   * @param session Session that must represent the administrator.
   * @throws ResourceNotFoundException when the account no longer exists.
   */
  @PutMapping("/{id}/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resetPassword(
      @PathVariable Long id,
      @Valid @RequestBody PasswordInput input,
      HttpSession session) {
    access.requireAdmin(session);
    requireMatchingPasswords(input.password(), input.passwordConfirmation());
    SiteUser user = find(id);
    user.updatePassword(passwordEncoder.encode(input.password()));
    users.save(user);
  }

  /**
   * @description Permanently revokes a member account.
   * @param id Persistent member identifier selected by the administrator.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   * @throws ResourceNotFoundException when the account no longer exists.
   */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id, HttpSession session) throws IOException {
    access.requireAdmin(session);
    SiteUser user = find(id);
    avatars.delete(user);
    users.delete(user);
  }

  private SiteUser find(Long id) {
    return users.findById(id)
        .filter(user -> !user.isAdmin())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  private void requireMatchingPasswords(String password, String confirmation) {
    if (!password.equals(confirmation)) {
      throw new IllegalArgumentException("Passwords do not match");
    }
  }

  /** @description Credentials supplied when the administrator provisions an account. */
  public record UserInput(
      @NotBlank @Size(min = 3, max = 100)
      @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._-]*") String username,
      @NotBlank @Size(max = 100) String displayName,
      @NotBlank @Size(min = 8, max = 200) String password,
      @NotBlank @Size(min = 8, max = 200) String passwordConfirmation) {
  }

  /** @description Administrator-managed identity and access state for an existing member. */
  public record UserUpdate(
      @NotBlank @Size(min = 3, max = 100)
      @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._-]*") String username,
      @NotBlank @Size(max = 100) String displayName,
      @NotNull Boolean enabled) {
  }

  /** @description New member password entered twice to prevent accidental lockout. */
  public record PasswordInput(
      @NotBlank @Size(min = 8, max = 200) String password,
      @NotBlank @Size(min = 8, max = 200) String passwordConfirmation) {
  }

  /** @description Account data safe to return to the administration client. */
  public record UserResponse(
      Long id,
      String username,
      String displayName,
      String avatarUrl,
      boolean enabled,
      Instant createdAt,
      Instant updatedAt) {
    static UserResponse from(SiteUser user) {
      return new UserResponse(
          user.getId(),
          user.getUsername(),
          user.getDisplayName(),
          user.hasAvatar() ? "/api/v1/user-avatars/" + user.getId() + "?v=" + user.getUpdatedAt().toEpochMilli() : null,
          user.isEnabled(),
          user.getCreatedAt(),
          user.getUpdatedAt());
    }
  }
}
