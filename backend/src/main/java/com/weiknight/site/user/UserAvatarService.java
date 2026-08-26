package com.weiknight.site.user;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * @description Stores and removes validated member avatar files while keeping account metadata synchronized.
 */
@Service
public class UserAvatarService {
  private static final long MAX_FILE_SIZE = 3 * 1024 * 1024;
  private static final Map<String, String> EXTENSIONS = Map.of(
      MediaType.IMAGE_PNG_VALUE, ".png",
      MediaType.IMAGE_JPEG_VALUE, ".jpg",
      "image/webp", ".webp");
  private final SiteUserRepository users;
  private final Path avatarRoot;

  UserAvatarService(
      SiteUserRepository users,
      @Value("${site.user-avatars-root}") String avatarRoot) {
    this.users = users;
    this.avatarRoot = Path.of(avatarRoot).toAbsolutePath().normalize();
  }

  /**
   * @description Replaces one member avatar with a newly uploaded persistent image.
   * @param user Account that will own the uploaded image.
   * @param file PNG, JPEG, or WebP image no larger than three MiB.
   * @throws IOException when persistent storage cannot be updated.
   */
  @Transactional(rollbackOn = IOException.class)
  public void replace(SiteUser user, MultipartFile file) throws IOException {
    validate(file);
    String contentType = file.getContentType();
    String previous = user.hasAvatar() ? user.avatarFileName() : null;
    String fileName = user.getId() + "-" + UUID.randomUUID() + EXTENSIONS.get(contentType);
    Files.createDirectories(avatarRoot);
    try (InputStream input = file.getInputStream()) {
      Files.copy(input, avatarRoot.resolve(fileName));
    }
    user.updateAvatar(fileName, contentType);
    users.saveAndFlush(user);
    if (previous != null) {
      Files.delete(avatarRoot.resolve(previous));
    }
  }

  /**
   * @description Deletes a member avatar and restores the generated initial fallback.
   * @param user Account whose current avatar must be removed.
   * @throws IOException when persistent storage cannot be updated.
   */
  @Transactional(rollbackOn = IOException.class)
  public void delete(SiteUser user) throws IOException {
    if (!user.hasAvatar()) {
      return;
    }
    String fileName = user.avatarFileName();
    user.removeAvatar();
    users.saveAndFlush(user);
    Files.delete(avatarRoot.resolve(fileName));
  }

  /**
   * @description Resolves one account's stored avatar for protected streaming.
   * @param user Account whose avatar metadata has already been authorized.
   * @throws java.nio.file.NoSuchFileException when avatar metadata or storage is absent.
   */
  public AvatarFile load(SiteUser user) throws IOException {
    if (!user.hasAvatar()) {
      throw new java.nio.file.NoSuchFileException("User avatar not found");
    }
    Path path = avatarRoot.resolve(user.avatarFileName());
    if (!Files.isRegularFile(path)) {
      throw new java.nio.file.NoSuchFileException("User avatar not found");
    }
    return new AvatarFile(path, MediaType.parseMediaType(user.avatarContentType()));
  }

  private void validate(MultipartFile file) {
    if (file.isEmpty()
        || file.getSize() > MAX_FILE_SIZE
        || !EXTENSIONS.containsKey(file.getContentType())) {
      throw new IllegalArgumentException("A PNG, JPEG, or WebP image no larger than 3 MiB is required");
    }
  }

  /** @description Authorized avatar file and its validated response media type. */
  public record AvatarFile(Path path, MediaType contentType) {
  }
}
