package com.weiknight.site.user;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "site_users") public class SiteUser {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
 @Column(nullable = false, unique = true) private String username;
 @JsonIgnore @Column(name = "password_hash", nullable = false) private String passwordHash;
 @Column(insertable = false, updatable = false) private Instant createdAt;
 public Long getId(){return id;} public String getUsername(){return username;} public Instant getCreatedAt(){return createdAt;}
 public void create(String username,String passwordHash){this.username=username;this.passwordHash=passwordHash;}
 public String passwordHash(){return passwordHash;}
}
