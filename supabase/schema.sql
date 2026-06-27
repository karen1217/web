-- ============================================================
-- photo-checker pro: database schema
-- Run this in the Supabase SQL editor after creating a project.
-- ============================================================

-- ── angle_presets ──────────────────────────────────────────
create table if not exists public.angle_presets (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  yaw         float       not null,
  label       text        not null,
  is_default  boolean     not null default false,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.angle_presets enable row level security;

create policy "users manage own presets"
  on public.angle_presets for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Insert default angles when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.angle_presets (user_id, yaw, label, is_default, sort_order) values
    (new.id,   0, '正面',       true, 0),
    (new.id,  30, '斜め30°左', true, 1),
    (new.id,  45, '斜め45°左', true, 2),
    (new.id, -30, '斜め30°右', true, 3),
    (new.id, -45, '斜め45°右', true, 4);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── capture_sessions ───────────────────────────────────────
create table if not exists public.capture_sessions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  label        text        not null,
  notes        text,
  captured_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

alter table public.capture_sessions enable row level security;

create policy "users manage own sessions"
  on public.capture_sessions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── shots ──────────────────────────────────────────────────
create table if not exists public.shots (
  id           uuid        primary key default gen_random_uuid(),
  session_id   uuid        not null references public.capture_sessions(id) on delete cascade,
  user_id      uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  yaw          float       not null,
  pitch        float       not null,
  roll         float       not null,
  angle_label  text        not null,
  image_path   text        not null,
  created_at   timestamptz not null default now()
);

alter table public.shots enable row level security;

create policy "users manage own shots"
  on public.shots for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Storage bucket ─────────────────────────────────────────
-- Private bucket for face photos. RLS is enforced via folder prefix = user_id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shots', 'shots', false, 10485760, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "upload own shots"
  on storage.objects for insert
  with check (
    bucket_id = 'shots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "read own shots"
  on storage.objects for select
  using (
    bucket_id = 'shots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "delete own shots"
  on storage.objects for delete
  using (
    bucket_id = 'shots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
