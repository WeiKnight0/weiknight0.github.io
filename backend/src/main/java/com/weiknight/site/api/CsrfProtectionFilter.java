package com.weiknight.site.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Set;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * @description Rejects cross-site browser writes unless they carry the token bound to the active session.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CsrfProtectionFilter extends OncePerRequestFilter {
  private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS");
  private static final Set<String> EXCLUDED_PATHS = Set.of(
      "/api/v1/auth/login",
      "/api/v1/auth/login-form");

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/api/")
        || SAFE_METHODS.contains(request.getMethod())
        || EXCLUDED_PATHS.contains(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    HttpSession session = request.getSession(false);
    String supplied = request.getHeader("X-CSRF-Token");
    if (session != null && supplied != null && supplied.equals(session.getAttribute(CsrfTokenController.ATTRIBUTE))) {
      chain.doFilter(request, response);
      return;
    }
    response.setStatus(HttpStatus.FORBIDDEN.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write("{\"code\":\"csrf_required\",\"message\":\"Invalid CSRF token\"}");
  }
}
