package com.weiknight.site.fiction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * @description Stores persistent metadata for one uploaded commission or manuscript image.
 */
@Entity
@Table(name = "commission_assets")
public class CommissionAsset {
  @Id
  private UUID id;
  @Column(length = 100, unique = true)
  private String storedName;
  @Column(length = 500)
  private String originalName;
  @Column(length = 240)
  private String title;
  @Column(length = 100)
  private String contentType;
  private long size;
  private Integer displayOrder;
  private Instant createdAt;

  protected CommissionAsset() {
  }

  /**
   * @description Creates metadata for a validated uploaded commission image.
   * @param id Stable asset identifier.
   * @param storedName Collision-free disk file name.
   * @param originalName Original uploaded file name.
   * @param title Public gallery title.
   * @param contentType Validated image media type.
   * @param size Uploaded file size in bytes.
   * @param displayOrder Ordering value in the gallery.
   */
  public CommissionAsset(
      UUID id,
      String storedName,
      String originalName,
      String title,
      String contentType,
      long size,
      Integer displayOrder) {
    this.id = id;
    this.storedName = storedName;
    this.originalName = originalName;
    this.title = title;
    this.contentType = contentType;
    this.size = size;
    this.displayOrder = displayOrder;
    this.createdAt = Instant.now();
  }

  /** @description Returns the stable asset identifier. */
  public UUID getId() {
    return id;
  }

  /** @description Returns the collision-free disk file name. */
  public String getStoredName() {
    return storedName;
  }

  /** @description Returns the original uploaded file name. */
  public String getOriginalName() {
    return originalName;
  }

  /** @description Returns the public gallery title. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the validated image media type. */
  public String getContentType() {
    return contentType;
  }

  /** @description Returns the uploaded file size in bytes. */
  public long getSize() {
    return size;
  }

  /** @description Returns the gallery ordering value. */
  public Integer getDisplayOrder() {
    return displayOrder;
  }

  /** @description Returns the upload time. */
  public Instant getCreatedAt() {
    return createdAt;
  }

  /**
   * @description Replaces public gallery metadata without rewriting the image file.
   * @param title Public gallery title.
   * @param displayOrder Ordering value in the gallery.
   */
  public void update(String title, Integer displayOrder) {
    this.title = title;
    this.displayOrder = displayOrder;
  }
}
