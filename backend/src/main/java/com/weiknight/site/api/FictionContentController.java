package com.weiknight.site.api;

import com.weiknight.site.fiction.Novel;
import com.weiknight.site.fiction.NovelChapter;
import com.weiknight.site.fiction.NovelChapterRepository;
import com.weiknight.site.fiction.NovelRepository;
import com.weiknight.site.fiction.OriginalCharacter;
import com.weiknight.site.fiction.OriginalCharacterRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** @description Exposes public novel, chapter, and original-character content. */
@RestController
@RequestMapping("/api/v1/fiction")
public class FictionContentController {
  private final NovelRepository novels;
  private final NovelChapterRepository chapters;
  private final OriginalCharacterRepository characters;

  FictionContentController(
      NovelRepository novels,
      NovelChapterRepository chapters,
      OriginalCharacterRepository characters) {
    this.novels = novels;
    this.chapters = chapters;
    this.characters = characters;
  }

  /** @description Lists novels without loading chapter bodies. */
  @GetMapping("/novels")
  public List<EntrySummary> novels() {
    return novels.findAllByOrderByDisplayOrderAscTitleAsc().stream()
        .map(EntrySummary::from)
        .toList();
  }

  /** @description Lists original characters without loading profile bodies. */
  @GetMapping("/oc")
  public List<EntrySummary> characters() {
    return characters.findAllByOrderByDisplayOrderAscTitleAsc().stream()
        .map(EntrySummary::from)
        .toList();
  }

  /** @description Loads one novel and its chapter directory without a novel-level body. */
  @GetMapping("/novels/{slug}")
  public NovelDetail novel(@PathVariable String slug) {
    Novel novel = findNovel(slug);
    return NovelDetail.from(
        novel,
        chapters.findAllByNovelIdOrderByDisplayOrderAscTitleAsc(novel.getId()));
  }

  /** @description Loads one complete original-character profile. */
  @GetMapping("/oc/{slug}")
  public CharacterDetail character(@PathVariable String slug) {
    return CharacterDetail.from(findCharacter(slug));
  }

  /** @description Loads one chapter scoped by both novel and chapter slugs. */
  @GetMapping("/novels/{novelSlug}/{chapterSlug}")
  public ChapterDetail chapter(
      @PathVariable String novelSlug,
      @PathVariable String chapterSlug) {
    Novel novel = findNovel(novelSlug);
    return ChapterDetail.from(
        novel,
        chapters.findByNovelIdAndSlug(novel.getId(), chapterSlug)
            .orElseThrow(() -> new ResourceNotFoundException("Chapter not found")));
  }

  /** @description Confirms a novel slug before Nginx serves the static novel shell. */
  @GetMapping("/page/novels/{slug}")
  public ResponseEntity<Void> novelPage(@PathVariable String slug) {
    findNovel(slug);
    return internal("/internal/fiction/novels/");
  }

  /** @description Confirms a character slug before Nginx serves the static character shell. */
  @GetMapping("/page/oc/{slug}")
  public ResponseEntity<Void> characterPage(@PathVariable String slug) {
    findCharacter(slug);
    return internal("/internal/fiction/oc/");
  }

  /** @description Confirms a chapter path before Nginx serves the static chapter shell. */
  @GetMapping("/page/novels/{novelSlug}/{chapterSlug}")
  public ResponseEntity<Void> chapterPage(
      @PathVariable String novelSlug,
      @PathVariable String chapterSlug) {
    Novel novel = findNovel(novelSlug);
    chapters.findByNovelIdAndSlug(novel.getId(), chapterSlug)
        .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));
    return internal("/internal/fiction/novel-chapter/");
  }

  private Novel findNovel(String slug) {
    return novels.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Novel not found"));
  }

  private OriginalCharacter findCharacter(String slug) {
    return characters.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Original character not found"));
  }

  private ResponseEntity<Void> internal(String path) {
    return ResponseEntity.ok().header("X-Accel-Redirect", path).build();
  }

  /** @description Returns the fields shared by public fiction listings. */
  public record EntrySummary(String slug, String title, String description, Instant updatedAt) {
    static EntrySummary from(Novel novel) {
      return new EntrySummary(
          novel.getSlug(), novel.getTitle(), novel.getDescription(), novel.getUpdatedAt());
    }

    static EntrySummary from(OriginalCharacter character) {
      return new EntrySummary(
          character.getSlug(), character.getTitle(), character.getDescription(),
          character.getUpdatedAt());
    }
  }

  /** @description Returns novel metadata and its ordered chapter directory. */
  public record NovelDetail(
      String slug,
      String title,
      String description,
      Instant updatedAt,
      List<ChapterSummary> chapters) {
    static NovelDetail from(Novel novel, List<NovelChapter> chapters) {
      return new NovelDetail(
          novel.getSlug(), novel.getTitle(), novel.getDescription(), novel.getUpdatedAt(),
          chapters.stream().map(ChapterSummary::from).toList());
    }
  }

  /** @description Returns a complete public original-character profile. */
  public record CharacterDetail(
      String slug,
      String title,
      String description,
      String content,
      Instant updatedAt) {
    static CharacterDetail from(OriginalCharacter character) {
      return new CharacterDetail(
          character.getSlug(), character.getTitle(), character.getDescription(),
          character.getContent(), character.getUpdatedAt());
    }
  }

  /** @description Returns one lightweight entry in a novel's chapter directory. */
  public record ChapterSummary(String slug, String title, Integer displayOrder) {
    static ChapterSummary from(NovelChapter chapter) {
      return new ChapterSummary(
          chapter.getSlug(), chapter.getTitle(), chapter.getDisplayOrder());
    }
  }

  /** @description Returns one complete chapter together with its parent novel identity. */
  public record ChapterDetail(
      String novelSlug,
      String novelTitle,
      String slug,
      String title,
      String content,
      Instant updatedAt) {
    static ChapterDetail from(Novel novel, NovelChapter chapter) {
      return new ChapterDetail(
          novel.getSlug(), novel.getTitle(), chapter.getSlug(), chapter.getTitle(),
          chapter.getContent(), chapter.getUpdatedAt());
    }
  }
}
