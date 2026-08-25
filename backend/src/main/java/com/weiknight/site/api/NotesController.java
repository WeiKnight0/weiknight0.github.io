package com.weiknight.site.api;

import com.weiknight.site.note.ArticleStatus;
import com.weiknight.site.note.NoteArticle;
import com.weiknight.site.note.NoteArticleRepository;
import jakarta.servlet.http.HttpSession;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Exposes authenticated reading APIs for published note articles.
 */
@RestController
@RequestMapping("/api/v1")
public class NotesController {
  private static final Set<String> INFORMATION_ARTICLES = Set.of("index", "terms");
  private final NoteArticleRepository articles;
  private final SessionAccess access;

  NotesController(NoteArticleRepository articles, SessionAccess access) {
    this.articles = articles;
    this.access = access;
  }

  /**
   * @description Authorizes Nginx access to member-only note pages.
   * @param session Session that must represent a member or administrator.
   * @throws AccessDeniedException when the session is anonymous.
   */
  @GetMapping("/session")
  public void session(HttpSession session) {
    access.requireMember(session);
  }

  /**
   * @description Lists published articles from newest to oldest for the note feed.
   * @param session Session that must represent a member or administrator.
   * @throws AccessDeniedException when the session is anonymous.
   */
  @GetMapping("/notes")
  public List<NoteListItem> notes(HttpSession session) {
    access.requireMember(session);
    return articles.findAllByStatusOrderByDirectoryAscSortOrderAscTitleAsc(ArticleStatus.PUBLISHED).stream()
        .filter(article -> !INFORMATION_ARTICLES.contains(article.getSlug()))
        .map(NoteListItem::from)
        .toList();
  }

  /**
   * @description Loads one complete published article for the reader page.
   * @param slug Stable article URL identifier.
   * @param session Session that must represent a member or administrator.
   * @throws AccessDeniedException when the session is anonymous.
   * @throws ResourceNotFoundException when no published article owns the slug.
   */
  @GetMapping("/notes/{slug}")
  public NoteDetail note(@PathVariable String slug, HttpSession session) {
    access.requireMember(session);
    return articles.findBySlugAndStatus(slug, ArticleStatus.PUBLISHED)
        .map(NoteDetail::from)
        .orElseThrow(() -> new ResourceNotFoundException("Note article not found"));
  }

  /** @description Feed representation of one published article. */
  public record NoteListItem(
      String slug,
      String title,
      String coverUrl,
      List<String> tags,
      String series,
      Integer seriesOrder,
      String directory,
      Integer sortOrder,
      Instant publishedAt,
      Instant updatedAt) {
    static NoteListItem from(NoteArticle article) {
      return new NoteListItem(
          article.getSlug(),
          article.getTitle(),
          article.getCoverUrl(),
          parseTags(article.getTags()),
          article.getSeries(),
          article.getSeriesOrder(),
          article.getDirectory(),
          article.getSortOrder(),
          article.getPublishedAt(),
          article.getUpdatedAt());
    }
  }

  /** @description Reader representation including the structured article body. */
  public record NoteDetail(
      String slug,
      String title,
      String coverUrl,
      List<String> tags,
      String series,
      Integer seriesOrder,
      String directory,
      Integer sortOrder,
      Instant publishedAt,
      Instant updatedAt,
      String contentFormat,
      String content) {
    static NoteDetail from(NoteArticle article) {
      return new NoteDetail(
          article.getSlug(),
          article.getTitle(),
          article.getCoverUrl(),
          parseTags(article.getTags()),
          article.getSeries(),
          article.getSeriesOrder(),
          article.getDirectory(),
          article.getSortOrder(),
          article.getPublishedAt(),
          article.getUpdatedAt(),
          article.getContentFormat().name(),
          article.getContent());
    }
  }

  private static List<String> parseTags(String tags) {
    if (tags.isBlank()) {
      return List.of();
    }
    return Arrays.stream(tags.split(",")).map(String::trim).filter(value -> !value.isEmpty()).toList();
  }
}
