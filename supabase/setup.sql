-- ============================================================
--  CRONOGRAMA — instalación en Supabase
--  Pega TODO este archivo en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tablas (todas con la misma forma: id + datos JSON)
create table if not exists public.posts         (id text primary key, data jsonb not null, created_at timestamptz default now());
create table if not exists public.comments      (id text primary key, data jsonb not null, created_at timestamptz default now());
create table if not exists public.activity      (id text primary key, data jsonb not null, created_at timestamptz default now());
create table if not exists public.notifications (id text primary key, data jsonb not null, created_at timestamptz default now());
create table if not exists public.prefs         (id text primary key, data jsonb not null, created_at timestamptz default now());
create table if not exists public.push_subs     (id text primary key, data jsonb not null, created_at timestamptz default now());

-- 2) Acceso para la app (clave pública "anon")
alter table public.posts         enable row level security;
alter table public.comments      enable row level security;
alter table public.activity      enable row level security;
alter table public.notifications enable row level security;
alter table public.prefs         enable row level security;
alter table public.push_subs     enable row level security;

drop policy if exists "crono_all" on public.posts;
drop policy if exists "crono_all" on public.comments;
drop policy if exists "crono_all" on public.activity;
drop policy if exists "crono_all" on public.notifications;
drop policy if exists "crono_all" on public.prefs;
drop policy if exists "crono_all" on public.push_subs;
create policy "crono_all" on public.posts         for all to anon using (true) with check (true);
create policy "crono_all" on public.comments      for all to anon using (true) with check (true);
create policy "crono_all" on public.activity      for all to anon using (true) with check (true);
create policy "crono_all" on public.notifications for all to anon using (true) with check (true);
create policy "crono_all" on public.prefs         for all to anon using (true) with check (true);
create policy "crono_all" on public.push_subs     for all to anon using (true) with check (true);

-- 3) Carpeta pública para imágenes y archivos
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)
on conflict (id) do nothing;

drop policy if exists "crono_media_read"   on storage.objects;
drop policy if exists "crono_media_insert" on storage.objects;
drop policy if exists "crono_media_delete" on storage.objects;
create policy "crono_media_read"   on storage.objects for select to anon using (bucket_id = 'media');
create policy "crono_media_insert" on storage.objects for insert to anon with check (bucket_id = 'media');
create policy "crono_media_delete" on storage.objects for delete to anon using (bucket_id = 'media');

-- 4) Actualizaciones en tiempo real (si ya estaban activadas, se ignora)
do $$
begin
  begin alter publication supabase_realtime add table public.posts;         exception when others then null; end;
  begin alter publication supabase_realtime add table public.comments;      exception when others then null; end;
  begin alter publication supabase_realtime add table public.activity;      exception when others then null; end;
  begin alter publication supabase_realtime add table public.notifications; exception when others then null; end;
  begin alter publication supabase_realtime add table public.prefs;         exception when others then null; end;
end $$;
