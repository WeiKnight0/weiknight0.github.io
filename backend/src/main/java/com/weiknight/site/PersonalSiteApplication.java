package com.weiknight.site;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @description Starts the personal-site API and its persistence migrations.
 */
@SpringBootApplication
public class PersonalSiteApplication {
  /**
   * @description Boots the Spring application with the process arguments supplied by the runtime.
   * @param args Runtime configuration arguments.
   */
  public static void main(String[] args) {
    SpringApplication.run(PersonalSiteApplication.class, args);
  }
}
