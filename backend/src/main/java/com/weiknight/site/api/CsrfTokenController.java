package com.weiknight.site.api;

import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Issues the session-bound token required for browser state-changing API requests.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class CsrfTokenController {
  static final String ATTRIBUTE = "csrfToken";
  private static final SecureRandom RANDOM = new SecureRandom();

  /**
   * @description Returns the current session token, creating one before a browser writes site data.
   * @param session Browser session that owns the token.
   * @return Session-bound token for the X-CSRF-Token request header.
   */
  @GetMapping("/csrf")
  public TokenResponse token(HttpSession session) {
    Object existing = session.getAttribute(ATTRIBUTE);
    if (existing instanceof String token) {
      return new TokenResponse(token);
    }
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    session.setAttribute(ATTRIBUTE, token);
    return new TokenResponse(token);
  }

  /** @description Browser-safe representation of a session-bound CSRF token. */
  public record TokenResponse(String token) {
  }
}
