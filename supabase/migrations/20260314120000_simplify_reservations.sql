-- Drop columns no longer needed after removing email verification flow
ALTER TABLE public.reservations
  DROP COLUMN IF EXISTS guest_email,
  DROP COLUMN IF EXISTS guest_token,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS locale;

-- Drop the index that referenced guest_token (auto-dropped with column, but explicit for clarity)
DROP INDEX IF EXISTS idx_reservations_guest_token;
