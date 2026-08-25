package com.weiknight.site.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

@Component
final class SessionAccess {
  private static final String ADMIN_ATTRIBUTE = "admin";
  private static final String USER_ID_ATTRIBUTE = "userId";

  boolean isAdmin(HttpSession session) {
    return Boolean.TRUE.equals(session.getAttribute(ADMIN_ATTRIBUTE));
  }

  void requireAdmin(HttpSession session) {
    if (isAdmin(session)) {
      return;
    }
    throw new AccessDeniedException();
  }

  void requireMember(HttpSession session) {
    if (isAdmin(session) || session.getAttribute(USER_ID_ATTRIBUTE) instanceof Long) {
      return;
    }
    throw new AccessDeniedException();
  }

  long requireUserId(HttpSession session) {
    if (session.getAttribute(USER_ID_ATTRIBUTE) instanceof Long userId) {
      return userId;
    }
    throw new AccessDeniedException();
  }

  void signInAdmin(HttpSession session) {
    session.removeAttribute(USER_ID_ATTRIBUTE);
    session.setAttribute(ADMIN_ATTRIBUTE, true);
  }

  void signInUser(HttpSession session, long userId) {
    session.removeAttribute(ADMIN_ATTRIBUTE);
    session.setAttribute(USER_ID_ATTRIBUTE, userId);
  }
}
