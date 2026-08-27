package com.weiknight.site.api;

import com.weiknight.site.fiction.FictionEntry;
import com.weiknight.site.fiction.FictionEntryRepository;
import com.weiknight.site.fiction.FictionEntryType;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Exposes published novels and original-character files.
 */
@RestController
@RequestMapping("/api/v1/fiction")
public class FictionContentController {
  private final FictionEntryRepository entries;

  FictionContentController(FictionEntryRepository entries) {
    this.entries = entries;
  }

  /**
   * @description Lists published entries in one supported fiction section.
   * @param kind Public section identifier: novels or oc.
   */
  @GetMapping("/{kind}")
  public List<EntrySummary> list(@PathVariable String kind) {
    return entries.findAllByTypeAndPublishedTrueOrderByDisplayOrderAscTitleAsc(type(kind)).stream()
        .map(EntrySummary::from)
        .toList();
  }

  /**
   * @description Loads one published novel or original-character file.
   * @param kind Public section identifier: novels or oc.
   * @param slug Stable public URL identifier.
   * @throws ResourceNotFoundException when the published entry does not exist.
   */
  @GetMapping("/{kind}/{slug}")
  public EntryDetail get(@PathVariable String kind, @PathVariable String slug) {
    return EntryDetail.from(find(kind, slug));
  }

  /**
   * @description Confirms a public Fiction slug before Nginx serves its static reader shell.
   * @param kind Public section identifier: novels or oc.
   * @param slug Stable public URL identifier.
   * @throws ResourceNotFoundException when the published entry does not exist.
   */
  @GetMapping("/page/{kind}/{slug}")
  public ResponseEntity<Void> page(@PathVariable String kind, @PathVariable String slug) {
    find(kind, slug);
    return ResponseEntity.ok()
        .header("X-Accel-Redirect", "/internal/fiction/" + kind + "/")
        .build();
  }

  private FictionEntry find(String kind, String slug) {
    return entries.findByTypeAndSlugAndPublishedTrue(type(kind), slug)
        .orElseThrow(() -> new ResourceNotFoundException("Fiction entry not found"));
  }

  private FictionEntryType type(String kind) {
    return switch (kind) {
      case "novels" -> FictionEntryType.NOVEL;
      case "oc" -> FictionEntryType.CHARACTER;
      default -> throw new IllegalArgumentException("Unsupported fiction section");
    };
  }

  /** @description Public list representation of one fiction entry. */
  public record EntrySummary(
      String slug,
      String title,
      String description,
      Instant updatedAt) {
    static EntrySummary from(FictionEntry entry) {
      return new EntrySummary(
          entry.getSlug(),
          entry.getTitle(),
          entry.getDescription(),
          entry.getUpdatedAt());
    }
  }

  /** @description Public detail representation including the Markdown body. */
  public record EntryDetail(
      String slug,
      String title,
      String description,
      String content,
      Instant updatedAt) {
    static EntryDetail from(FictionEntry entry) {
      return new EntryDetail(
          entry.getSlug(),
          entry.getTitle(),
          entry.getDescription(),
          entry.getContent(),
          entry.getUpdatedAt());
    }
  }
}
