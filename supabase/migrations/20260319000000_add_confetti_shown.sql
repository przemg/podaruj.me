-- Add confetti_shown column to track if celebratory confetti has been shown
ALTER TABLE public.lists ADD COLUMN confetti_shown BOOLEAN DEFAULT false;
