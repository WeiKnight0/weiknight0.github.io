package com.weiknight.site.api;

import com.weiknight.site.content.Post;
import com.weiknight.site.content.PostRepository;
import com.weiknight.site.content.Project;
import com.weiknight.site.content.ProjectRepository;
import com.weiknight.site.user.SiteUserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.net.URI;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1")
public class AdminController {
  private static final Logger log = LoggerFactory.getLogger(AdminController.class);
  private final ProjectRepository projects; private final PostRepository posts; private final SiteUserRepository users; private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
  @Value("${ADMIN_USERNAME:admin}") private String username;
  @Value("${ADMIN_PASSWORD}") private String password;
  AdminController(ProjectRepository projects, PostRepository posts, SiteUserRepository users) { this.projects = projects; this.posts = posts; this.users = users; }
  @PostMapping("/auth/login") public LoginResponse login(@Valid @RequestBody Login body, HttpSession session) { return authenticate(body, session); }
  @PostMapping(value = "/auth/login-form", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public ResponseEntity<Void> loginForm(@RequestParam String username, @RequestParam String password, HttpSession session) {
    try {
      LoginResponse result = authenticate(new Login(username, password), session);
      String target = "admin".equals(result.role()) ? "/admin/" : "/";
      log.info("FORM_LOGIN_SUCCESS user={} role={} session={}", username, result.role(), session.getId());
      return ResponseEntity.status(HttpStatus.SEE_OTHER).location(URI.create(target)).build();
    } catch (Forbidden ignored) {
      log.warn("FORM_LOGIN_FAILURE user={}", username);
      return ResponseEntity.status(HttpStatus.SEE_OTHER).location(URI.create("/login/?error=1")).build();
    }
  }
  @PostMapping("/auth/logout") public void logout(HttpSession session) { session.invalidate(); }
  @GetMapping("/auth/me") public AccountResponse me(HttpSession s) {
    if (Boolean.TRUE.equals(s.getAttribute("admin"))) {
      log.info("AUTH_ME_OK role=admin session={}", s.getId());
      return new AccountResponse("admin", username);
    }
    Object userId = s.getAttribute("userId");
    if (userId instanceof Long id) {
      var user = users.findById(id).orElseThrow(Forbidden::new);
      log.info("AUTH_ME_OK role=user session={}", s.getId());
      return new AccountResponse("user", user.getUsername());
    }
    log.warn("AUTH_ME_REJECTED session={}", s.getId());
    throw new Forbidden();
  }
  @GetMapping("/admin/projects") public List<Project> projects(HttpSession s) { check(s); return projects.findAllByOrderByDisplayOrderAsc(); }
  @GetMapping("/admin/posts") public List<Post> posts(HttpSession s) { check(s); return posts.findAllByOrderByPublishedAtDesc(); }
  @PostMapping("/admin/projects") @ResponseStatus(HttpStatus.CREATED) public Project createProject(@Valid @RequestBody ProjectInput in, HttpSession s) { check(s); Project p = new Project(); p.update(in.slug(), in.title(), in.description(), in.displayOrder(), in.tags(), in.repoUrl()); return projects.save(p); }
  @PutMapping("/admin/projects/{id}") public Project updateProject(@PathVariable Long id, @Valid @RequestBody ProjectInput in, HttpSession s) { check(s); Project p = projects.findById(id).orElseThrow(); p.update(in.slug(), in.title(), in.description(), in.displayOrder(), in.tags(), in.repoUrl()); return projects.save(p); }
  @DeleteMapping("/admin/projects/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteProject(@PathVariable Long id, HttpSession s) { check(s); projects.deleteById(id); }
  @PostMapping("/admin/posts") @ResponseStatus(HttpStatus.CREATED) public Post createPost(@Valid @RequestBody PostInput in, HttpSession s) { check(s); Post p = new Post(); p.update(in.slug(), in.title(), in.description(), in.publishedAt(), in.tags()); return posts.save(p); }
  @PutMapping("/admin/posts/{id}") public Post updatePost(@PathVariable Long id, @Valid @RequestBody PostInput in, HttpSession s) { check(s); Post p = posts.findById(id).orElseThrow(); p.update(in.slug(), in.title(), in.description(), in.publishedAt(), in.tags()); return posts.save(p); }
  @DeleteMapping("/admin/posts/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deletePost(@PathVariable Long id, HttpSession s) { check(s); posts.deleteById(id); }
  private void check(HttpSession s) { if (!Boolean.TRUE.equals(s.getAttribute("admin"))) { log.warn("ADMIN_SESSION_REJECTED session={}", s.getId()); throw new Forbidden(); } }
  private LoginResponse authenticate(Login body, HttpSession session) { if (username.equals(body.username()) && password.equals(body.password())) { session.setAttribute("admin", true); return new LoginResponse("admin"); } return users.findByUsername(body.username()).filter(u -> encoder.matches(body.password(), u.passwordHash())).map(u -> { session.setAttribute("userId", u.getId()); return new LoginResponse("user"); }).orElseThrow(Forbidden::new); }
  record Login(@NotBlank String username, @NotBlank String password) {}
  record LoginResponse(String role) {}
  record AccountResponse(String role, String username) {}
  record ProjectInput(@NotBlank String slug, @NotBlank String title, @NotBlank String description, Integer displayOrder, String tags, String repoUrl) {}
  record PostInput(@NotBlank String slug, @NotBlank String title, @NotBlank String description, Instant publishedAt, String tags) {}
  @ResponseStatus(HttpStatus.FORBIDDEN) static class Forbidden extends RuntimeException {}
}
