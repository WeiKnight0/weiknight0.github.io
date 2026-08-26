package com.weiknight.site.api;

import com.weiknight.site.user.SiteUserRepository;
import com.weiknight.site.user.UserRole;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

@Component
final class SessionAccess {
  private static final String ADMIN_ATTRIBUTE = "admin";
  private static final String USER_ID_ATTRIBUTE = "userId";
  private final SiteUserRepository users;

  SessionAccess(SiteUserRepository users) {
    this.users = users;
  }

  boolean isAdmin(HttpSession session) {
    return Boolean.TRUE.equals(session.getAttribute(ADMIN_ATTRIBUTE))
        && session.getAttribute(USER_ID_ATTRIBUTE) instanceof Long userId
        && users.existsByIdAndEnabledTrueAndRole(userId, UserRole.ADMIN);
  }

  void requireAdmin(HttpSession session) {
    if (isAdmin(session)) {
      return;
    }
    throw new AccessDeniedException();
  }

  void requireMember(HttpSession session) {
    if (session.getAttribute(USER_ID_ATTRIBUTE) instanceof Long userId
        && users.existsByIdAndEnabledTrue(userId)) {
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

  void signIn(HttpSession session, long userId, boolean administrator) {
    session.setAttribute(USER_ID_ATTRIBUTE, userId);
    session.setAttribute(ADMIN_ATTRIBUTE, administrator);
  }
}
