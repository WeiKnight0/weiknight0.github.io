package com.weiknight.site.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weiknight.site.user.SiteUser;
import com.weiknight.site.user.SiteUserRepository;
import com.weiknight.site.user.UserAvatarService;
import com.weiknight.site.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserControllerTest {
  private SiteUserRepository users;
  private PasswordEncoder passwordEncoder;
  private UserController controller;
  private MockHttpSession session;

  @BeforeEach
  void setUp() {
    users = mock(SiteUserRepository.class);
    passwordEncoder = mock(PasswordEncoder.class);
    SessionAccess access = new SessionAccess(users);
    controller = new UserController(users, passwordEncoder, access, mock(UserAvatarService.class));
    session = new MockHttpSession();
    access.signIn(session, 1L, true);
    when(users.existsByIdAndEnabledTrueAndRole(1L, UserRole.ADMIN)).thenReturn(true);
  }

  @Test
  void rejectsMismatchedCreationPasswordsBeforeHashing() {
    UserController.UserInput input = new UserController.UserInput(
        "member",
        "Member",
        "password-one",
        "password-two");

    assertThrows(IllegalArgumentException.class, () -> controller.create(input, session));
    verifyNoInteractions(passwordEncoder);
  }

  @Test
  void createsEnabledMemberWithDisplayName() {
    when(passwordEncoder.encode("member-password")).thenReturn("hash");
    when(users.save(any(SiteUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

    UserController.UserResponse response = controller.create(
        new UserController.UserInput("member", "Member Name", "member-password", "member-password"),
        session);

    assertEquals("member", response.username());
    assertEquals("Member Name", response.displayName());
    assertTrue(response.enabled());
    assertNotNull(response.createdAt());
    assertNotNull(response.updatedAt());
  }
}
