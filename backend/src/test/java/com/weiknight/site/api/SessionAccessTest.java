package com.weiknight.site.api;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

class SessionAccessTest {
  private final SessionAccess access = new SessionAccess();

  @Test
  void rejectsAnonymousSessions() {
    MockHttpSession session = new MockHttpSession();

    assertThrows(AccessDeniedException.class, () -> access.requireAdmin(session));
    assertThrows(AccessDeniedException.class, () -> access.requireMember(session));
    assertThrows(AccessDeniedException.class, () -> access.requireUserId(session));
  }

  @Test
  void switchesBetweenAdministratorAndMemberRoles() {
    MockHttpSession session = new MockHttpSession();

    access.signInUser(session, 7L);
    assertDoesNotThrow(() -> access.requireMember(session));
    assertThrows(AccessDeniedException.class, () -> access.requireAdmin(session));

    access.signInAdmin(session);
    assertDoesNotThrow(() -> access.requireAdmin(session));
    assertThrows(AccessDeniedException.class, () -> access.requireUserId(session));
  }
}
