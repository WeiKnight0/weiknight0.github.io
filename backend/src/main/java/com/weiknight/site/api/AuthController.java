package com.weiknight.site.api;

import com.weiknight.site.user.SiteUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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
  private static final Logger log = LoggerFactory.getLogger(AuthController.class);
  private final SiteUserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final SessionAccess access;
  private final String adminUsername;
  private final String adminPassword;

  AuthController(
      SiteUserRepository users,
      PasswordEncoder passwordEncoder,
      SessionAccess access,
      @Value("${ADMIN_USERNAME:admin}") String adminUsername,
      @Value("${ADMIN_PASSWORD}") String adminPassword) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.access = access;
    this.adminUsername = adminUsername;
    this.adminPassword = adminPassword;
  }

  /**
   * @description Authenticates API clients and records their role in the HTTP session.
   * @param input Submitted account credentials.
   * @param request Current request whose session identifier is rotated after login.
   * @throws AccessDeniedException when the credentials do not identify an allowed account.
   */
  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginInput input, HttpServletRequest request) {
    LoginResponse response = authenticate(input, request.getSession());
    request.changeSessionId();
    return response;
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
      HttpServletRequest request) {
    try {
      LoginResponse response = authenticate(new LoginInput(username, password), request.getSession());
      request.changeSessionId();
      log.info("FORM_LOGIN_SUCCESS user={} role={} session={}", username, response.role(), request.getSession().getId());
      return redirect("admin".equals(response.role()) ? "/admin/" : "/");
    } catch (AccessDeniedException exception) {
      log.warn("FORM_LOGIN_FAILURE user={}", username);
      return redirect("/login/?error=1");
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
   * @description Returns the account represented by the current authenticated session.
   * @param session Session being inspected.
   * @throws AccessDeniedException when the session is anonymous or references a deleted user.
   */
  @GetMapping("/me")
  public AccountResponse me(HttpSession session) {
    if (access.isAdmin(session)) {
      return new AccountResponse("admin", adminUsername);
    }
    return users.findById(access.requireUserId(session))
        .map(user -> new AccountResponse("user", user.getUsername()))
        .orElseThrow(AccessDeniedException::new);
  }

  private LoginResponse authenticate(LoginInput input, HttpSession session) {
    if (adminUsername.equals(input.username()) && adminPassword.equals(input.password())) {
      access.signInAdmin(session);
      return new LoginResponse("admin");
    }
    return users.findByUsername(input.username())
        .filter(user -> passwordEncoder.matches(input.password(), user.passwordHash()))
        .map(user -> {
          access.signInUser(session, user.getId());
          return new LoginResponse("user");
        })
        .orElseThrow(AccessDeniedException::new);
  }

  private ResponseEntity<Void> redirect(String path) {
    return ResponseEntity.status(HttpStatus.SEE_OTHER).location(URI.create(path)).build();
  }

  /** @description Credentials accepted by the JSON login endpoint. */
  public record LoginInput(@NotBlank String username, @NotBlank String password) {
  }

  /** @description Role established by a successful login. */
  public record LoginResponse(String role) {
  }

  /** @description Public identity of the current authenticated session. */
  public record AccountResponse(String role, String username) {
  }
}
