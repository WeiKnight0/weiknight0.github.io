package com.weiknight.site.fiction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** @description Stores one novel's identity and listing metadata. */
@Entity
@Table(name = "fiction_novels")
public class Novel {
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
  private Instant updatedAt;

  protected Novel() {
  }

  /**
   * @description Creates one novel with a generated URL and its initial list position.
   * @param slug Initial public URL identifier.
   * @param title Public display title.
   * @param description Listing summary.
   * @param displayOrder Initial position in the novel list.
   */
  public Novel(String slug, String title, String description, Integer displayOrder) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }

  /** @description Returns the persistent novel identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the public URL identifier. */
  public String getSlug() {
    return slug;
  }

  /** @description Returns the public novel title. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the novel summary shown in listings. */
  public String getDescription() {
    return description;
  }

  /** @description Returns the novel's position in public listings. */
  public Integer getDisplayOrder() {
    return displayOrder;
  }

  /** @description Returns the most recent metadata update time. */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * @description Replaces the editable novel metadata without storing chapter content.
   * @param slug Public URL identifier.
   * @param title Public display title.
   * @param description Listing summary.
   */
  public void update(String slug, String title, String description) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.updatedAt = Instant.now();
  }

  /** @description Assigns the normalized position produced by an administrative reorder. */
  public void reorder(int displayOrder) {
    this.displayOrder = displayOrder;
    this.updatedAt = Instant.now();
  }
}
