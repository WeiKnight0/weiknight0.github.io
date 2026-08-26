package com.weiknight.site.user;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminAccountBootstrapTest {
  private final SiteUserRepository users = mock(SiteUserRepository.class);
  private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
  private final ApplicationArguments arguments = mock(ApplicationArguments.class);

  @Test
  void createsPersistentAdministratorWhenConfiguredNameIsUnused() {
    when(users.findByUsernameIgnoreCase("admin")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("initial-password")).thenReturn("hash");

    new AdminAccountBootstrap(users, passwordEncoder, "admin", "initial-password").run(arguments);

    verify(users).save(any(SiteUser.class));
  }

  @Test
  void preservesExistingAdministratorProfileAndPassword() {
    SiteUser administrator = new SiteUser();
    administrator.createAdministrator("admin", "Changed name", "changed-hash");
    when(users.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(administrator));

    new AdminAccountBootstrap(users, passwordEncoder, "admin", "initial-password").run(arguments);

    verifyNoInteractions(passwordEncoder);
  }

  @Test
  void failsWhenMemberOwnsConfiguredAdministratorName() {
    SiteUser member = new SiteUser();
    member.create("admin", "Member", "hash");
    when(users.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(member));

    assertThrows(
        IllegalStateException.class,
        () -> new AdminAccountBootstrap(users, passwordEncoder, "admin", "initial-password").run(arguments));
  }
}
