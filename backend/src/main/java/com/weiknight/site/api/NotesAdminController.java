package com.weiknight.site.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.weiknight.site.note.ArticleContentFormat;
import com.weiknight.site.note.ArticleStatus;
import com.weiknight.site.note.NoteArticle;
import com.weiknight.site.note.NoteArticleRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
 * @description Provides administrator CRUD and publication control for note articles.
 */
@RestController
@RequestMapping("/api/v1/admin/notes")
public class NotesAdminController {
  private final NoteArticleRepository articles;
  private final SessionAccess access;
  private final ObjectMapper objectMapper;

  NotesAdminController(NoteArticleRepository articles, SessionAccess access, ObjectMapper objectMapper) {
    this.articles = articles;
    this.access = access;
    this.objectMapper = objectMapper;
  }

  /**
   * @description Lists lightweight article metadata for the administration sidebar.
   * @param session Session that must represent the administrator.
   * @throws AccessDeniedException when the session is not administrative.
   */
  @GetMapping
  public List<AdminNoteSummary> list(HttpSession session) {
    access.requireAdmin(session);
    return articles.findAllByOrderByUpdatedAtDesc().stream().map(AdminNoteSummary::from).toList();
  }

  /**
   * @description Loads the complete article selected in the administration editor.
   * @param id Persistent article identifier.
   * @param session Session that must represent the administrator.
   * @throws ResourceNotFoundException when the article no longer exists.
   */
  @GetMapping("/{id}")
  public NoteArticle get(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    return find(id);
  }

  /**
   * @description Creates a draft or published article from structured editor content.
   * @param input Validated article metadata and complete body.
   * @param session Session that must represent the administrator.
   * @throws JsonProcessingException when JSON editor content is malformed.
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public NoteArticle create(@Valid @RequestBody ArticleInput input, HttpSession session)
      throws JsonProcessingException {
    access.requireAdmin(session);
    validateContent(input);
    NoteArticle article = new NoteArticle();
    update(article, input);
    return articles.save(article);
  }

  /**
   * @description Replaces the selected article and its publication state.
   * @param id Persistent article identifier.
   * @param input Validated replacement metadata and complete body.
   * @param session Session that must represent the administrator.
   * @throws JsonProcessingException when JSON editor content is malformed.
   * @throws ResourceNotFoundException when the article no longer exists.
   */
  @PutMapping("/{id}")
  public NoteArticle update(
      @PathVariable Long id,
      @Valid @RequestBody ArticleInput input,
      HttpSession session) throws JsonProcessingException {
    access.requireAdmin(session);
    validateContent(input);
    NoteArticle article = find(id);
    update(article, input);
    return articles.save(article);
  }

  /**
   * @description Permanently deletes the selected article while leaving reusable images intact.
   * @param id Persistent article identifier.
   * @param session Session that must represent the administrator.
   * @throws ResourceNotFoundException when the article no longer exists.
   */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    articles.delete(find(id));
  }

  private NoteArticle find(Long id) {
    return articles.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Note article not found"));
  }

  private void validateContent(ArticleInput input) throws JsonProcessingException {
    if (input.contentFormat() != ArticleContentFormat.JSON) {
      return;
    }
    JsonNode content = objectMapper.readTree(input.content());
    if (!content.isObject()
        || !"doc".equals(content.path("type").asText())
        || !content.path("content").isArray()) {
      throw new IllegalArgumentException("Editor content must be a Tiptap document");
    }
  }

  private void update(NoteArticle article, ArticleInput input) {
    article.update(
        input.slug(),
        input.title(),
        input.summary(),
        blankToNull(input.coverUrl()),
        input.tags(),
        blankToNull(input.series()),
        input.seriesOrder(),
        input.status(),
        input.contentFormat(),
        input.content(),
        publicationTime(input));
  }

  private Instant publicationTime(ArticleInput input) {
    if (input.status() != ArticleStatus.PUBLISHED) {
      return input.publishedAt();
    }
    return input.publishedAt() == null ? Instant.now() : input.publishedAt();
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  /** @description Complete editable representation accepted from the note editor. */
  public record ArticleInput(
      @NotBlank @Size(max = 160) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
      @NotBlank @Size(max = 240) String title,
      @NotBlank String summary,
      @Size(max = 1000) String coverUrl,
      @NotNull @Size(max = 1000) String tags,
      @Size(max = 240) String series,
      @Positive Integer seriesOrder,
      @NotNull ArticleStatus status,
      @NotNull ArticleContentFormat contentFormat,
      @NotBlank String content,
      Instant publishedAt) {
  }

  /** @description Sidebar representation of one editable article. */
  public record AdminNoteSummary(
      Long id,
      String slug,
      String title,
      ArticleStatus status,
      String series,
      Instant updatedAt) {
    static AdminNoteSummary from(NoteArticle article) {
      return new AdminNoteSummary(
          article.getId(),
          article.getSlug(),
          article.getTitle(),
          article.getStatus(),
          article.getSeries(),
          article.getUpdatedAt());
    }
  }
}
