package com.weiknight.site.api;

import com.weiknight.site.user.SiteUser;
import com.weiknight.site.user.SiteUserRepository;
import com.weiknight.site.user.UserAvatarService;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @description Lets members and administrators manage account-owned avatars without exposing files publicly.
 */
@RestController
@RequestMapping("/api/v1")
public class UserAvatarController {
  private final SiteUserRepository users;
  private final UserAvatarService avatars;
  private final SessionAccess access;

  UserAvatarController(SiteUserRepository users, UserAvatarService avatars, SessionAccess access) {
    this.users = users;
    this.avatars = avatars;
    this.access = access;
  }

  /**
   * @description Replaces the current member's avatar.
   * @param file Validated member image.
   * @param session Session that must represent an enabled persistent member.
   * @throws IOException when persistent avatar storage fails.
   */
  @PostMapping("/account/avatar")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void replaceOwn(@RequestParam("file") MultipartFile file, HttpSession session) throws IOException {
    access.requireMember(session);
    avatars.replace(find(access.requireUserId(session)), file);
  }

  /**
   * @description Removes the current member's avatar.
   * @param session Session that must represent an enabled persistent member.
   * @throws IOException when persistent avatar storage fails.
   */
  @DeleteMapping("/account/avatar")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteOwn(HttpSession session) throws IOException {
    access.requireMember(session);
    avatars.delete(find(access.requireUserId(session)));
  }

  /**
   * @description Replaces the selected member avatar from the administration panel.
   * @param id Persistent member identifier.
   * @param file Validated member image.
   * @param session Session that must represent the administrator.
   * @throws IOException when persistent avatar storage fails.
   */
  @PostMapping("/admin/users/{id}/avatar")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void replace(@PathVariable Long id, @RequestParam("file") MultipartFile file, HttpSession session)
      throws IOException {
    access.requireAdmin(session);
    avatars.replace(find(id), file);
  }

  /**
   * @description Removes the selected member avatar from the administration panel.
   * @param id Persistent member identifier.
   * @param session Session that must represent the administrator.
   * @throws IOException when persistent avatar storage fails.
   */
  @DeleteMapping("/admin/users/{id}/avatar")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id, HttpSession session) throws IOException {
    access.requireAdmin(session);
    avatars.delete(find(id));
  }

  /**
   * @description Streams an avatar only to its owner or an administrator.
   * @param id Account that owns the requested avatar.
   * @param session Session used to authorize the protected image.
   * @throws IOException when persistent avatar storage cannot be read.
   */
  @GetMapping("/user-avatars/{id}")
  public ResponseEntity<Resource> avatar(@PathVariable Long id, HttpSession session) throws IOException {
    access.requireMember(session);
    if (!access.isAdmin(session) && access.requireUserId(session) != id) {
      throw new AccessDeniedException();
    }
    UserAvatarService.AvatarFile avatar = avatars.load(find(id));
    return ResponseEntity.ok()
        .contentType(avatar.contentType())
        .cacheControl(CacheControl.noCache().cachePrivate())
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        .body(new FileSystemResource(avatar.path()));
  }

  private SiteUser find(Long id) {
    return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
