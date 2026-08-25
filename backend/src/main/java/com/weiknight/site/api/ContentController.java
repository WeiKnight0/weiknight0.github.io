package com.weiknight.site.api;

import com.weiknight.site.content.Post;
import com.weiknight.site.content.PostRepository;
import com.weiknight.site.content.Project;
import com.weiknight.site.content.ProjectRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Exposes public portfolio and blog content without persistence-only fields.
 */
@RestController
@RequestMapping("/api/v1")
public class ContentController {
  private final ProjectRepository projects;
  private final PostRepository posts;

  ContentController(ProjectRepository projects, PostRepository posts) {
    this.projects = projects;
    this.posts = posts;
  }

  /**
   * @description Returns projects in their configured display order.
   */
  @GetMapping("/projects")
  public List<ProjectResponse> projects() {
    return projects.findAllByOrderByDisplayOrderAsc().stream().map(ProjectResponse::from).toList();
  }

  /**
   * @description Returns blog summaries ordered from newest to oldest.
   */
  @GetMapping("/posts")
  public List<PostResponse> posts() {
    return posts.findAllByOrderByPublishedAtDesc().stream().map(PostResponse::from).toList();
  }

  /**
   * @description Returns one complete blog for the public article page.
   * @param slug Stable URL identifier of the requested blog.
   * @throws ResourceNotFoundException when no blog owns the slug.
   */
  @GetMapping("/posts/{slug}")
  public PostDetailResponse post(@PathVariable String slug) {
    return posts.findBySlug(slug)
        .map(PostDetailResponse::from)
        .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
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

  /** @description Public blog summary representation. */
  public record PostResponse(
      String slug,
      String title,
      String description,
      Instant publishedAt,
      List<String> tags) {
    static PostResponse from(Post post) {
      return new PostResponse(
          post.getSlug(),
          post.getTitle(),
          post.getDescription(),
          post.getPublishedAt(),
          parseTags(post.getTags()));
    }
  }

  /** @description Public blog representation including Markdown content. */
  public record PostDetailResponse(
      String slug,
      String title,
      String description,
      Instant publishedAt,
      List<String> tags,
      String content) {
    static PostDetailResponse from(Post post) {
      return new PostDetailResponse(
          post.getSlug(),
          post.getTitle(),
          post.getDescription(),
          post.getPublishedAt(),
          parseTags(post.getTags()),
          post.getContent());
    }
  }

  private static List<String> parseTags(String values) {
    if (values.isBlank()) {
      return List.of();
    }
    return Arrays.stream(values.split(",")).map(String::trim).toList();
  }
}
