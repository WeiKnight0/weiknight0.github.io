package com.weiknight.site.api;

import com.weiknight.site.note.NoteSourceRepository;
import com.weiknight.site.note.NoteSourceRepository.NoteSource;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Exposes authenticated, read-only Markdown sources to the independent Notes reader.
 */
@Validated
@RestController
@RequestMapping("/api/v1/notes")
public class NotesController {
  private final NoteSourceRepository notes;
  private final SessionAccess access;

  NotesController(NoteSourceRepository notes, SessionAccess access) {
    this.notes = notes;
    this.access = access;
  }

  /**
   * @description Returns the Markdown source selected by a public Notes URL.
   * @param path Extension-free file or directory path below the note root.
   * @param session Session that must represent a member or administrator.
   * @throws AccessDeniedException when the session is anonymous.
   * @throws ResourceNotFoundException when the requested Markdown file does not exist.
   */
  @GetMapping("/source")
  public NoteSource source(
      @RequestParam(defaultValue = "")
      @Pattern(regexp = "(?:[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*)?") String path,
      HttpSession session) {
    access.requireMember(session);
    return notes.read(path);
  }

  /**
   * @description Confirms access and file existence before Nginx serves the Notes reader.
   * @param path Extension-free file or directory path below the note root.
   * @param session Session that must represent a member or administrator.
   * @throws AccessDeniedException when the session is anonymous.
   * @throws ResourceNotFoundException when the requested Markdown file does not exist.
   */
  @GetMapping("/page")
  public ResponseEntity<Void> page(
      @RequestParam(defaultValue = "")
      @Pattern(regexp = "(?:[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*)?") String path,
      HttpSession session) {
    access.requireMember(session);
    notes.read(path);
    return ResponseEntity.ok()
        .header("X-Accel-Redirect", "/internal/notes-reader/")
        .build();
  }
}
