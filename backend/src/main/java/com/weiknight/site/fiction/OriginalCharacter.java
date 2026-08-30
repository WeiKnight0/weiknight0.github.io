package com.weiknight.site.fiction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** @description Stores one original-character profile and its Markdown body. */
@Entity
@Table(name = "fiction_characters")
public class OriginalCharacter {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false, length = 160, unique = true)
  private String slug;
  @Column(nullable = false, length = 240)
  private String title;
  @Column(nullable = false)
  private String description;
  @Column(nullable = false)
  private Integer displayOrder;
  @Column(nullable = false)
  private String content;
  @Column(nullable = false)
  private Instant updatedAt;

  protected OriginalCharacter() {
  }

  /**
   * @description Creates one character profile with a generated URL.
   * @param slug Initial public URL identifier.
   * @param title Public character name.
   * @param description Listing summary.
   * @param content Markdown profile body.
   * @param displayOrder Initial position in the character list.
   */
  public OriginalCharacter(
      String slug,
      String title,
      String description,
      String content,
      Integer displayOrder) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.content = content;
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }

  /** @description Returns the persistent character identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the public URL identifier. */
  public String getSlug() {
    return slug;
  }

  /** @description Returns the public character name. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the character summary shown in listings. */
  public String getDescription() {
    return description;
  }

  /** @description Returns the character's position in public listings. */
  public Integer getDisplayOrder() {
    return displayOrder;
  }

  /** @description Returns the Markdown character profile. */
  public String getContent() {
    return content;
  }

  /** @description Returns the most recent profile update time. */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * @description Replaces every editable character-profile field.
   * @param slug Public URL identifier.
   * @param title Public character name.
   * @param description Listing summary.
   * @param content Markdown profile body.
   * @param displayOrder Position in the character list.
   */
  public void update(
      String slug,
      String title,
      String description,
      String content,
      Integer displayOrder) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.content = content;
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }

  /** @description Assigns the normalized position produced by an administrative reorder. */
  public void reorder(int displayOrder) {
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }
}
