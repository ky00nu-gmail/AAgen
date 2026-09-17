-- AI 모델 만들기 · 팀 동기화 스키마 (Supabase SQL Editor에서 한 번 실행)
-- 1) 허용 이메일: 여기에 있는 이메일로 로그인한 사용자만 읽기/쓰기 가능
create table if not exists public.allowed_emails (
  email text primary key,
  added_at timestamptz not null default now()
);
insert into public.allowed_emails(email) values ('ky00nu@estsoft.com') on conflict do nothing;

create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.allowed_emails a where lower(a.email) = lower(coalesce(auth.jwt()->>'email','')));
$$;

-- 2) 공용 아이템: 모델(model) · 룩(look) · 배경 컷(scene) · 배경(bg). 이미지는 Storage, 나머지는 data(jsonb)
create table if not exists public.items (
  id text primary key,
  kind text not null check (kind in ('model','look','scene','bg')),
  parent_id text,
  data jsonb not null default '{}'::jsonb,
  image_path text,
  orig_path text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists items_kind_idx on public.items(kind);
create index if not exists items_parent_idx on public.items(parent_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists items_touch on public.items;
create trigger items_touch before update on public.items for each row execute function public.touch_updated_at();

alter table public.items enable row level security;
alter table public.allowed_emails enable row level security;
drop policy if exists items_rw on public.items;
create policy items_rw on public.items for all to authenticated using (public.is_allowed()) with check (public.is_allowed());
drop policy if exists allowed_read on public.allowed_emails;
create policy allowed_read on public.allowed_emails for select to authenticated using (public.is_allowed());

-- 3) 실시간 변경 알림 (다른 사람이 올리면 바로 반영)
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='items') then
    alter publication supabase_realtime add table public.items;
  end if;
end $$;

-- 4) Storage 버킷 (비공개) + 허용 사용자만 읽기/쓰기
insert into storage.buckets (id, name, public) values ('avatar-images','avatar-images', false) on conflict (id) do nothing;
drop policy if exists "avatar images rw" on storage.objects;
create policy "avatar images rw" on storage.objects for all to authenticated
  using (bucket_id = 'avatar-images' and public.is_allowed())
  with check (bucket_id = 'avatar-images' and public.is_allowed());

-- 팀원 추가는 아래 한 줄씩:
-- insert into public.allowed_emails(email) values ('teammate@estsoft.com');
