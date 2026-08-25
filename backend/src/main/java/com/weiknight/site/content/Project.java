package com.weiknight.site.content;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * @description Stores one project shown in the public portfolio.
 */
@Entity
@Table(name = "projects")
public class Project {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String slug;
  private String title;
  private String description;
  private Integer displayOrder;
  private String tags;
  private String repoUrl;

  /** @description Returns the persistent project identifier. */
  public Long getId() {
    return id;
  }

  /** @description Returns the stable project URL identifier. */
  public String getSlug() {
    return slug;
  }

  /** @description Returns the public project title. */
  public String getTitle() {
    return title;
  }

  /** @description Returns the public project summary. */
  public String getDescription() {
    return description;
  }

  /** @description Returns the configured project ordering value. */
  public Integer getDisplayOrder() {
    return displayOrder;
  }

  /** @description Returns the comma-separated persistence form of the tags. */
  public String getTags() {
    return tags;
  }

  /** @description Returns the optional source repository URL. */
  public String getRepoUrl() {
    return repoUrl;
  }
}
