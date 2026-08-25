package com.weiknight.site.api;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @description Edits the Markdown note tree and signals MkDocs only after file operations succeed.
 */
@RestController
@RequestMapping("/api/v1")
public class NotesController {
  private static final Path ROOT = Path.of("/workspace/notes/docs").normalize();
  private static final Path PUBLISH_MARKER = ROOT.getParent().resolve(".publish");
  private final SessionAccess access;

  NotesController(SessionAccess access) {
    this.access = access;
  }

  /**
   * @description Authorizes Nginx access to the protected MkDocs output.
   * @param session Session that must represent a member or administrator.
   * @throws AccessDeniedException when the session is anonymous.
   */
  @GetMapping("/session")
  public void session(HttpSession session) {
    access.requireMember(session);
  }

  /**
   * @description Lists editable Markdown files and separately managed image resources.
   * @param session Session that must represent the administrator.
   * @throws IOException when the mounted note tree cannot be traversed.
   */
  @GetMapping("/admin/notes/tree")
  public NoteTree tree(HttpSession session) throws IOException {
    access.requireAdmin(session);
    try (Stream<Path> files = Files.walk(ROOT)) {
      List<String> paths = files.filter(Files::isRegularFile)
          .map(ROOT::relativize)
          .map(Path::toString)
          .sorted()
          .toList();
      return new NoteTree(
          paths.stream().filter(this::isMarkdown).toList(),
          paths.stream().filter(this::isImage).toList());
    }
  }

  /**
   * @description Reads one Markdown file selected in the note editor.
   * @param path Relative Markdown path inside the mounted note tree.
   * @param session Session that must represent the administrator.
   * @throws IOException when the selected file cannot be read.
   */
  @GetMapping("/admin/notes/file")
  public String read(@RequestParam String path, HttpSession session) throws IOException {
    access.requireAdmin(session);
    return Files.readString(resolveMarkdown(path));
  }

  /**
   * @description Writes one Markdown file and requests a new MkDocs build.
   * @param input Relative path and complete replacement content.
   * @param session Session that must represent the administrator.
   * @throws IOException when the file or publish marker cannot be written.
   * @throws InterruptedException when a configured Git command is interrupted.
   */
  @PutMapping("/admin/notes/file")
  public void write(@Valid @RequestBody FileInput input, HttpSession session)
      throws IOException, InterruptedException {
    access.requireAdmin(session);
    Path target = resolveMarkdown(input.path());
    Files.createDirectories(target.getParent());
    Files.writeString(target, input.content(), StandardCharsets.UTF_8);
    publish();
  }

  /**
   * @description Moves a Markdown file within the note tree and requests a new MkDocs build.
   * @param input Existing and replacement relative Markdown paths.
   * @param session Session that must represent the administrator.
   * @throws IOException when the move or publish marker cannot be completed.
   * @throws InterruptedException when a configured Git command is interrupted.
   */
  @PostMapping("/admin/notes/move")
  public void move(@Valid @RequestBody MoveInput input, HttpSession session)
      throws IOException, InterruptedException {
    access.requireAdmin(session);
    Path destination = resolveMarkdown(input.to());
    Files.createDirectories(destination.getParent());
    Files.move(resolveMarkdown(input.from()), destination);
    publish();
  }

  /**
   * @description Reports whether MkDocs still has a pending publish marker.
   * @param session Session that must represent the administrator.
   */
  @GetMapping("/admin/notes/status")
  public Map<String, Boolean> status(HttpSession session) {
    access.requireAdmin(session);
    return Map.of("publishing", Files.exists(PUBLISH_MARKER));
  }

  /**
   * @description Deletes one Markdown file and requests a new MkDocs build.
   * @param path Relative Markdown path selected in the note editor.
   * @param session Session that must represent the administrator.
   * @throws IOException when the file or publish marker cannot be removed or written.
   * @throws InterruptedException when a configured Git command is interrupted.
   */
  @DeleteMapping("/admin/notes/file")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@RequestParam String path, HttpSession session)
      throws IOException, InterruptedException {
    access.requireAdmin(session);
    Files.delete(resolveMarkdown(path));
    publish();
  }

  /**
   * @description Streams one image resource to an authenticated administrator for preview.
   * @param path Relative image path inside the mounted note tree.
   * @param session Session that must represent the administrator.
   * @throws ResourceNotFoundException when the image no longer exists.
   */
  @GetMapping("/admin/notes/asset")
  public ResponseEntity<Resource> asset(@RequestParam String path, HttpSession session) {
    access.requireAdmin(session);
    Path target = resolveImage(path);
    if (!Files.isRegularFile(target)) {
      throw new ResourceNotFoundException("Image not found");
    }
    return ResponseEntity.ok()
        .contentType(imageMediaType(target))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        .body(new FileSystemResource(target));
  }

  /**
   * @description Uploads a new image resource and requests a new MkDocs build.
   * @param path Relative destination path including a supported image extension.
   * @param file Image body supplied by the administrator.
   * @param session Session that must represent the administrator.
   * @throws IOException when the image or publish marker cannot be written.
   * @throws InterruptedException when a configured Git command is interrupted.
   */
  @PostMapping(value = "/admin/notes/asset", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public void uploadAsset(
      @RequestParam String path,
      @RequestParam MultipartFile file,
      HttpSession session) throws IOException, InterruptedException {
    access.requireAdmin(session);
    if (file.isEmpty()) {
      throw new IllegalArgumentException("Image file is empty");
    }
    Path target = resolveImage(path);
    Files.createDirectories(target.getParent());
    Files.copy(file.getInputStream(), target);
    publish();
  }

  /**
   * @description Deletes one image resource and requests a new MkDocs build.
   * @param path Relative image path selected by the administrator.
   * @param session Session that must represent the administrator.
   * @throws IOException when the image or publish marker cannot be removed or written.
   * @throws InterruptedException when a configured Git command is interrupted.
   */
  @DeleteMapping("/admin/notes/asset")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteAsset(@RequestParam String path, HttpSession session)
      throws IOException, InterruptedException {
    access.requireAdmin(session);
    Files.delete(resolveImage(path));
    publish();
  }

  private Path resolveMarkdown(String value) {
    Path path = resolveInsideRoot(value);
    if (isMarkdown(path.toString())) {
      return path;
    }
    throw new IllegalArgumentException("Only Markdown files can be edited");
  }

  private Path resolveImage(String value) {
    Path path = resolveInsideRoot(value);
    if (isImage(path.toString())) {
      return path;
    }
    throw new IllegalArgumentException("Unsupported image extension");
  }

  private Path resolveInsideRoot(String value) {
    if (value.isBlank()) {
      throw new IllegalArgumentException("File path is required");
    }
    Path path = ROOT.resolve(value).normalize();
    if (path.startsWith(ROOT)) {
      return path;
    }
    throw new IllegalArgumentException("File path must remain inside the note tree");
  }

  private boolean isMarkdown(String path) {
    return path.toLowerCase(Locale.ROOT).endsWith(".md");
  }

  private boolean isImage(String path) {
    return switch (extension(path)) {
      case ".png", ".jpg", ".jpeg", ".gif", ".webp" -> true;
      default -> false;
    };
  }

  private MediaType imageMediaType(Path path) {
    return switch (extension(path.toString())) {
      case ".png" -> MediaType.IMAGE_PNG;
      case ".jpg", ".jpeg" -> MediaType.IMAGE_JPEG;
      case ".gif" -> MediaType.IMAGE_GIF;
      case ".webp" -> MediaType.parseMediaType("image/webp");
      default -> throw new IllegalArgumentException("Unsupported image extension");
    };
  }

  private String extension(String path) {
    String normalized = path.toLowerCase(Locale.ROOT);
    int separator = normalized.lastIndexOf('.');
    return separator < 0 ? "" : normalized.substring(separator);
  }

  private void publish() throws IOException, InterruptedException {
    commitToNoteRepository();
    Files.writeString(PUBLISH_MARKER, "publish");
  }

  private void commitToNoteRepository() throws IOException, InterruptedException {
    Path repository = ROOT.getParent();
    if (!Files.isDirectory(repository.resolve(".git"))) {
      return;
    }
    requireSuccessfulGit(repository, "add", "docs", "mkdocs.yml");
    int diffExitCode = runGit(repository, "diff", "--cached", "--quiet");
    if (diffExitCode == 0) {
      return;
    }
    if (diffExitCode != 1) {
      throw new IOException("git diff failed with exit code " + diffExitCode);
    }
    requireSuccessfulGit(repository, "commit", "-m", "Update notes from admin");
  }

  private void requireSuccessfulGit(Path repository, String... arguments)
      throws IOException, InterruptedException {
    int exitCode = runGit(repository, arguments);
    if (exitCode != 0) {
      throw new IOException("git command failed with exit code " + exitCode);
    }
  }

  private int runGit(Path repository, String... arguments) throws IOException, InterruptedException {
    String[] command = Stream.concat(
            Stream.of("git", "-C", repository.toString()),
            Stream.of(arguments))
        .toArray(String[]::new);
    return new ProcessBuilder(command)
        .redirectErrorStream(true)
        .redirectOutput(ProcessBuilder.Redirect.INHERIT)
        .start()
        .waitFor();
  }

  /** @description Complete Markdown file replacement submitted by the note editor. */
  public record FileInput(@NotBlank String path, @NotBlank String content) {
  }

  /** @description Existing and destination paths submitted for a note move. */
  public record MoveInput(@NotBlank String from, @NotBlank String to) {
  }

  /** @description Editable Markdown paths and separately managed image paths. */
  public record NoteTree(List<String> notes, List<String> images) {
  }
}
