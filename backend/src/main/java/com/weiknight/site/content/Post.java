package com.weiknight.site.content;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * @description Stores the editable metadata and Markdown body of one public blog.
 */
@Entity
@Table(name = "posts")
public class Post {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String slug;
  private String title;
  private String description;
  private Instant publishedAt;
  private String tags;
  private String content;

  /** @description Returns the persistent blog identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the stable URL identifier. */
  public String getSlug() {
    return slug;
  }

  /** @description Returns the public blog title. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the summary shown in blog listings. */
  public String getDescription() {
    return description;
  }

  /** @description Returns the configured publication time. */
  public Instant getPublishedAt() {
    return publishedAt;
  }

  /** @description Returns the comma-separated persistence form of the tags. */
  public String getTags() {
    return tags;
  }

  /** @description Returns the Markdown article body. */
  public String getContent() {
    return content;
  }

  /**
   * @description Replaces every administrator-editable blog field as one operation.
   * @param slug Stable URL identifier.
   * @param title Public blog title.
   * @param description Listing summary.
   * @param publishedAt Publication time.
   * @param tags Comma-separated tags.
   * @param content Markdown article body.
   */
  public void update(
      String slug,
      String title,
      String description,
      Instant publishedAt,
      String tags,
      String content) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.publishedAt = publishedAt;
    this.tags = tags;
    this.content = content;
  }
}
