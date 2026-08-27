package com.weiknight.site.api;

import com.weiknight.site.fiction.FictionEntry;
import com.weiknight.site.fiction.FictionEntryRepository;
import com.weiknight.site.fiction.FictionEntryType;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.transaction.annotation.Transactional;
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
 * @description Provides one administrator CRUD surface for novels and original-character files.
 */
@RestController
@RequestMapping("/api/v1/admin/fiction/{kind}")
public class FictionAdminController {
  private final FictionEntryRepository entries;
  private final SessionAccess access;

  FictionAdminController(FictionEntryRepository entries, SessionAccess access) {
    this.entries = entries;
    this.access = access;
  }

  /**
   * @description Lists entries for one fiction administration tab.
   * @param kind Administrative section identifier: novels or oc.
   * @param session Session that must represent the administrator.
   */
  @GetMapping
  public List<EntrySummary> list(@PathVariable String kind, HttpSession session) {
    access.requireAdmin(session);
    return entries.findAllByTypeOrderByDisplayOrderAscTitleAsc(type(kind)).stream()
        .map(EntrySummary::from)
        .toList();
  }

  /**
   * @description Loads the complete fiction entry selected in the editor.
   * @param kind Administrative section identifier.
   * @param id Persistent entry identifier.
   * @param session Session that must represent the administrator.
   */
  @GetMapping("/{id}")
  public FictionEntry get(@PathVariable String kind, @PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    return find(type(kind), id);
  }

  /**
   * @description Creates one novel or original-character file.
   * @param kind Administrative section identifier.
   * @param input Validated metadata and Markdown body.
   * @param session Session that must represent the administrator.
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public FictionEntry create(
      @PathVariable String kind,
      @Valid @RequestBody EntryInput input,
      HttpSession session) {
    access.requireAdmin(session);
    FictionEntry entry = new FictionEntry(type(kind));
    update(entry, input);
    return entries.save(entry);
  }

  /**
   * @description Replaces one existing fiction entry.
   * @param kind Administrative section identifier.
   * @param id Persistent entry identifier.
   * @param input Validated replacement metadata and Markdown body.
   * @param session Session that must represent the administrator.
   */
  @PutMapping("/{id}")
  public FictionEntry update(
      @PathVariable String kind,
      @PathVariable Long id,
      @Valid @RequestBody EntryInput input,
      HttpSession session) {
    access.requireAdmin(session);
    FictionEntry entry = find(type(kind), id);
    update(entry, input);
    return entries.save(entry);
  }

  /**
   * @description Permanently deletes one fiction entry.
   * @param kind Administrative section identifier.
   * @param id Persistent entry identifier.
   * @param session Session that must represent the administrator.
   */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable String kind, @PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    entries.delete(find(type(kind), id));
  }

  /**
   * @description Moves one original character by one position and normalizes the complete OC order.
   * @param kind Administrative section identifier, which must be oc.
   * @param id Persistent character identifier.
   * @param input Requested upward or downward movement.
   * @param session Session that must represent the administrator.
   */
  @PutMapping("/{id}/position")
  @Transactional
  public List<EntrySummary> move(
      @PathVariable String kind,
      @PathVariable Long id,
      @Valid @RequestBody PositionInput input,
      HttpSession session) {
    access.requireAdmin(session);
    FictionEntryType entryType = type(kind);
    if (entryType != FictionEntryType.CHARACTER) {
      throw new IllegalArgumentException("Only original characters use positional controls");
    }
    List<FictionEntry> ordered = entries.findAllByTypeOrderByDisplayOrderAscTitleAsc(entryType);
    int current = IntStream.range(0, ordered.size())
        .filter(index -> ordered.get(index).getId().equals(id))
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("Fiction entry not found"));
    int target = current + (input.direction().equals("up") ? -1 : 1);
    if (target < 0 || target >= ordered.size()) {
      return summaries(ordered);
    }
    Collections.swap(ordered, current, target);
    IntStream.range(0, ordered.size()).forEach(index -> ordered.get(index).reorder(index + 1));
    return summaries(entries.saveAll(ordered));
  }

  private FictionEntry find(FictionEntryType type, Long id) {
    FictionEntry entry = entries.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Fiction entry not found"));
    if (entry.getType() != type) {
      throw new ResourceNotFoundException("Fiction entry not found");
    }
    return entry;
  }

  private FictionEntryType type(String kind) {
    return switch (kind) {
      case "novels" -> FictionEntryType.NOVEL;
      case "oc" -> FictionEntryType.CHARACTER;
      default -> throw new IllegalArgumentException("Unsupported fiction section");
    };
  }

  private void update(FictionEntry entry, EntryInput input) {
    entry.update(
        input.slug().trim(),
        input.title().trim(),
        input.description().trim(),
        input.displayOrder(),
        input.content(),
        input.published());
  }

  private List<EntrySummary> summaries(List<FictionEntry> ordered) {
    return ordered.stream().map(EntrySummary::from).toList();
  }

  /** @description Complete editable representation accepted by both fiction editors. */
  public record EntryInput(
      @NotBlank @Size(max = 160) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
      @NotBlank @Size(max = 240) String title,
      @NotBlank @Size(max = 2000) String description,
      @NotNull @PositiveOrZero Integer displayOrder,
      @NotBlank String content,
      boolean published) {
  }

  /** @description Validated direction accepted by the original-character ordering controls. */
  public record PositionInput(
      @NotBlank @Pattern(regexp = "up|down") String direction) {
  }

  /** @description Lightweight representation used by fiction administration sidebars. */
  public record EntrySummary(
      Long id,
      String slug,
      String title,
      Integer displayOrder,
      boolean published,
      Instant updatedAt) {
    static EntrySummary from(FictionEntry entry) {
      return new EntrySummary(
          entry.getId(),
          entry.getSlug(),
          entry.getTitle(),
          entry.getDisplayOrder(),
          entry.isPublished(),
          entry.getUpdatedAt());
    }
  }
}
