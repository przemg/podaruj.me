-- Create lists table
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name varchar(100) not null,
  description varchar(500),
  occasion varchar(20) not null check (occasion in ('birthday', 'holiday', 'wedding', 'other')),
  event_date date,
  privacy_mode varchar(20) not null default 'buyers_choice' check (privacy_mode in ('buyers_choice', 'visible', 'full_surprise')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create items table
create table public.items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade not null,
  name varchar(200) not null,
  description varchar(1000),
  url text,
  price numeric(10,2) check (price >= 0),
  image_url text,
  priority varchar(20) not null default 'nice_to_have' check (priority in ('nice_to_have', 'would_love', 'must_have')),
  position integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Reuse existing handle_updated_at() from profiles migration

-- Triggers for updated_at
create trigger on_lists_updated
  before update on public.lists
  for each row
  execute function public.handle_updated_at();

create trigger on_items_updated
  before update on public.items
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.lists enable row level security;
alter table public.items enable row level security;

-- RLS policies for lists (Phase 1: owner-only)
create policy "Users can view own lists"
  on public.lists for select
  using (auth.uid() = user_id);

create policy "Users can create own lists"
  on public.lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on public.lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on public.lists for delete
  using (auth.uid() = user_id);

-- RLS policies for items (owner of parent list)
create policy "Users can view items in own lists"
  on public.items for select
  using (list_id in (select id from public.lists where user_id = auth.uid()));

create policy "Users can add items to own lists"
  on public.items for insert
  with check (list_id in (select id from public.lists where user_id = auth.uid()));

create policy "Users can update items in own lists"
  on public.items for update
  using (list_id in (select id from public.lists where user_id = auth.uid()));

create policy "Users can delete items from own lists"
  on public.items for delete
  using (list_id in (select id from public.lists where user_id = auth.uid()));

-- Indexes for faster queries
create index idx_lists_user_id on public.lists(user_id);
create index idx_items_list_id on public.items(list_id);
create index idx_items_position on public.items(list_id, position);
