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
    access = new SessionAccess(users);
    controller = new AuthController(users, passwordEncoder, access);
  }

  @Test
  void signsInAdministratorAndRotatesSessionIdentifier() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    SiteUser user = account(1L, "admin", "Administrator", true);
    when(users.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user));
    when(users.findByIdAndEnabledTrue(1L)).thenReturn(Optional.of(user));
    when(users.existsByIdAndEnabledTrue(1L)).thenReturn(true);
    when(passwordEncoder.matches("secret-password", "hash")).thenReturn(true);
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
    SiteUser user = account(7L, "member", "Member", false);
    when(users.findByUsernameIgnoreCase("member")).thenReturn(Optional.of(user));
    when(users.findByIdAndEnabledTrue(7L)).thenReturn(Optional.of(user));
    when(users.existsByIdAndEnabledTrue(7L)).thenReturn(true);
    when(passwordEncoder.matches("member-password", "hash")).thenReturn(true);

    assertEquals(
        "user",
        controller.login(new AuthController.LoginInput("member", "member-password"), request).role());
    assertEquals("member", controller.me(request.getSession()).username());
  }

  @Test
  void rejectsInvalidCredentials() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    when(users.findByUsernameIgnoreCase("unknown")).thenReturn(Optional.empty());

    assertThrows(
        AccessDeniedException.class,
        () -> controller.login(new AuthController.LoginInput("unknown", "wrong-password"), request));
  }

  @Test
  void rejectsDisabledMemberCredentials() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    SiteUser user = mock(SiteUser.class);
    when(user.isEnabled()).thenReturn(false);
    when(users.findByUsernameIgnoreCase("disabled")).thenReturn(Optional.of(user));

    assertThrows(
        AccessDeniedException.class,
        () -> controller.login(new AuthController.LoginInput("disabled", "member-password"), request));
  }

  @Test
  void returnsToTheRequestedSitePathAfterFormLogin() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    SiteUser user = account(1L, "admin", "Administrator", true);
    when(users.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("secret-password", "hash")).thenReturn(true);

    assertEquals(
        "/real/notes/C-Language/01-program-types-and-storage/",
        controller.loginForm(
            "admin", "secret-password", "/real/notes/C-Language/01-program-types-and-storage/", request)
            .getHeaders().getLocation().toString());
  }

  @Test
  void rejectsExternalReturnPathAfterFormLogin() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    SiteUser user = account(1L, "admin", "Administrator", true);
    when(users.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("secret-password", "hash")).thenReturn(true);

    assertEquals(
        "/admin/blogs/",
        controller.loginForm("admin", "secret-password", "https://example.com", request)
            .getHeaders().getLocation().toString());
  }

  private SiteUser account(long id, String username, String displayName, boolean administrator) {
    SiteUser user = mock(SiteUser.class);
    when(user.getId()).thenReturn(id);
    when(user.getUsername()).thenReturn(username);
    when(user.getDisplayName()).thenReturn(displayName);
    when(user.getBio()).thenReturn("");
    when(user.isEnabled()).thenReturn(true);
    when(user.isAdmin()).thenReturn(administrator);
    when(user.passwordHash()).thenReturn("hash");
    return user;
  }
}
