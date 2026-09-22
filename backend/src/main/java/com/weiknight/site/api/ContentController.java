package com.weiknight.site.api;

import com.weiknight.site.content.Project;
import com.weiknight.site.content.ProjectRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Exposes public portfolio content without persistence-only fields.
 */
@RestController
@RequestMapping("/api/v1")
public class ContentController {
  private final ProjectRepository projects;

  ContentController(ProjectRepository projects) {
    this.projects = projects;
  }

  /**
   * @description Returns projects in their configured display order.
   */
  @GetMapping("/projects")
  public List<ProjectResponse> projects() {
    return projects.findAllByOrderByDisplayOrderAsc().stream().map(ProjectResponse::from).toList();
  }

  /** @description Public project representation. */
  public record ProjectResponse(
      String slug,
      String title,
      String description,
      List<String> tags,
      String repoUrl) {
    static ProjectResponse from(Project project) {
      return new ProjectResponse(
          project.getSlug(),
          project.getTitle(),
          project.getDescription(),
          parseTags(project.getTags()),
          project.getRepoUrl());
    }
  }

  private static List<String> parseTags(String values) {
    if (values.isBlank()) {
      return List.of();
    }
    return Arrays.stream(values.split(",")).map(String::trim).toList();
  }
}
