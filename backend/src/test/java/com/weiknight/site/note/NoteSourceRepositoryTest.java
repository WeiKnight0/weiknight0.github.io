package com.weiknight.site.note;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.weiknight.site.api.ResourceNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class NoteSourceRepositoryTest {
  @TempDir
  Path root;

  @Test
  void readsRootDirectoryAndArticleSources() throws IOException {
    Files.writeString(root.resolve("index.md"), "root");
    Files.createDirectories(root.resolve("subject"));
    Files.writeString(root.resolve("subject/index.md"), "subject");
    Files.writeString(root.resolve("subject/article.md"), "article");
    NoteSourceRepository repository = new NoteSourceRepository(root.toString());

    assertEquals("index.md", repository.read("").path());
    assertEquals("subject/index.md", repository.read("subject").path());
    assertEquals("article", repository.read("subject/article").markdown());
  }

  @Test
  void rejectsMissingSources() throws IOException {
    Files.writeString(root.resolve("index.md"), "root");

    assertThrows(
        ResourceNotFoundException.class,
        () -> new NoteSourceRepository(root.toString()).read("missing"));
  }

  @Test
  void readsNestedSourcesUsingTheirFileTreePath() throws IOException {
    Path source = root.resolve(
        "Data-Structures-and-Algorithms/algorithms/graph/shortest-path.md");
    Files.createDirectories(source.getParent());
    Files.writeString(source, "shortest path");

    NoteSourceRepository repository = new NoteSourceRepository(root.toString());

    assertEquals(
        "shortest path",
        repository.read("Data-Structures-and-Algorithms/algorithms/graph/shortest-path").markdown());
  }

}
