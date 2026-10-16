package com.weiknight.site.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.weiknight.site.fiction.Novel;
import com.weiknight.site.fiction.NovelRepository;
import com.weiknight.site.user.SiteUserRepository;
import com.weiknight.site.user.UserRole;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

class FictionAdminControllerTest {
  private NovelRepository novels;
  private NovelAdminController novelController;
  private MockHttpSession session;

  @BeforeEach
  void setUp() {
    novels = mock(NovelRepository.class);
    SiteUserRepository users = mock(SiteUserRepository.class);
    SessionAccess access = new SessionAccess(users);
    novelController = new NovelAdminController(novels, access);
    session = new MockHttpSession();
    access.signIn(session, 1L, true);
    when(users.existsByIdAndEnabledTrueAndRole(1L, UserRole.ADMIN)).thenReturn(true);
  }

  @Test
  void createsNovelWithoutChapterContent() {
    when(novels.save(any(Novel.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(novels.findAllByOrderByDisplayOrderAscTitleAsc()).thenReturn(List.of());

    NovelAdminController.NovelResponse response = novelController.create(
        new NovelAdminController.NovelInput("Novel Two", "The next novel"),
        session);

    assertEquals("novel-two", response.slug());
    assertEquals("Novel Two", response.title());
    assertEquals(1, response.displayOrder());
  }

  @Test
  void addsSuffixWhenGeneratedNovelSlugConflicts() {
    when(novels.existsBySlug("novel-two")).thenReturn(true);
    when(novels.findAllByOrderByDisplayOrderAscTitleAsc()).thenReturn(List.of());
    when(novels.save(any(Novel.class))).thenAnswer(invocation -> invocation.getArgument(0));

    NovelAdminController.NovelResponse response = novelController.create(
        new NovelAdminController.NovelInput("Novel Two", "Another novel"),
        session);

    assertEquals("novel-two-2", response.slug());
  }

  @Test
  void updatesNovelSlugWhenAvailable() {
    Novel novel = new Novel("old-url", "Old title", "Description", 1);
    when(novels.findById(1L)).thenReturn(Optional.of(novel));
    when(novels.save(novel)).thenReturn(novel);

    NovelAdminController.NovelResponse response = novelController.update(
        1L,
        new NovelAdminController.NovelUpdateInput("new-url", "New title", "Description"),
        session);

    assertEquals("new-url", response.slug());
    assertEquals("New title", response.title());
  }

  @Test
  void rejectsOccupiedNovelSlug() {
    Novel novel = new Novel("old-url", "Title", "Description", 1);
    when(novels.findById(1L)).thenReturn(Optional.of(novel));
    when(novels.existsBySlug("occupied-url")).thenReturn(true);

    assertThrows(ResourceConflictException.class, () -> novelController.update(
        1L,
        new NovelAdminController.NovelUpdateInput(
            "occupied-url", "Title", "Description"),
        session));
  }

}
