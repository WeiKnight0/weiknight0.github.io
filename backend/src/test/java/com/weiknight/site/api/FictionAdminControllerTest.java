package com.weiknight.site.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weiknight.site.fiction.FictionEntry;
import com.weiknight.site.fiction.FictionEntryRepository;
import com.weiknight.site.fiction.FictionEntryType;
import com.weiknight.site.user.SiteUserRepository;
import com.weiknight.site.user.UserRole;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

class FictionAdminControllerTest {
  private FictionEntryRepository entries;
  private FictionAdminController controller;
  private MockHttpSession session;

  @BeforeEach
  void setUp() {
    entries = mock(FictionEntryRepository.class);
    SiteUserRepository users = mock(SiteUserRepository.class);
    SessionAccess access = new SessionAccess(users);
    controller = new FictionAdminController(entries, access);
    session = new MockHttpSession();
    access.signIn(session, 1L, true);
    when(users.existsByIdAndEnabledTrueAndRole(1L, UserRole.ADMIN)).thenReturn(true);
  }

  @Test
  void createsPublishedNovelThroughSharedEditor() {
    when(entries.save(any(FictionEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

    FictionEntry entry = controller.create("novels", new FictionAdminController.EntryInput(
        "novel-two",
        "Novel Two",
        "The next novel",
        2,
        "Story body",
        true), session);

    assertEquals(FictionEntryType.NOVEL, entry.getType());
    assertEquals("novel-two", entry.getSlug());
    assertEquals("Story body", entry.getContent());
  }

  @Test
  void preventsCrossSectionIdentifierAccess() {
    FictionEntry character = new FictionEntry(FictionEntryType.CHARACTER);
    character.update("wolf", "Wolf", "Character", 1, "Profile", true);
    when(entries.findById(7L)).thenReturn(Optional.of(character));

    assertThrows(ResourceNotFoundException.class, () -> controller.get("novels", 7L, session));
  }

  @Test
  void movesCharacterUpAndNormalizesEveryPosition() {
    FictionEntry first = mock(FictionEntry.class);
    FictionEntry second = mock(FictionEntry.class);
    FictionEntry third = mock(FictionEntry.class);
    when(first.getId()).thenReturn(1L);
    when(second.getId()).thenReturn(2L);
    when(third.getId()).thenReturn(3L);
    when(entries.findAllByTypeOrderByDisplayOrderAscTitleAsc(FictionEntryType.CHARACTER))
        .thenReturn(new ArrayList<>(List.of(first, second, third)));
    when(entries.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

    controller.move(
        "oc",
        2L,
        new FictionAdminController.PositionInput("up"),
        session);

    verify(second).reorder(1);
    verify(first).reorder(2);
    verify(third).reorder(3);
  }
}
