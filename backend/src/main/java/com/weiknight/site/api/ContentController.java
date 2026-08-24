package com.weiknight.site.api;

import com.weiknight.site.content.Post;
import com.weiknight.site.content.PostRepository;
import com.weiknight.site.content.Project;
import com.weiknight.site.content.ProjectRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ContentController {
  private final ProjectRepository projects;
  private final PostRepository posts;
  public ContentController(ProjectRepository projects, PostRepository posts) { this.projects = projects; this.posts = posts; }
  @GetMapping("/projects") public List<ProjectResponse> projects() { return projects.findAllByOrderByDisplayOrderAsc().stream().map(ProjectResponse::from).toList(); }
  @GetMapping("/posts") public List<PostResponse> posts() { return posts.findAllByOrderByPublishedAtDesc().stream().map(PostResponse::from).toList(); }
  public record ProjectResponse(String slug, String title, String description, List<String> tags, String repoUrl) { static ProjectResponse from(Project p) { return new ProjectResponse(p.getSlug(), p.getTitle(), p.getDescription(), ContentController.parseTags(p.getTags()), p.getRepoUrl()); } }
  public record PostResponse(String slug, String title, String description, Instant publishedAt, List<String> tags) { static PostResponse from(Post p) { return new PostResponse(p.getSlug(), p.getTitle(), p.getDescription(), p.getPublishedAt(), ContentController.parseTags(p.getTags())); } }
  private static List<String> parseTags(String values) { return values.isBlank() ? List.of() : Arrays.stream(values.split(",")).map(String::trim).toList(); }
}
