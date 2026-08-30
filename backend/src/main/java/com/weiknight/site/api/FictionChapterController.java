package com.weiknight.site.api;

import com.weiknight.site.fiction.NovelChapter;
import com.weiknight.site.fiction.NovelChapterRepository;
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

/** @description Manages ordered Markdown chapters under one existing novel. */
@RestController
@RequestMapping("/api/v1/admin/fiction/novels/{novelId}/chapters")
public class FictionChapterController {
  private final NovelRepository novels;
  private final NovelChapterRepository chapters;
  private final SessionAccess access;

  FictionChapterController(
      NovelRepository novels,
      NovelChapterRepository chapters,
      SessionAccess access) {
    this.novels = novels;
    this.chapters = chapters;
    this.access = access;
  }

  /** @description Lists all chapters belonging to one novel in reading order. */
  @GetMapping
  public List<ChapterResponse> list(@PathVariable Long novelId, HttpSession session) {
    access.requireAdmin(session);
    requireNovel(novelId);
    return chapters.findAllByNovelIdOrderByDisplayOrderAscTitleAsc(novelId).stream()
        .map(ChapterResponse::from)
        .toList();
  }

  /** @description Creates one chapter under an existing novel. */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ChapterResponse create(
      @PathVariable Long novelId,
      @Valid @RequestBody ChapterInput input,
      HttpSession session) {
    access.requireAdmin(session);
    requireNovel(novelId);
    return ChapterResponse.from(chapters.save(new NovelChapter(
        novelId,
        SlugGenerator.unique(
            input.title(),
            "chapter",
            slug -> chapters.existsByNovelIdAndSlug(novelId, slug)),
        input.title().trim(),
        input.content(),
        nextOrder(novelId))));
  }

  /** @description Replaces one chapter without changing its parent novel. */
  @PutMapping("/{id}")
  public ChapterResponse update(
      @PathVariable Long novelId,
      @PathVariable Long id,
      @Valid @RequestBody ChapterInput input,
      HttpSession session) {
    access.requireAdmin(session);
    requireNovel(novelId);
    NovelChapter chapter = findChapter(novelId, id);
    chapter.update(input.title().trim(), input.content());
    return ChapterResponse.from(chapters.save(chapter));
  }

  /** @description Permanently removes one chapter from its parent novel. */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void delete(
      @PathVariable Long novelId,
      @PathVariable Long id,
      HttpSession session) {
    access.requireAdmin(session);
    requireNovel(novelId);
    chapters.delete(findChapter(novelId, id));
    chapters.flush();
    normalize(ordered(novelId));
  }

  /** @description Moves one chapter by exactly one position within its parent novel. */
  @PutMapping("/{id}/position")
  @Transactional
  public List<ChapterResponse> move(
      @PathVariable Long novelId,
      @PathVariable Long id,
      @Valid @RequestBody PositionInput input,
      HttpSession session) {
    access.requireAdmin(session);
    requireNovel(novelId);
    List<NovelChapter> ordered = ordered(novelId);
    int current = IntStream.range(0, ordered.size())
        .filter(index -> ordered.get(index).getId().equals(id))
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));
    int target = current + (input.direction().equals("up") ? -1 : 1);
    if (target < 0 || target >= ordered.size()) {
      return responses(ordered);
    }
    Collections.swap(ordered, current, target);
    return responses(normalize(ordered));
  }

  private void requireNovel(Long id) {
    if (!novels.existsById(id)) {
      throw new ResourceNotFoundException("Novel not found");
    }
  }

  private NovelChapter findChapter(Long novelId, Long id) {
    NovelChapter chapter = chapters.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));
    if (!chapter.getNovelId().equals(novelId)) {
      throw new ResourceNotFoundException("Chapter not found");
    }
    return chapter;
  }

  private List<NovelChapter> ordered(Long novelId) {
    return chapters.findAllByNovelIdOrderByDisplayOrderAscTitleAsc(novelId);
  }

  private List<NovelChapter> normalize(List<NovelChapter> ordered) {
    IntStream.range(0, ordered.size())
        .forEach(index -> ordered.get(index).reorder(index + 1));
    return chapters.saveAll(ordered);
  }

  private List<ChapterResponse> responses(List<NovelChapter> ordered) {
    return ordered.stream().map(ChapterResponse::from).toList();
  }

  private int nextOrder(Long novelId) {
    return ordered(novelId).stream()
        .mapToInt(NovelChapter::getDisplayOrder)
        .max()
        .orElse(0) + 1;
  }

  /** @description Defines the editable fields of one novel chapter. */
  public record ChapterInput(
      @NotBlank @Size(max = 240) String title,
      @NotBlank String content) {
  }

  /** @description Defines an accepted one-step chapter movement. */
  public record PositionInput(
      @NotBlank @Pattern(regexp = "up|down") String direction) {
  }

  /** @description Returns the complete editable representation of one chapter. */
  public record ChapterResponse(
      Long id,
      String slug,
      String title,
      String content,
      Integer displayOrder,
      Instant updatedAt) {
    static ChapterResponse from(NovelChapter chapter) {
      return new ChapterResponse(
          chapter.getId(), chapter.getSlug(), chapter.getTitle(), chapter.getContent(),
          chapter.getDisplayOrder(), chapter.getUpdatedAt());
    }
  }
}
