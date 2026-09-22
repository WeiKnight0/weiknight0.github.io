package com.weiknight.site.api;

import com.weiknight.site.audit.SecurityAuditService;
import com.weiknight.site.user.SiteUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Establishes and exposes the single login session used by both members and administrators.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final SiteUserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final SessionAccess access;
  private final SecurityAuditService audit;

  AuthController(
      SiteUserRepository users,
      PasswordEncoder passwordEncoder,
      SessionAccess access,
      SecurityAuditService audit) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.access = access;
    this.audit = audit;
  }

  /**
   * @description Authenticates API clients and records their role in the HTTP session.
   * @param input Submitted account credentials.
   * @param request Current request whose session identifier is rotated after login.
   * @throws AccessDeniedException when the credentials do not identify an allowed account.
   */
  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginInput input, HttpServletRequest request) {
    try {
      LoginResponse response = authenticate(input, request.getSession());
      request.changeSessionId();
      audit.record("LOGIN_SUCCESS", access.requireUserId(request.getSession()), request, HttpStatus.OK.value());
      return response;
    } catch (AccessDeniedException exception) {
      audit.record("LOGIN_FAILURE", null, request, HttpStatus.FORBIDDEN.value());
      throw exception;
    }
  }

  /**
   * @description Authenticates the native login form and redirects without changing the caller's host or port.
   * @param username Submitted account name.
   * @param password Submitted account password.
   * @param request Current request whose session identifier is rotated after login.
   */
  @PostMapping(value = "/login-form", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public ResponseEntity<Void> loginForm(
      @RequestParam String username,
      @RequestParam String password,
      @RequestParam(required = false) String next,
      HttpServletRequest request) {
    try {
      LoginResponse response = authenticate(new LoginInput(username, password), request.getSession());
      request.changeSessionId();
      audit.record("LOGIN_SUCCESS", access.requireUserId(request.getSession()), request, HttpStatus.SEE_OTHER.value());
      return redirect(loginDestination(next, response.role()));
    } catch (AccessDeniedException exception) {
      audit.record("LOGIN_FAILURE", null, request, HttpStatus.SEE_OTHER.value());
      return redirect("/login/?error=1&next=" + URLEncoder.encode(returnPath(next), StandardCharsets.UTF_8));
    }
  }

  /**
   * @description Invalidates the complete site session for the current account.
   * @param session Session to invalidate.
   */
  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(HttpSession session) {
    session.invalidate();
  }

  /**
   * @description Authorizes access to member-only static pages through an Nginx subrequest.
   * @param session Session that must represent a member or administrator.
   * @throws AccessDeniedException when the session is anonymous.
   */
  @GetMapping("/session")
  public void session(HttpSession session) {
    access.requireMember(session);
  }

  /**
   * @description Returns the account represented by the current authenticated session.
   * @param session Session being inspected.
   * @throws AccessDeniedException when the session is anonymous or references a deleted user.
   */
  @GetMapping("/me")
  public AccountResponse me(HttpSession session) {
    access.requireMember(session);
    return users.findByIdAndEnabledTrue(access.requireUserId(session))
        .map(AccountResponse::from)
        .orElseThrow(AccessDeniedException::new);
  }

  private LoginResponse authenticate(LoginInput input, HttpSession session) {
    return users.findByUsernameIgnoreCase(input.username())
        .filter(com.weiknight.site.user.SiteUser::isEnabled)
        .filter(user -> passwordEncoder.matches(input.password(), user.passwordHash()))
        .map(user -> {
          access.signIn(session, user.getId(), user.isAdmin());
          return new LoginResponse(user.isAdmin() ? "admin" : "user");
        })
        .orElseThrow(AccessDeniedException::new);
  }

  private ResponseEntity<Void> redirect(String path) {
    return ResponseEntity.status(HttpStatus.SEE_OTHER).location(URI.create(path)).build();
  }

  private String loginDestination(String next, String role) {
    String destination = returnPath(next);
    if (!destination.isEmpty()) return destination;
    return "admin".equals(role) ? "/admin/novels/" : "/";
  }

  private String returnPath(String next) {
    if (next == null || !next.startsWith("/") || next.startsWith("//") || next.contains("\\")) return "";
    return next;
  }

  /** @description Credentials accepted by the JSON login endpoint. */
  public record LoginInput(@NotBlank String username, @NotBlank String password) {
  }

  /** @description Role established by a successful login. */
  public record LoginResponse(String role) {
  }

  /** @description Public identity of the current authenticated session. */
  public record AccountResponse(
      String role,
      String username,
      String displayName,
      String bio,
      String avatarUrl,
      Instant createdAt,
      Instant updatedAt) {
    static AccountResponse from(com.weiknight.site.user.SiteUser user) {
      return new AccountResponse(
          user.isAdmin() ? "admin" : "user",
          user.getUsername(),
          user.getDisplayName(),
          user.getBio(),
          user.hasAvatar() ? "/api/v1/user-avatars/" + user.getId() + "?v=" + user.getUpdatedAt().toEpochMilli() : null,
          user.getCreatedAt(),
          user.getUpdatedAt());
    }
  }
}
