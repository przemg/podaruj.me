alter table public.lists add column slug varchar(150) unique;

-- Backfill existing lists with a slug based on their id
update public.lists set slug = substring(id::text, 1, 8) where slug is null;

-- Make slug not null after backfill
alter table public.lists alter column slug set not null;

-- Index for slug lookups
create unique index idx_lists_slug on public.lists(slug);
