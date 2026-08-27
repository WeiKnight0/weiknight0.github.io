package com.weiknight.site.fiction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * @description Stores one administrator-editable novel or original-character file.
 */
@Entity
@Table(name = "fiction_entries")
public class FictionEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Enumerated(EnumType.STRING)
  @Column(name = "entry_type", length = 20)
  private FictionEntryType type;
  @Column(length = 160)
  private String slug;
  @Column(length = 240)
  private String title;
  private String description;
  private Integer displayOrder;
  private String content;
  private boolean published;
  private Instant updatedAt;

  protected FictionEntry() {
  }

  /**
   * @description Creates an empty entry whose editable fields are populated through update.
   * @param type Fiction section that owns the new entry.
   */
  public FictionEntry(FictionEntryType type) {
    this.type = type;
  }

  /** @description Returns the persistent entry identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the owning fiction section. */
  public FictionEntryType getType() {
    return type;
  }

  /** @description Returns the stable public URL identifier. */
  public String getSlug() {
    return slug;
  }

  /** @description Returns the public entry title. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the listing summary. */
  public String getDescription() {
    return description;
  }

  /** @description Returns the ordering value within the fiction section. */
  public Integer getDisplayOrder() {
    return displayOrder;
  }

  /** @description Returns the Markdown body. */
  public String getContent() {
    return content;
  }

  /** @description Reports whether visitors may read the entry. */
  public boolean isPublished() {
    return published;
  }

  /** @description Returns the most recent administrative update time. */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * @description Replaces every administrator-editable field while preserving identity and type.
   * @param slug Stable public URL identifier.
   * @param title Public display title.
   * @param description Listing summary.
   * @param displayOrder Ordering value within the section.
   * @param content Markdown body.
   * @param published Whether visitors may read the entry.
   */
  public void update(
      String slug,
      String title,
      String description,
      Integer displayOrder,
      String content,
      boolean published) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.displayOrder = displayOrder;
    this.content = content;
    this.published = published;
    this.updatedAt = Instant.now();
  }

  /**
   * @description Assigns the normalized position produced by an administrative reorder operation.
   * @param displayOrder One-based position within the owning fiction section.
   */
  public void reorder(int displayOrder) {
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }
}
