create type schedule_status as enum ('confirmed', 'tentative', 'cancelled');
create type schedule_source as enum ('internal', 'google', 'outlook');

create table schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start timestamp with time zone not null,
  end timestamp with time zone not null,
  location text,
  attendees text[],
  is_all_day boolean default false,
  status schedule_status not null default 'confirmed',
  source schedule_source not null default 'internal',
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLSポリシーの設定
alter table schedules enable row level security;

create policy "ユーザーは自分のスケジュールのみ参照可能"
  on schedules for select
  using (auth.uid() = user_id);

create policy "ユーザーは自分のスケジュールのみ作成可能"
  on schedules for insert
  with check (auth.uid() = user_id);

create policy "ユーザーは自分のスケジュールのみ更新可能"
  on schedules for update
  using (auth.uid() = user_id);

create policy "ユーザーは自分のスケジュールのみ削除可能"
  on schedules for delete
  using (auth.uid() = user_id);

-- インデックスの作成
create index schedules_user_id_idx on schedules(user_id);
create index schedules_start_idx on schedules(start);
create index schedules_end_idx on schedules(end);

-- updated_atの自動更新
create trigger set_updated_at
  before update on schedules
  for each row
  execute function moddatetime(); 