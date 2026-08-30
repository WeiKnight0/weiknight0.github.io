package com.weiknight.site.api;

import com.weiknight.site.audit.SecurityAuditService;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description Exposes recent security events to the administrator without exposing credential or session data.
 */
@RestController
@RequestMapping("/api/v1/admin/security-events")
public class SecurityAuditController {
  private final SecurityAuditService audit;
  private final SessionAccess access;

  SecurityAuditController(SecurityAuditService audit, SessionAccess access) {
    this.audit = audit;
    this.access = access;
  }

  /**
   * @description Lists the newest persisted security events for incident review.
   * @param eventType Optional exact event type selected in the management interface.
   * @param session Session that must represent the administrator.
   * @return At most 200 events in reverse chronological order.
   * @throws AccessDeniedException when the session is not administrative.
   */
  @GetMapping
  public List<SecurityAuditService.AuditEventResponse> list(
      @RequestParam(required = false) String eventType,
      HttpSession session) {
    access.requireAdmin(session);
    return audit.recent(eventType);
  }
}
