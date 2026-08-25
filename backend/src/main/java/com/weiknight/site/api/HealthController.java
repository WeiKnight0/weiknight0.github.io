package com.weiknight.site.api;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Exposes the minimal route used to verify backend and reverse-proxy availability.
 */
@RestController
@RequestMapping("/api")
public class HealthController {
  /**
   * @description Confirms that the Spring Boot request path is operational.
   */
  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }
}
