package com.weiknight.site.api;

import com.weiknight.site.fiction.CommissionAsset;
import com.weiknight.site.fiction.CommissionAssetRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

/**
 * @description Manages, streams, and publicly lists uploaded commission images.
 */
@RestController
@RequestMapping("/api/v1")
public class CommissionController {
  private static final Map<String, String> EXTENSIONS = Map.of(
      MediaType.IMAGE_PNG_VALUE, ".png",
      MediaType.IMAGE_JPEG_VALUE, ".jpg",
      MediaType.IMAGE_GIF_VALUE, ".gif",
      "image/webp", ".webp");
  private final CommissionAssetRepository assets;
  private final SessionAccess access;
  private final Path assetRoot;

  CommissionController(
      CommissionAssetRepository assets,
      SessionAccess access,
      @Value("${site.fiction-assets-root}") String assetRoot) {
    this.assets = assets;
    this.access = access;
    this.assetRoot = Path.of(assetRoot).toAbsolutePath().normalize();
  }

  /** @description Lists gallery images in their configured public order. */
  @GetMapping("/fiction/commissions")
  public List<AssetResponse> publicList() {
    return assets.findAllByOrderByDisplayOrderAscCreatedAtDesc().stream().map(AssetResponse::from).toList();
  }

  /**
   * @description Lists commission images for the administrative gallery.
   * @param session Session that must represent the administrator.
   */
  @GetMapping("/admin/fiction/commissions")
  public List<AssetResponse> adminList(HttpSession session) {
    access.requireAdmin(session);
    return publicList();
  }

  /**
   * @description Stores a validated image and its initial gallery metadata.
   * @param file Image selected by the administrator.
   * @param title Public gallery title.
   * @param displayOrder Ordering value in the gallery.
   * @param session Session that must represent the administrator.
   * @throws IOException when persistent storage cannot be written.
   */
  @PostMapping(value = "/admin/fiction/commissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional(rollbackFor = IOException.class)
  public AssetResponse upload(
      @RequestParam MultipartFile file,
      @RequestParam String title,
      @RequestParam(defaultValue = "1000") Integer displayOrder,
      HttpSession session) throws IOException {
    access.requireAdmin(session);
    validateUpload(file, title, displayOrder);
    UUID id = UUID.randomUUID();
    CommissionAsset asset = assets.save(new CommissionAsset(
        id,
        id + EXTENSIONS.get(file.getContentType()),
        file.getOriginalFilename(),
        title.trim(),
        file.getContentType(),
        file.getSize(),
        displayOrder));
    Files.createDirectories(assetRoot);
    try (InputStream input = file.getInputStream()) {
      Files.copy(input, assetRoot.resolve(asset.getStoredName()));
    }
    return AssetResponse.from(asset);
  }

  /**
   * @description Replaces the public title and ordering of one commission image.
   * @param id Stable image identifier.
   * @param input Validated replacement metadata.
   * @param session Session that must represent the administrator.
   */
  @PutMapping("/admin/fiction/commissions/{id}")
  public AssetResponse update(
      @PathVariable UUID id,
      @Valid @RequestBody AssetInput input,
      HttpSession session) {
    access.requireAdmin(session);
    CommissionAsset asset = find(id);
    asset.update(input.title().trim(), input.displayOrder());
    return AssetResponse.from(assets.save(asset));
  }

  /**
   * @description Permanently removes one commission image and its metadata.
   * @param id Stable image identifier.
   * @param session Session that must represent the administrator.
   * @throws IOException when persistent storage cannot delete the file.
   */
  @DeleteMapping("/admin/fiction/commissions/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional(rollbackFor = IOException.class)
  public void delete(@PathVariable UUID id, HttpSession session) throws IOException {
    access.requireAdmin(session);
    CommissionAsset asset = find(id);
    assets.delete(asset);
    assets.flush();
    Files.deleteIfExists(assetRoot.resolve(asset.getStoredName()));
  }

  /**
   * @description Streams one commission image to public gallery visitors.
   * @param id Stable image identifier embedded in gallery URLs.
   * @param fileName Human-readable original file name suffix.
   */
  @GetMapping("/fiction/commission-assets/{id}/{fileName}")
  public ResponseEntity<Resource> image(@PathVariable UUID id, @PathVariable String fileName) {
    CommissionAsset asset = find(id);
    if (!fileName.equals(asset.getOriginalName())) {
      throw new ResourceNotFoundException("Commission image not found");
    }
    Path file = assetRoot.resolve(asset.getStoredName());
    if (!Files.isRegularFile(file)) {
      throw new ResourceNotFoundException("Commission image not found");
    }
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(asset.getContentType()))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        .body(new FileSystemResource(file));
  }

  private void validateUpload(MultipartFile file, String title, Integer displayOrder) {
    if (file.isEmpty()
        || file.getOriginalFilename() == null
        || file.getOriginalFilename().isBlank()
        || !EXTENSIONS.containsKey(file.getContentType())) {
      throw new IllegalArgumentException("A PNG, JPEG, GIF, or WebP image is required");
    }
    if (title.isBlank() || title.length() > 240 || displayOrder == null || displayOrder < 0) {
      throw new IllegalArgumentException("A title and non-negative order are required");
    }
  }

  private CommissionAsset find(UUID id) {
    return assets.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Commission image not found"));
  }

  /** @description Editable metadata accepted for one existing commission image. */
  public record AssetInput(
      @NotBlank @Size(max = 240) String title,
      @NotNull @PositiveOrZero Integer displayOrder) {
  }

  /** @description Browser-facing representation of one commission image. */
  public record AssetResponse(
      UUID id,
      String url,
      String originalName,
      String title,
      String contentType,
      long size,
      Integer displayOrder,
      Instant createdAt) {
    static AssetResponse from(CommissionAsset asset) {
      return new AssetResponse(
          asset.getId(),
          "/api/v1/fiction/commission-assets/" + asset.getId() + "/"
              + UriUtils.encodePathSegment(asset.getOriginalName(), StandardCharsets.UTF_8),
          asset.getOriginalName(),
          asset.getTitle(),
          asset.getContentType(),
          asset.getSize(),
          asset.getDisplayOrder(),
          asset.getCreatedAt());
    }
  }
}
