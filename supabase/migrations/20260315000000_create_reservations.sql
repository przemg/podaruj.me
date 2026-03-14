-- Create reservations table
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade not null,
  list_id uuid references public.lists(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  guest_email varchar(320),
  guest_nickname varchar(50),
  guest_token uuid default gen_random_uuid(),
  show_name boolean not null default true,
  status varchar(20) not null default 'confirmed' check (status in ('pending', 'confirmed')),
  locale varchar(5) not null default 'en',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Updated_at trigger (reuses handle_updated_at from profiles migration)
create trigger on_reservations_updated
  before update on public.reservations
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.reservations enable row level security;

-- RLS: logged-in users can read their own reservations (for dashboard)
create policy "Users can view own reservations"
  on public.reservations for select
  using (auth.uid() = user_id);

-- RLS: logged-in users can delete their own reservations (cancel)
create policy "Users can delete own reservations"
  on public.reservations for delete
  using (auth.uid() = user_id);

-- Indexes
create unique index idx_reservations_item_id on public.reservations(item_id);
create index idx_reservations_list_id on public.reservations(list_id);
create index idx_reservations_user_id on public.reservations(user_id);
create index idx_reservations_guest_token on public.reservations(guest_token);
