package com.weiknight.site.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @description Provides display-ordered access to persisted portfolio projects.
 */
public interface ProjectRepository extends JpaRepository<Project, Long> {
  /** @description Returns projects in their configured display order. */
  List<Project> findAllByOrderByDisplayOrderAsc();
}
