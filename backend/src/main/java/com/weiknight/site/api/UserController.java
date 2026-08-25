package com.weiknight.site.api;

import com.weiknight.site.user.SiteUser;
import com.weiknight.site.user.SiteUserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

  UserController(SiteUserRepository users, PasswordEncoder passwordEncoder, SessionAccess access) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.access = access;
  }

  /**
   * @description Lists member accounts without exposing password hashes.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   */
  @GetMapping
  public List<UserResponse> list(HttpSession session) {
    access.requireAdmin(session);
    return users.findAll().stream().map(UserResponse::from).toList();
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
    SiteUser user = new SiteUser();
    user.create(input.username(), passwordEncoder.encode(input.password()));
    return UserResponse.from(users.save(user));
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
  public void delete(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    users.delete(users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")));
  }

  /** @description Credentials supplied when the administrator provisions an account. */
  public record UserInput(
      @NotBlank @Size(min = 3, max = 100) String username,
      @NotBlank @Size(min = 8, max = 200) String password) {
  }

  /** @description Account data safe to return to the administration client. */
  public record UserResponse(Long id, String username, Instant createdAt) {
    static UserResponse from(SiteUser user) {
      return new UserResponse(user.getId(), user.getUsername(), user.getCreatedAt());
    }
  }
}
