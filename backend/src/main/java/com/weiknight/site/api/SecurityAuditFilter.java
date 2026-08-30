package com.weiknight.site.api;

import com.weiknight.site.audit.SecurityAuditService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * @description Persists an audit event for every non-authentication API write after its final status is known.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class SecurityAuditFilter extends OncePerRequestFilter {
  private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS");
  private static final Set<String> AUTH_PATHS = Set.of(
      "/api/v1/auth/login",
      "/api/v1/auth/login-form");
  private final SessionAccess access;
  private final SecurityAuditService audit;

  SecurityAuditFilter(SessionAccess access, SecurityAuditService audit) {
    this.access = access;
    this.audit = audit;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/api/")
        || SAFE_METHODS.contains(request.getMethod())
        || AUTH_PATHS.contains(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    Optional<Long> actorUserId = access.authenticatedUserId(request.getSession(false));
    chain.doFilter(request, response);
    audit.record("API_MUTATION", actorUserId.orElse(null), request, response.getStatus());
  }
}
