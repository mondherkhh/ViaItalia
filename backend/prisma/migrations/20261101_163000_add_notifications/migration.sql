-- ADDITIVE ONLY: new notification columns, no DROP/TRUNCATE, no Cascade
ALTER TABLE notification 
  ADD COLUMN type VARCHAR(20) DEFAULT 'GENERAL',
  ADD COLUMN title VARCHAR(255) DEFAULT NULL,
  ADD COLUMN message VARCHAR(500) DEFAULT NULL,
  ADD COLUMN link VARCHAR(255) DEFAULT NULL,
  ADD COLUMN readAt DATETIME DEFAULT NULL;

CREATE INDEX idx_notification_user_read ON notification(userId, readAt);
