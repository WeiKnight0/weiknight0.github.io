package com.weiknight.site.api;

import com.weiknight.site.user.SiteUser;
import com.weiknight.site.user.SiteUserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Lets an enabled account maintain its own profile, avatar, and password.
 */
@RestController
@RequestMapping("/api/v1/account")
public class AccountController {
  private final SiteUserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final SessionAccess access;

  AccountController(SiteUserRepository users, PasswordEncoder passwordEncoder, SessionAccess access) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.access = access;
  }

  /**
   * @description Changes the current account's public-facing profile.
   * @param input Validated profile replacement.
   * @param session Session that must represent an enabled persistent account.
   * @throws AccessDeniedException when the session is anonymous or revoked.
   */
  @PutMapping("/profile")
  public AuthController.AccountResponse updateProfile(
      @Valid @RequestBody ProfileInput input,
      HttpSession session) {
    SiteUser user = currentUser(session);
    user.updateProfile(input.displayName().trim(), input.bio().trim());
    return AuthController.AccountResponse.from(users.save(user));
  }

  /**
   * @description Replaces the current member password after checking the old password and confirmation.
   * @param input Existing password plus the replacement entered twice.
   * @param session Session that must represent an enabled persistent member.
   * @throws AccessDeniedException when the existing password is incorrect.
   */
  @PutMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void updatePassword(
      @Valid @RequestBody PasswordChangeInput input,
      HttpSession session) {
    SiteUser user = currentUser(session);
    if (!passwordEncoder.matches(input.currentPassword(), user.passwordHash())) {
      throw new AccessDeniedException();
    }
    if (!input.password().equals(input.passwordConfirmation())) {
      throw new IllegalArgumentException("Passwords do not match");
    }
    user.updatePassword(passwordEncoder.encode(input.password()));
    users.save(user);
  }

  private SiteUser currentUser(HttpSession session) {
    access.requireMember(session);
    return users.findByIdAndEnabledTrue(access.requireUserId(session))
        .orElseThrow(AccessDeniedException::new);
  }

  /** @description Account-editable public profile fields. */
  public record ProfileInput(
      @NotBlank @Size(max = 100) String displayName,
      @NotNull @Size(max = 500) String bio) {
  }

  /** @description Existing credential and confirmed replacement password. */
  public record PasswordChangeInput(
      @NotBlank String currentPassword,
      @NotBlank @Size(min = 8, max = 200) String password,
      @NotBlank @Size(min = 8, max = 200) String passwordConfirmation) {
  }
}
