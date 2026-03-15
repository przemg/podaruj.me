-- Add optional event_time column to lists
-- When set, countdown counts to exact time and list closes at that time instead of end of day
ALTER TABLE lists ADD COLUMN event_time varchar(5);
-- Format: "HH:MM" (e.g., "18:00"), nullable
