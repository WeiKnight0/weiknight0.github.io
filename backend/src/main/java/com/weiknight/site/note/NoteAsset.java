package com.weiknight.site.note;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * @description Stores metadata for one image persisted outside the application container.
 */
@Entity
@Table(name = "note_assets")
public class NoteAsset {
  @Id
  private UUID id;
  @Column(length = 100, unique = true)
  private String storedName;
  @Column(length = 500)
  private String originalName;
  @Column(length = 100)
  private String contentType;
  private long size;
  private Instant createdAt;

  protected NoteAsset() {
  }

  /**
   * @description Creates metadata whose identifier also determines the collision-free disk name.
   * @param id Stable asset identifier.
   * @param storedName Collision-free file name used on disk.
   * @param originalName Administrator-supplied display name.
   * @param contentType Validated image media type.
   * @param size Uploaded file size in bytes.
   */
  public NoteAsset(UUID id, String storedName, String originalName, String contentType, long size) {
    this.id = id;
    this.storedName = storedName;
    this.originalName = originalName;
    this.contentType = contentType;
    this.size = size;
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

  /** @description Returns the administrator-supplied display name. */
  public String getOriginalName() {
    return originalName;
  }

  /** @description Returns the validated image media type. */
  public String getContentType() {
    return contentType;
  }

  /** @description Returns the uploaded file size in bytes. */
  public long getSize() {
    return size;
  }

  /** @description Returns the asset creation time. */
  public Instant getCreatedAt() {
    return createdAt;
  }
}
