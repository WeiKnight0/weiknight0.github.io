package com.weiknight.site.note;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * @description Stores one database-backed note article and its publication metadata.
 */
@Entity
@Table(name = "note_articles")
public class NoteArticle {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(length = 160, unique = true)
  private String slug;
  @Column(length = 240)
  private String title;
  @Column(columnDefinition = "TEXT")
  private String summary;
  @Column(length = 1000)
  private String coverUrl;
  @Column(length = 1000)
  private String tags;
  @Column(length = 240)
  private String series;
  private Integer seriesOrder;
  @Enumerated(EnumType.STRING)
  private ArticleStatus status;
  @Enumerated(EnumType.STRING)
  private ArticleContentFormat contentFormat;
  @Column(columnDefinition = "TEXT")
  private String content;
  private Instant publishedAt;
  private Instant createdAt;
  private Instant updatedAt;

  /** @description Returns the persistent article identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the stable article URL identifier. */
  public String getSlug() {
    return slug;
  }

  /** @description Returns the article title. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the listing summary. */
  public String getSummary() {
    return summary;
  }

  /** @description Returns the optional cover resource URL. */
  public String getCoverUrl() {
    return coverUrl;
  }

  /** @description Returns the comma-separated persistence form of article tags. */
  public String getTags() {
    return tags;
  }

  /** @description Returns the optional series name. */
  public String getSeries() {
    return series;
  }

  /** @description Returns the optional article position within its series. */
  public Integer getSeriesOrder() {
    return seriesOrder;
  }

  /** @description Returns the current publication lifecycle state. */
  public ArticleStatus getStatus() {
    return status;
  }

  /** @description Returns the stored body representation. */
  public ArticleContentFormat getContentFormat() {
    return contentFormat;
  }

  /** @description Returns the complete article body. */
  public String getContent() {
    return content;
  }

  /** @description Returns the public publication time when assigned. */
  public Instant getPublishedAt() {
    return publishedAt;
  }

  /** @description Returns the last persisted change time. */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * @description Replaces every administrator-editable article field atomically.
   * @param slug Stable URL identifier.
   * @param title Article title.
   * @param summary Listing summary.
   * @param coverUrl Optional cover resource URL.
   * @param tags Comma-separated tags.
   * @param series Optional series name.
   * @param seriesOrder Optional article position inside the series.
   * @param status Publication lifecycle state.
   * @param contentFormat Body serialization format.
   * @param content Complete article body.
   * @param publishedAt Public publication time.
   */
  public void update(
      String slug,
      String title,
      String summary,
      String coverUrl,
      String tags,
      String series,
      Integer seriesOrder,
      ArticleStatus status,
      ArticleContentFormat contentFormat,
      String content,
      Instant publishedAt) {
    this.slug = slug;
    this.title = title;
    this.summary = summary;
    this.coverUrl = coverUrl;
    this.tags = tags;
    this.series = series;
    this.seriesOrder = seriesOrder;
    this.status = status;
    this.contentFormat = contentFormat;
    this.content = content;
    this.publishedAt = publishedAt;
  }

  /**
   * @description Reports whether the article body or cover still references an uploaded asset.
   * @param assetId Stable asset identifier searched in stored resource URLs.
   */
  public boolean referencesAsset(String assetId) {
    return content.contains("/note-assets/" + assetId + "/")
        || coverUrl != null && coverUrl.contains("/note-assets/" + assetId + "/");
  }

  /** @description Assigns creation and update timestamps before the first insert. */
  @PrePersist
  public void beforeInsert() {
    createdAt = Instant.now();
    updatedAt = createdAt;
  }

  /** @description Refreshes the update timestamp before an existing article changes. */
  @PreUpdate
  public void beforeUpdate() {
    updatedAt = Instant.now();
  }
}
