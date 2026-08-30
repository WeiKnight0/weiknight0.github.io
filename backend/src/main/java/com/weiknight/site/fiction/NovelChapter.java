package com.weiknight.site.fiction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** @description Stores one ordered Markdown chapter belonging to a novel. */
@Entity
@Table(name = "fiction_novel_chapters")
public class NovelChapter {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false)
  private Long novelId;
  @Column(nullable = false, length = 160)
  private String slug;
  @Column(nullable = false, length = 240)
  private String title;
  @Column(nullable = false)
  private String content;
  @Column(nullable = false)
  private Integer displayOrder;
  @Column(nullable = false)
  private Instant updatedAt;

  protected NovelChapter() {
  }

  /**
   * @description Creates a chapter with a stable generated URL at the end of its novel.
   * @param novelId Parent novel identifier.
   * @param slug Generated chapter URL segment.
   * @param title Public chapter title.
   * @param content Markdown chapter body.
   * @param displayOrder Initial position within the novel.
   */
  public NovelChapter(
      Long novelId,
      String slug,
      String title,
      String content,
      Integer displayOrder) {
    this.novelId = novelId;
    this.slug = slug;
    this.title = title;
    this.content = content;
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }

  /** @description Returns the persistent chapter identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the parent novel identifier. */
  public Long getNovelId() {
    return novelId;
  }

  /** @description Returns the chapter's URL segment. */
  public String getSlug() {
    return slug;
  }

  /** @description Returns the chapter title. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the Markdown chapter body. */
  public String getContent() {
    return content;
  }

  /** @description Returns the chapter position within its novel. */
  public Integer getDisplayOrder() {
    return displayOrder;
  }

  /** @description Returns the most recent chapter update time. */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * @description Replaces every editable chapter field while preserving its parent novel.
   * @param title Public chapter title.
   * @param content Markdown chapter body.
   */
  public void update(String title, String content) {
    this.title = title;
    this.content = content;
    this.updatedAt = Instant.now();
  }

  /** @description Assigns the normalized position produced by an administrative reorder. */
  public void reorder(int displayOrder) {
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }
}
