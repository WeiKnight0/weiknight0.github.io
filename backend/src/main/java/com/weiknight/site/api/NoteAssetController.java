package com.weiknight.site.api;

import com.weiknight.site.note.NoteArticleRepository;
import com.weiknight.site.note.NoteAsset;
import com.weiknight.site.note.NoteAssetRepository;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

/**
 * @description Persists, lists, protects, and streams images used by note articles.
 */
@RestController
@RequestMapping("/api/v1")
public class NoteAssetController {
  private static final Map<String, String> EXTENSIONS = Map.of(
      MediaType.IMAGE_PNG_VALUE, ".png",
      MediaType.IMAGE_JPEG_VALUE, ".jpg",
      MediaType.IMAGE_GIF_VALUE, ".gif",
      "image/webp", ".webp");
  private final NoteAssetRepository assets;
  private final NoteArticleRepository articles;
  private final SessionAccess access;
  private final Path assetRoot;
  private final Path legacyRoot;

  NoteAssetController(
      NoteAssetRepository assets,
      NoteArticleRepository articles,
      SessionAccess access,
      @Value("${site.note-assets-root}") String assetRoot,
      @Value("${site.legacy-notes-root}") String legacyRoot) {
    this.assets = assets;
    this.articles = articles;
    this.access = access;
    this.assetRoot = Path.of(assetRoot).toAbsolutePath().normalize();
    this.legacyRoot = Path.of(legacyRoot).toAbsolutePath().normalize();
  }

  /**
   * @description Lists uploaded images for reuse in the administration editor.
   * @param session Session that must represent the administrator.
   */
  @GetMapping("/admin/note-assets")
  public List<AssetResponse> list(HttpSession session) {
    access.requireAdmin(session);
    return assets.findAllByOrderByCreatedAtDesc().stream().map(AssetResponse::from).toList();
  }

  /**
   * @description Stores a validated image in the persistent host-mounted asset directory.
   * @param file Image selected or pasted by the administrator.
   * @param session Session that must represent the administrator.
   * @throws IOException when the persistent file cannot be written.
   */
  @PostMapping(value = "/admin/note-assets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional(rollbackFor = IOException.class)
  public AssetResponse upload(@RequestParam MultipartFile file, HttpSession session) throws IOException {
    access.requireAdmin(session);
    validateUpload(file);
    UUID id = UUID.randomUUID();
    NoteAsset asset = assets.save(new NoteAsset(
        id,
        id + EXTENSIONS.get(file.getContentType()),
        file.getOriginalFilename(),
        file.getContentType(),
        file.getSize()));
    Files.createDirectories(assetRoot);
    try (InputStream input = file.getInputStream()) {
      Files.copy(input, assetRoot.resolve(asset.getStoredName()));
    }
    return AssetResponse.from(asset);
  }

  /**
   * @description Streams one uploaded image to an authenticated note reader.
   * @param id Stable image identifier embedded in article content.
   * @param fileName Human-readable URL suffix.
   * @param session Session that must represent a member or administrator.
   * @throws ResourceNotFoundException when the asset metadata or file does not exist.
   */
  @GetMapping("/note-assets/{id}/{fileName}")
  public ResponseEntity<Resource> asset(
      @PathVariable UUID id,
      @PathVariable String fileName,
      HttpSession session) {
    access.requireMember(session);
    NoteAsset asset = find(id);
    if (!fileName.equals(asset.getOriginalName())) {
      throw new ResourceNotFoundException("Note image not found");
    }
    return image(assetRoot.resolve(asset.getStoredName()), MediaType.parseMediaType(asset.getContentType()));
  }

  /**
   * @description Streams an imported note image while legacy Markdown is converted by later edits.
   * @param path Relative image path inside the read-only legacy note tree.
   * @param session Session that must represent a member or administrator.
   * @throws ResourceNotFoundException when the legacy image no longer exists.
   */
  @GetMapping("/note-assets/legacy")
  public ResponseEntity<Resource> legacy(@RequestParam String path, HttpSession session) {
    access.requireMember(session);
    Path target = resolveLegacyImage(path);
    return image(target, mediaType(target));
  }

  /**
   * @description Deletes an unreferenced image from both persistent storage and metadata.
   * @param id Stable uploaded image identifier.
   * @param session Session that must represent the administrator.
   * @throws IOException when the persistent file cannot be deleted.
   */
  @DeleteMapping("/admin/note-assets/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional(rollbackFor = IOException.class)
  public void delete(@PathVariable UUID id, HttpSession session) throws IOException {
    access.requireAdmin(session);
    if (articles.findAll().stream().anyMatch(article -> article.referencesAsset(id.toString()))) {
      throw new IllegalArgumentException("The image is still used by an article");
    }
    NoteAsset asset = find(id);
    assets.delete(asset);
    assets.flush();
    Files.delete(assetRoot.resolve(asset.getStoredName()));
  }

  private void validateUpload(MultipartFile file) {
    if (file.isEmpty()
        || file.getOriginalFilename() == null
        || file.getOriginalFilename().isBlank()
        || !EXTENSIONS.containsKey(file.getContentType())) {
      throw new IllegalArgumentException("A PNG, JPEG, GIF, or WebP image is required");
    }
  }

  private NoteAsset find(UUID id) {
    return assets.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Note image not found"));
  }

  private Path resolveLegacyImage(String value) {
    if (value.isBlank()) {
      throw new IllegalArgumentException("Legacy image path is required");
    }
    Path target = legacyRoot.resolve(value).normalize();
    if (!target.startsWith(legacyRoot) || !Files.isRegularFile(target)) {
      throw new ResourceNotFoundException("Legacy note image not found");
    }
    mediaType(target);
    return target;
  }

  private ResponseEntity<Resource> image(Path path, MediaType mediaType) {
    if (!Files.isRegularFile(path)) {
      throw new ResourceNotFoundException("Note image not found");
    }
    return ResponseEntity.ok()
        .contentType(mediaType)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        .body(new FileSystemResource(path));
  }

  private MediaType mediaType(Path path) {
    String name = path.getFileName().toString().toLowerCase(Locale.ROOT);
    if (name.endsWith(".png")) {
      return MediaType.IMAGE_PNG;
    }
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
      return MediaType.IMAGE_JPEG;
    }
    if (name.endsWith(".gif")) {
      return MediaType.IMAGE_GIF;
    }
    if (name.endsWith(".webp")) {
      return MediaType.parseMediaType("image/webp");
    }
    throw new IllegalArgumentException("Unsupported legacy image extension");
  }

  /** @description Browser-facing metadata for one uploaded image. */
  public record AssetResponse(
      UUID id,
      String url,
      String originalName,
      String contentType,
      long size,
      Instant createdAt) {
    static AssetResponse from(NoteAsset asset) {
      return new AssetResponse(
          asset.getId(),
          "/api/v1/note-assets/" + asset.getId() + "/"
              + UriUtils.encodePathSegment(asset.getOriginalName(), java.nio.charset.StandardCharsets.UTF_8),
          asset.getOriginalName(),
          asset.getContentType(),
          asset.getSize(),
          asset.getCreatedAt());
    }
  }
}
