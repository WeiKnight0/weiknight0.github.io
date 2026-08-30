package com.weiknight.site.api;

import com.weiknight.site.fiction.Novel;
import com.weiknight.site.fiction.NovelRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** @description Manages novel metadata independently from chapter content. */
@RestController
@RequestMapping("/api/v1/admin/fiction/novels")
public class NovelAdminController {
  private final NovelRepository novels;
  private final SessionAccess access;

  NovelAdminController(NovelRepository novels, SessionAccess access) {
    this.novels = novels;
    this.access = access;
  }

  /** @description Lists all novels for the administration sidebar. */
  @GetMapping
  public List<NovelResponse> list(HttpSession session) {
    access.requireAdmin(session);
    return novels.findAllByOrderByDisplayOrderAscTitleAsc().stream()
        .map(NovelResponse::from)
        .toList();
  }

  /** @description Loads one novel's editable metadata. */
  @GetMapping("/{id}")
  public NovelResponse get(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    return NovelResponse.from(find(id));
  }

  /** @description Creates a novel container without inventing chapter content. */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public NovelResponse create(@Valid @RequestBody NovelInput input, HttpSession session) {
    access.requireAdmin(session);
    return NovelResponse.from(novels.save(new Novel(
        SlugGenerator.unique(input.title(), "novel", novels::existsBySlug),
        input.title().trim(),
        input.description().trim(),
        nextOrder())));
  }

  /** @description Replaces one novel's metadata without modifying its chapters. */
  @PutMapping("/{id}")
  public NovelResponse update(
      @PathVariable Long id,
      @Valid @RequestBody NovelUpdateInput input,
      HttpSession session) {
    access.requireAdmin(session);
    Novel novel = find(id);
    if (!novel.getSlug().equals(input.slug()) && novels.existsBySlug(input.slug())) {
      throw new ResourceConflictException("This novel URL is already in use");
    }
    novel.update(input.slug(), input.title().trim(), input.description().trim());
    return NovelResponse.from(novels.save(novel));
  }

  /** @description Deletes one novel and its chapters through the database foreign key. */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void delete(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    novels.delete(find(id));
    novels.flush();
    normalize(novels.findAllByOrderByDisplayOrderAscTitleAsc());
  }

  /** @description Moves one novel by exactly one position and normalizes the novel order. */
  @PutMapping("/{id}/position")
  @Transactional
  public List<NovelResponse> move(
      @PathVariable Long id,
      @Valid @RequestBody PositionInput input,
      HttpSession session) {
    access.requireAdmin(session);
    List<Novel> ordered = novels.findAllByOrderByDisplayOrderAscTitleAsc();
    int current = IntStream.range(0, ordered.size())
        .filter(index -> ordered.get(index).getId().equals(id))
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("Novel not found"));
    int target = current + (input.direction().equals("up") ? -1 : 1);
    if (target < 0 || target >= ordered.size()) {
      return responses(ordered);
    }
    Collections.swap(ordered, current, target);
    return responses(normalize(ordered));
  }

  private Novel find(Long id) {
    return novels.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Novel not found"));
  }

  private List<Novel> normalize(List<Novel> ordered) {
    IntStream.range(0, ordered.size())
        .forEach(index -> ordered.get(index).reorder(index + 1));
    return novels.saveAll(ordered);
  }

  private List<NovelResponse> responses(List<Novel> ordered) {
    return ordered.stream().map(NovelResponse::from).toList();
  }

  private int nextOrder() {
    return novels.findAllByOrderByDisplayOrderAscTitleAsc().stream()
        .mapToInt(Novel::getDisplayOrder)
        .max()
        .orElse(0) + 1;
  }

  /** @description Defines the metadata accepted when a novel is created or updated. */
  public record NovelInput(
      @NotBlank @Size(max = 240) String title,
      @NotBlank @Size(max = 2000) String description) {
  }

  /** @description Defines editable novel metadata including its public URL. */
  public record NovelUpdateInput(
      @NotBlank @Size(max = 160) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
      @NotBlank @Size(max = 240) String title,
      @NotBlank @Size(max = 2000) String description) {
  }

  /** @description Defines an accepted one-step ordering direction. */
  public record PositionInput(
      @NotBlank @Pattern(regexp = "up|down") String direction) {
  }

  /** @description Returns complete novel metadata without a novel-level Markdown body. */
  public record NovelResponse(
      Long id,
      String slug,
      String title,
      String description,
      Integer displayOrder,
      Instant updatedAt) {
    static NovelResponse from(Novel novel) {
      return new NovelResponse(
          novel.getId(), novel.getSlug(), novel.getTitle(), novel.getDescription(),
          novel.getDisplayOrder(), novel.getUpdatedAt());
    }
  }
}
