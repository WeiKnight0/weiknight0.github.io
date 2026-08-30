CREATE TABLE security_audit_events (
    id BIGSERIAL PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(64) NOT NULL,
    actor_user_id BIGINT,
    request_method VARCHAR(10) NOT NULL,
    request_path VARCHAR(500) NOT NULL,
    response_status INTEGER NOT NULL,
    client_ip VARCHAR(64) NOT NULL,
    user_agent VARCHAR(500) NOT NULL
);

CREATE INDEX security_audit_events_occurred_at_idx
    ON security_audit_events (occurred_at DESC);

CREATE INDEX security_audit_events_actor_user_id_idx
    ON security_audit_events (actor_user_id, occurred_at DESC);
