ALTER TABLE public.lists
  ADD COLUMN is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN published_at timestamptz;
