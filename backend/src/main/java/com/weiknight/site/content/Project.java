package com.weiknight.site.content;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "projects")
public class Project {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  private String slug;
  private String title;
  private String description;
  private Integer displayOrder;
  private String tags;
  private String repoUrl;
  public Long getId() { return id; }
  public String getSlug() { return slug; }
  public String getTitle() { return title; }
  public String getDescription() { return description; }
  public Integer getDisplayOrder() { return displayOrder; }
  public String getTags() { return tags; }
  public String getRepoUrl() { return repoUrl; }
  public void update(String slug, String title, String description, Integer displayOrder, String tags, String repoUrl) { this.slug = slug; this.title = title; this.description = description; this.displayOrder = displayOrder; this.tags = tags; this.repoUrl = repoUrl; }
}
