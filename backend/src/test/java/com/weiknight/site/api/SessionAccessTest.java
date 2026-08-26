package com.weiknight.site.api;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.weiknight.site.user.SiteUserRepository;
import com.weiknight.site.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

class SessionAccessTest {
  private final SiteUserRepository users = mock(SiteUserRepository.class);
  private final SessionAccess access = new SessionAccess(users);

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
    when(users.existsByIdAndEnabledTrue(7L)).thenReturn(true);
    when(users.existsByIdAndEnabledTrueAndRole(7L, UserRole.ADMIN)).thenReturn(true);

    access.signIn(session, 7L, false);
    assertDoesNotThrow(() -> access.requireMember(session));
    assertThrows(AccessDeniedException.class, () -> access.requireAdmin(session));

    access.signIn(session, 7L, true);
    assertDoesNotThrow(() -> access.requireAdmin(session));
    assertDoesNotThrow(() -> access.requireUserId(session));
  }

  @Test
  void revokesExistingSessionWhenAccountIsDisabled() {
    MockHttpSession session = new MockHttpSession();
    access.signIn(session, 9L, false);
    when(users.existsByIdAndEnabledTrue(9L)).thenReturn(false);

    assertThrows(AccessDeniedException.class, () -> access.requireMember(session));
  }
}
