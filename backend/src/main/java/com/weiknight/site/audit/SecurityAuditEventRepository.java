package com.weiknight.site.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * @description Persists security-relevant site events for later incident review.
 */
interface SecurityAuditEventRepository extends JpaRepository<SecurityAuditEvent, Long> {
  List<SecurityAuditEvent> findTop200ByOrderByOccurredAtDesc();

  List<SecurityAuditEvent> findTop200ByEventTypeOrderByOccurredAtDesc(String eventType);
}
