package com.weiknight.site.note;

import com.weiknight.site.api.ResourceNotFoundException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

/**
 * @description Reads the host-mounted Markdown tree without owning any editing behavior.
 */
@Repository
public class NoteSourceRepository {
  private final Path root;

  /**
   * @description Configures the read-only Markdown source root.
   * @param root Host-mounted directory containing note files and images.
   */
  public NoteSourceRepository(@Value("${site.notes-root}") String root) {
    this.root = Path.of(root).toAbsolutePath().normalize();
    if (!Files.isDirectory(this.root)) {
      throw new IllegalStateException("Note source directory does not exist: " + this.root);
    }
  }

  /**
   * @description Reads the Markdown file represented by one public note path.
   * @param path Extension-free public path relative to the note root.
   * @throws ResourceNotFoundException when neither a note file nor a directory index exists.
   * @throws UncheckedIOException when the selected Markdown file cannot be read.
   */
  public NoteSource read(String path) {
    Path source = path.isBlank() ? root.resolve("index.md") : root.resolve(path + ".md");
    if (!Files.isRegularFile(source) && !path.isBlank()) {
      source = root.resolve(path).resolve("index.md");
    }
    if (!Files.isRegularFile(source)) {
      throw new ResourceNotFoundException("Note not found");
    }
    try {
      return new NoteSource(
          root.relativize(source).toString().replace('\\', '/'),
          Files.readString(source));
    } catch (IOException exception) {
      throw new UncheckedIOException("Cannot read note " + source, exception);
    }
  }

  /** @description Raw Markdown source and its resolved file-tree path. */
  public record NoteSource(String path, String markdown) { }
}
