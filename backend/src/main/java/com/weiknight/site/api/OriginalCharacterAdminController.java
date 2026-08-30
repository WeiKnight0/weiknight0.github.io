package com.weiknight.site.api;

import com.weiknight.site.fiction.OriginalCharacter;
import com.weiknight.site.fiction.OriginalCharacterRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** @description Manages original-character profiles and their explicit reading order. */
@RestController
@RequestMapping("/api/v1/admin/fiction/oc")
public class OriginalCharacterAdminController {
  private final OriginalCharacterRepository characters;
  private final SessionAccess access;

  OriginalCharacterAdminController(
      OriginalCharacterRepository characters,
      SessionAccess access) {
    this.characters = characters;
    this.access = access;
  }

  /** @description Lists all original characters in their current reading order. */
  @GetMapping
  public List<CharacterResponse> list(HttpSession session) {
    access.requireAdmin(session);
    return responses(characters.findAllByOrderByDisplayOrderAscTitleAsc());
  }

  /** @description Loads one complete character profile for editing. */
  @GetMapping("/{id}")
  public CharacterResponse get(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    return CharacterResponse.from(find(id));
  }

  /** @description Creates one original-character profile at the end of the current order. */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CharacterResponse create(
      @Valid @RequestBody CharacterInput input,
      HttpSession session) {
    access.requireAdmin(session);
    return CharacterResponse.from(characters.save(new OriginalCharacter(
        SlugGenerator.unique(input.title(), "character", characters::existsBySlug),
        input.title().trim(),
        input.description().trim(),
        input.content(),
        nextOrder())));
  }

  /** @description Replaces one character's editable profile fields. */
  @PutMapping("/{id}")
  public CharacterResponse update(
      @PathVariable Long id,
      @Valid @RequestBody CharacterUpdateInput input,
      HttpSession session) {
    access.requireAdmin(session);
    OriginalCharacter character = find(id);
    if (!character.getSlug().equals(input.slug()) && characters.existsBySlug(input.slug())) {
      throw new ResourceConflictException("This OC URL is already in use");
    }
    character.update(
        input.slug(), input.title().trim(), input.description().trim(),
        input.content(), character.getDisplayOrder());
    return CharacterResponse.from(characters.save(character));
  }

  /** @description Permanently removes one character profile. */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void delete(@PathVariable Long id, HttpSession session) {
    access.requireAdmin(session);
    characters.delete(find(id));
    characters.flush();
    normalize(characters.findAllByOrderByDisplayOrderAscTitleAsc());
  }

  /** @description Moves one character by exactly one position and normalizes all positions. */
  @PutMapping("/{id}/position")
  @Transactional
  public List<CharacterResponse> move(
      @PathVariable Long id,
      @Valid @RequestBody PositionInput input,
      HttpSession session) {
    access.requireAdmin(session);
    List<OriginalCharacter> ordered = characters.findAllByOrderByDisplayOrderAscTitleAsc();
    int current = IntStream.range(0, ordered.size())
        .filter(index -> ordered.get(index).getId().equals(id))
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("Original character not found"));
    int target = current + (input.direction().equals("up") ? -1 : 1);
    if (target < 0 || target >= ordered.size()) {
      return responses(ordered);
    }
    Collections.swap(ordered, current, target);
    return responses(normalize(ordered));
  }

  private OriginalCharacter find(Long id) {
    return characters.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Original character not found"));
  }

  private List<CharacterResponse> responses(List<OriginalCharacter> ordered) {
    return ordered.stream().map(CharacterResponse::from).toList();
  }

  private List<OriginalCharacter> normalize(List<OriginalCharacter> ordered) {
    IntStream.range(0, ordered.size())
        .forEach(index -> ordered.get(index).reorder(index + 1));
    return characters.saveAll(ordered);
  }

  private int nextOrder() {
    return characters.findAllByOrderByDisplayOrderAscTitleAsc().stream()
        .mapToInt(OriginalCharacter::getDisplayOrder)
        .max()
        .orElse(0) + 1;
  }

  /** @description Defines the editable fields of an original-character profile. */
  public record CharacterInput(
      @NotBlank @Size(max = 240) String title,
      @NotBlank @Size(max = 2000) String description,
      @NotBlank String content) {
  }

  /** @description Defines editable character fields including the public URL. */
  public record CharacterUpdateInput(
      @NotBlank @Size(max = 160) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
      @NotBlank @Size(max = 240) String title,
      @NotBlank @Size(max = 2000) String description,
      @NotBlank String content) {
  }

  /** @description Defines an accepted one-step ordering direction. */
  public record PositionInput(
      @NotBlank @Pattern(regexp = "up|down") String direction) {
  }

  /** @description Returns a complete editable original-character profile. */
  public record CharacterResponse(
      Long id,
      String slug,
      String title,
      String description,
      String content,
      Integer displayOrder,
      Instant updatedAt) {
    static CharacterResponse from(OriginalCharacter character) {
      return new CharacterResponse(
          character.getId(), character.getSlug(), character.getTitle(),
          character.getDescription(), character.getContent(), character.getDisplayOrder(),
          character.getUpdatedAt());
    }
  }
}
