package com.weiknight.site.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * @description Creates the persistent administrator once from server environment credentials.
 */
@Component
public class AdminAccountBootstrap implements ApplicationRunner {
  private final SiteUserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final String username;
  private final String password;

  /**
   * @description Captures the repository and initial administrator credentials used at startup.
   * @param users Persistent account repository.
   * @param passwordEncoder Encoder for the initial credential.
   * @param username Initial administrator login name.
   * @param password Initial administrator password, used only when the account does not exist.
   */
  public AdminAccountBootstrap(
      SiteUserRepository users,
      PasswordEncoder passwordEncoder,
      @Value("${ADMIN_USERNAME:admin}") String username,
      @Value("${ADMIN_PASSWORD}") String password) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.username = username.trim();
    this.password = password;
  }

  /**
   * @description Ensures the configured login name belongs to one persistent administrator.
   * @param args Spring startup arguments, unused by account initialization.
   * @throws IllegalStateException when a member already owns the configured administrator name.
   */
  @Override
  public void run(ApplicationArguments args) {
    users.findByUsernameIgnoreCase(username).ifPresentOrElse(this::requireAdministrator, this::create);
  }

  private void requireAdministrator(SiteUser user) {
    if (user.isAdmin()) {
      return;
    }
    throw new IllegalStateException("ADMIN_USERNAME is already used by a member account");
  }

  private void create() {
    SiteUser administrator = new SiteUser();
    administrator.createAdministrator(username, username, passwordEncoder.encode(password));
    users.save(administrator);
  }
}
