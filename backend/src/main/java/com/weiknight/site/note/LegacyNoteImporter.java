package com.weiknight.site.note;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * @description Imports the existing Markdown tree once without overwriting articles later edited online.
 */
@Component
public class LegacyNoteImporter implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(LegacyNoteImporter.class);
  private static final Pattern FRONT_MATTER = Pattern.compile(
      "\\A---\\R(.*?)\\R---\\R?(.*)\\z",
      Pattern.DOTALL);
  private static final Pattern IMAGE = Pattern.compile("(!\\[[^]]*]\\()([^\\s)]+)([^)]*\\))");
  private static final Pattern LINK = Pattern.compile("(?<!!)(\\[[^]]*]\\()([^\\s)]+)([^)]*\\))");
  private static final Pattern LEADING_NUMBER = Pattern.compile("^(\\d+)(?:[-_.].*)?$");
  private static final Set<String> EXTRA_PAGES = Set.of("about.md", "privacy.md");
  private final NoteArticleRepository articles;
  private final Path root;

  LegacyNoteImporter(
      NoteArticleRepository articles,
      @Value("${site.legacy-notes-root}") String root) {
    this.articles = articles;
    this.root = Path.of(root).toAbsolutePath().normalize();
  }

  /**
   * @description Imports each previously unseen Markdown file as a published article at application startup.
   * @param arguments Spring application arguments; they do not alter import behavior.
   * @throws IOException when the configured legacy tree cannot be read.
   */
  @Override
  public void run(ApplicationArguments arguments) throws IOException {
    if (!Files.isDirectory(root)) {
      log.info("Legacy note import skipped because {} does not exist", root);
      return;
    }
    try (Stream<Path> files = Files.walk(root)) {
      files.filter(Files::isRegularFile)
          .filter(path -> path.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".md"))
          .sorted()
          .forEach(this::importUnchecked);
    }
  }

  private void importUnchecked(Path path) {
    try {
      importFile(path);
    } catch (IOException exception) {
      throw new IllegalStateException("Cannot import legacy note " + path, exception);
    }
  }

  private void importFile(Path path) throws IOException {
    if (EXTRA_PAGES.contains(root.relativize(path).toString().replace('\\', '/'))) {
      return;
    }
    String slug = slug(path);
    Optional<NoteArticle> existing = articles.findBySlug(slug);
    if (existing.isPresent()) {
      if (existing.get().initializeLocation(directory(path), sortOrder(path))) {
        articles.save(existing.get());
      }
      return;
    }
    String source = Files.readString(path);
    Matcher frontMatter = FRONT_MATTER.matcher(source);
    String metadata = frontMatter.matches() ? frontMatter.group(1) : "";
    String body = frontMatter.matches() ? frontMatter.group(2) : source;
    NoteArticle article = new NoteArticle();
    article.update(
        slug,
        field(metadata, "title").orElseGet(() -> humanize(fileStem(path))),
        null,
        field(metadata, "tags").map(this::normalizeTags).orElse(""),
        series(path),
        null,
        directory(path),
        sortOrder(path),
        ArticleStatus.PUBLISHED,
        ArticleContentFormat.MARKDOWN,
        rewriteLinks(path, rewriteImages(path, body)),
        Files.getLastModifiedTime(path).toInstant());
    articles.save(article);
    log.info("Imported legacy note {} as {}", root.relativize(path), slug);
  }

  private Optional<String> field(String metadata, String name) {
    return metadata.lines()
        .map(String::trim)
        .filter(line -> line.startsWith(name + ":"))
        .map(line -> unquote(line.substring(name.length() + 1).trim()))
        .filter(value -> !value.isBlank())
        .findFirst();
  }

  private String normalizeTags(String value) {
    return Arrays.stream(value.replace("[", "").replace("]", "").split(","))
        .map(String::trim)
        .map(this::unquote)
        .filter(tag -> !tag.isBlank())
        .reduce((left, right) -> left + "," + right)
        .orElse("");
  }

  private String rewriteImages(Path article, String markdown) {
    return IMAGE.matcher(markdown).replaceAll(result -> rewriteImage(article, result));
  }

  private String rewriteLinks(Path article, String markdown) {
    return LINK.matcher(markdown).replaceAll(result -> rewriteLink(article, result));
  }

  private String rewriteLink(Path article, MatchResult result) {
    String target = result.group(2).replace("<", "").replace(">", "");
    if (target.matches("(?i)^(https?:|mailto:|/|#).*$") || !target.matches("(?i).*\\.md(?:#.*)?$")) {
      return result.group();
    }
    int fragmentStart = target.indexOf('#');
    String file = fragmentStart < 0 ? target : target.substring(0, fragmentStart);
    String fragment = fragmentStart < 0 ? "" : target.substring(fragmentStart);
    Path resolved = article.getParent().resolve(file).normalize();
    if (!resolved.startsWith(root)) {
      throw new IllegalArgumentException("Legacy link escapes the note tree: " + target);
    }
    return result.group(1) + "/real/notes/" + slug(resolved) + "/" + fragment + result.group(3);
  }

  private String rewriteImage(Path article, MatchResult result) {
    String target = result.group(2).replace("<", "").replace(">", "");
    if (target.matches("(?i)^(https?:|data:|/|#).*$")) {
      return result.group();
    }
    Path resolved = article.getParent().resolve(target).normalize();
    if (!resolved.startsWith(root)) {
      throw new IllegalArgumentException("Legacy image escapes the note tree: " + target);
    }
    return result.group(1)
        + "/api/v1/note-assets/legacy?path="
        + URLEncoder.encode(root.relativize(resolved).toString(), StandardCharsets.UTF_8)
        + result.group(3);
  }

  private String slug(Path path) {
    String relative = root.relativize(path).toString().replace('\\', '/');
    String withoutExtension = relative.substring(0, relative.length() - 3);
    String withoutIndex = withoutExtension.endsWith("/index")
        ? withoutExtension.substring(0, withoutExtension.length() - 6)
        : withoutExtension;
    String slug = withoutIndex.toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("^-+|-+$", "");
    if (slug.isBlank()) {
      throw new IllegalArgumentException("Cannot create a slug for " + path);
    }
    return slug;
  }

  private String series(Path path) {
    Path relative = root.relativize(path);
    return relative.getNameCount() > 1 ? humanize(relative.getName(0).toString()) : null;
  }

  private String directory(Path path) {
    Path relative = root.relativize(path.getParent());
    if (relative.toString().isBlank()) {
      return "";
    }
    return StreamSupport.stream(relative.spliterator(), false)
        .map(Path::toString)
        .map(this::pathSegment)
        .reduce((left, right) -> left + "/" + right)
        .orElse("");
  }

  private int sortOrder(Path path) {
    if ("index".equalsIgnoreCase(fileStem(path))) {
      return 0;
    }
    Matcher matcher = LEADING_NUMBER.matcher(fileStem(path));
    return matcher.matches() ? Integer.parseInt(matcher.group(1)) : 1000;
  }

  private String pathSegment(String value) {
    return value.toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("^-+|-+$", "");
  }

  private String fileStem(Path path) {
    String name = path.getFileName().toString();
    return name.substring(0, name.length() - 3);
  }

  private String humanize(String value) {
    return Arrays.stream(value.replace('_', '-').split("-"))
        .filter(part -> !part.isBlank())
        .map(part -> part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1))
        .reduce((left, right) -> left + " " + right)
        .orElse("Note");
  }

  private String unquote(String value) {
    return value.replaceAll("^(['\"])(.*)\\1$", "$2").replace("\\n", " ").replaceAll("\\s+", " ");
  }
}
