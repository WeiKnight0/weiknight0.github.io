package com.weiknight.site.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * @description Stores security-relevant actions without retaining credentials or session identifiers.
 */
@Entity
@Table(name = "security_audit_events")
public class SecurityAuditEvent {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Instant occurredAt;

  @Column(nullable = false)
  private String eventType;

  private Long actorUserId;

  @Column(nullable = false)
  private String requestMethod;

  @Column(nullable = false)
  private String requestPath;

  @Column(nullable = false)
  private int responseStatus;

  @Column(nullable = false)
  private String clientIp;

  @Column(nullable = false)
  private String userAgent;

  protected SecurityAuditEvent() {
  }

  SecurityAuditEvent(
      String eventType,
      Long actorUserId,
      String requestMethod,
      String requestPath,
      int responseStatus,
      String clientIp,
      String userAgent) {
    this.occurredAt = Instant.now();
    this.eventType = eventType;
    this.actorUserId = actorUserId;
    this.requestMethod = requestMethod;
    this.requestPath = requestPath;
    this.responseStatus = responseStatus;
    this.clientIp = clientIp;
    this.userAgent = userAgent;
  }

  Instant occurredAt() {
    return occurredAt;
  }

  String eventType() {
    return eventType;
  }

  Long actorUserId() {
    return actorUserId;
  }

  String requestMethod() {
    return requestMethod;
  }

  String requestPath() {
    return requestPath;
  }

  int responseStatus() {
    return responseStatus;
  }

  String clientIp() {
    return clientIp;
  }
}
