ALTER TABLE site_users ADD COLUMN display_name VARCHAR(100);
UPDATE site_users SET display_name = username;
ALTER TABLE site_users ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE site_users ADD COLUMN avatar_file_name VARCHAR(255);
ALTER TABLE site_users ADD COLUMN avatar_content_type VARCHAR(100);
ALTER TABLE site_users ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE site_users ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX site_users_username_lower_unique ON site_users (LOWER(username));
