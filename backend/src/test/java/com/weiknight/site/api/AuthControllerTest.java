package com.weiknight.site.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.weiknight.site.user.SiteUser;
import com.weiknight.site.user.SiteUserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthControllerTest {
  private SiteUserRepository users;
  private PasswordEncoder passwordEncoder;
  private SessionAccess access;
  private AuthController controller;

  @BeforeEach
  void setUp() {
    users = mock(SiteUserRepository.class);
    passwordEncoder = mock(PasswordEncoder.class);
    access = new SessionAccess();
    controller = new AuthController(users, passwordEncoder, access, "admin", "secret-password");
  }

  @Test
  void signsInAdministratorAndRotatesSessionIdentifier() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    String originalSessionId = request.getSession().getId();

    assertEquals(
        "admin",
        controller.login(new AuthController.LoginInput("admin", "secret-password"), request).role());
    assertNotEquals(originalSessionId, request.getSession().getId());
    assertEquals("admin", controller.me(request.getSession()).role());
  }

  @Test
  void signsInProvisionedMember() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    SiteUser user = mock(SiteUser.class);
    when(user.getId()).thenReturn(7L);
    when(user.getUsername()).thenReturn("member");
    when(user.passwordHash()).thenReturn("hash");
    when(users.findByUsername("member")).thenReturn(Optional.of(user));
    when(users.findById(7L)).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("member-password", "hash")).thenReturn(true);

    assertEquals(
        "user",
        controller.login(new AuthController.LoginInput("member", "member-password"), request).role());
    assertEquals("member", controller.me(request.getSession()).username());
  }

  @Test
  void rejectsInvalidCredentials() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    when(users.findByUsername("unknown")).thenReturn(Optional.empty());

    assertThrows(
        AccessDeniedException.class,
        () -> controller.login(new AuthController.LoginInput("unknown", "wrong-password"), request));
  }
}
