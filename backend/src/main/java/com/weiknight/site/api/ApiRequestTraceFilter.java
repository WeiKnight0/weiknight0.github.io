package com.weiknight.site.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ApiRequestTraceFilter extends OncePerRequestFilter {
  private static final Logger log = LoggerFactory.getLogger(ApiRequestTraceFilter.class);

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/api/");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    chain.doFilter(request, response);
    var session = request.getSession(false);
    log.info("API_ROUTE method={} path={} status={} session={}", request.getMethod(), request.getRequestURI(), response.getStatus(), session == null ? "-" : session.getId());
  }
}
