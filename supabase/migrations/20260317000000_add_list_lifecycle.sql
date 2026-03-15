-- Add lifecycle columns to lists
ALTER TABLE public.lists
  ADD COLUMN is_closed boolean NOT NULL DEFAULT false,
  ADD COLUMN closed_at timestamptz,
  ADD COLUMN surprise_revealed boolean NOT NULL DEFAULT false;

-- Slug history table for old link redirects
CREATE TABLE public.list_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  slug varchar(150) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT list_slug_history_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_list_slug_history_list_id ON public.list_slug_history(list_id);
CREATE INDEX idx_list_slug_history_slug ON public.list_slug_history(slug);

-- RLS: allow authenticated users to insert their own list's slug history
ALTER TABLE public.list_slug_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert slug history for own lists"
  ON public.list_slug_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_slug_history.list_id
      AND lists.user_id = auth.uid()
    )
  );
