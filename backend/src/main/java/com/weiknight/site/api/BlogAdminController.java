package com.weiknight.site.api;

import com.weiknight.site.content.Post;
import com.weiknight.site.content.PostRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Provides administrator-only CRUD operations for database-backed blogs.
 */
@RestController
@RequestMapping("/api/v1/admin/posts")
public class BlogAdminController {
  private final PostRepository posts;
  private final SessionAccess access;

  BlogAdminController(PostRepository posts, SessionAccess access) {
    this.posts = posts;
    this.access = access;
  }

  /**
   * @description Lists lightweight blog metadata for the administration sidebar.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   */
  @GetMapping
  public List<PostSummary> list(HttpSession session) {
    access.requireAdmin(session);
    return posts.findAllByOrderByPublishedAtDesc().stream().map(PostSummary::from).toList();
  }

  /**
   * @description Loads the complete blog selected in the administration editor.
   * @param id Persistent blog identifier selected by the administrator.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   * @throws ResourceNotFoundException when the blog no longer exists.
   */
  @GetMapping("/{id}")
  public Post get(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    return find(id);
  }

  /**
   * @description Creates a publishable blog from the administration editor.
   * @param input Validated blog metadata and Markdown content.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Post create(@Valid @RequestBody PostInput input, HttpSession session) {
    access.requireAdmin(session);
    Post post = new Post();
    update(post, input);
    return posts.save(post);
  }

  /**
   * @description Replaces the editable fields of an existing blog.
   * @param id Persistent blog identifier selected by the administrator.
   * @param input Validated replacement metadata and Markdown content.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   * @throws ResourceNotFoundException when the blog no longer exists.
   */
  @PutMapping("/{id}")
  public Post update(@PathVariable Long id, @Valid @RequestBody PostInput input, HttpSession session) {
    access.requireAdmin(session);
    Post post = find(id);
    update(post, input);
    return posts.save(post);
  }

  /**
   * @description Permanently deletes the selected blog.
   * @param id Persistent blog identifier selected by the administrator.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   * @throws ResourceNotFoundException when the blog no longer exists.
   */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    posts.delete(find(id));
  }

  private Post find(Long id) {
    return posts.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
  }

  private void update(Post post, PostInput input) {
    post.update(
        input.slug(),
        input.title(),
        input.description(),
        input.publishedAt(),
        input.tags(),
        input.content());
  }

  /** @description Complete editable representation accepted from the blog editor. */
  public record PostInput(
      @NotBlank @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
      @NotBlank String title,
      @NotBlank String description,
      @NotNull Instant publishedAt,
      @NotNull String tags,
      @NotBlank String content) {
  }

  /** @description Lightweight representation used by the blog editor sidebar. */
  public record PostSummary(Long id, String slug, String title, Instant publishedAt) {
    static PostSummary from(Post post) {
      return new PostSummary(post.getId(), post.getSlug(), post.getTitle(), post.getPublishedAt());
    }
  }
}
