package com.weiknight.site.audit;

import jakarta.servlet.http.HttpServletRequest;
import com.weiknight.site.user.SiteUser;
import com.weiknight.site.user.SiteUserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * @description Records minimal, credential-free evidence for authentication and state-changing requests.
 */
@Service
public class SecurityAuditService {
  private final SecurityAuditEventRepository events;
  private final SiteUserRepository users;

  SecurityAuditService(SecurityAuditEventRepository events, SiteUserRepository users) {
    this.events = events;
    this.users = users;
  }

  /**
   * @description Persists one security event using bounded request metadata.
   * @param eventType Security-relevant action or outcome.
   * @param actorUserId Authenticated actor when known.
   * @param request Current browser request.
   * @param responseStatus Final HTTP outcome.
   */
  public void record(String eventType, Long actorUserId, HttpServletRequest request, int responseStatus) {
    events.save(new SecurityAuditEvent(
        eventType,
        actorUserId,
        request.getMethod(),
        limit(request.getRequestURI(), 500),
        responseStatus,
        limit(request.getRemoteAddr(), 64),
        limit(request.getHeader("User-Agent"), 500)));
  }

  /**
   * @description Returns the newest audit events, optionally narrowed to one event type.
   * @param eventType Exact uppercase event type selected by the administrator.
   * @return At most 200 audit events in reverse chronological order.
   * @throws IllegalArgumentException when the requested event type has an invalid format.
   */
  public List<AuditEventResponse> recent(String eventType) {
    if (eventType == null || eventType.isBlank()) {
      return responses(events.findTop200ByOrderByOccurredAtDesc());
    }
    if (!eventType.matches("[A-Z_]{1,64}")) {
      throw new IllegalArgumentException("Invalid security event type");
    }
    return responses(events.findTop200ByEventTypeOrderByOccurredAtDesc(eventType));
  }

  private List<AuditEventResponse> responses(List<SecurityAuditEvent> results) {
    Map<Long, String> usernames = users.findAllById(results.stream()
            .map(SecurityAuditEvent::actorUserId)
            .filter(java.util.Objects::nonNull)
            .toList())
        .stream()
        .collect(Collectors.toMap(SiteUser::getId, SiteUser::getUsername));
    return results.stream()
        .map(event -> AuditEventResponse.from(event, usernames.get(event.actorUserId())))
        .toList();
  }

  private String limit(String value, int maximum) {
    if (value == null) {
      return "-";
    }
    return value.length() <= maximum ? value : value.substring(0, maximum);
  }

  /** @description Browser-safe representation of one persisted security event. */
  public record AuditEventResponse(
      Instant occurredAt,
      String eventType,
      String actor,
      String requestMethod,
      String requestPath,
      int responseStatus,
      String clientIp) {
    static AuditEventResponse from(SecurityAuditEvent event, String username) {
      String actor = event.actorUserId() == null
          ? "Anonymous"
          : username == null ? "Deleted user #" + event.actorUserId() : username;
      return new AuditEventResponse(
          event.occurredAt(),
          event.eventType(),
          actor,
          event.requestMethod(),
          event.requestPath(),
          event.responseStatus(),
          event.clientIp());
    }
  }
}
