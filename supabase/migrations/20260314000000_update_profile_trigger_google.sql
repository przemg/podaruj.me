-- Update handle_new_user to extract display_name and avatar_url from Google metadata
-- SECURITY DEFINER required because trigger runs as supabase_auth_admin which doesn't pass RLS
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql;
