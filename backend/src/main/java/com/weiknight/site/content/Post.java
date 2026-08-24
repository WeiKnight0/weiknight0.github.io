package com.weiknight.site.content;

import java.time.Instant;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "posts")
public class Post {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  private String slug;
  private String title;
  private String description;
  private Instant publishedAt;
  private String tags;
  public Long getId() { return id; }
  public String getSlug() { return slug; }
  public String getTitle() { return title; }
  public String getDescription() { return description; }
  public Instant getPublishedAt() { return publishedAt; }
  public String getTags() { return tags; }
  public void update(String slug, String title, String description, Instant publishedAt, String tags) { this.slug = slug; this.title = title; this.description = description; this.publishedAt = publishedAt; this.tags = tags; }
}
