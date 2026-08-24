package com.weiknight.site.api;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Minimal API route used to verify that reverse-proxy routing is working. */
@RestController
@RequestMapping("/api")
public class HealthController {

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }
}
