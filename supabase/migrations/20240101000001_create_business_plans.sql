create type business_plan_status as enum ('draft', 'in_progress', 'completed', 'cancelled');
create type action_item_status as enum ('todo', 'in_progress', 'completed');
create type milestone_status as enum ('pending', 'completed');
create type impact_level as enum ('low', 'medium', 'high');
create type probability_level as enum ('low', 'medium', 'high');

-- 事業計画テーブル
create table if not exists business_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  start_date date not null,
  end_date date not null,
  status business_plan_status not null default 'draft',
  context jsonb not null default '{
    "what": "",
    "when": "",
    "how": "",
    "who": "",
    "why": ""
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- アクションアイテムテーブル
create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  business_plan_id uuid references business_plans(id) on delete cascade not null,
  title text not null,
  description text not null,
  due_date date not null,
  status action_item_status not null default 'todo',
  resources text[] not null default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- マイルストーンテーブル
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  business_plan_id uuid references business_plans(id) on delete cascade not null,
  title text not null,
  description text not null,
  due_date date not null,
  status milestone_status not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- リスクテーブル
create table if not exists risks (
  id uuid primary key default gen_random_uuid(),
  business_plan_id uuid references business_plans(id) on delete cascade not null,
  title text not null,
  description text not null,
  impact impact_level not null,
  probability probability_level not null,
  mitigation text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 更新日時を自動更新するトリガー
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_business_plans_updated_at
  before update on business_plans
  for each row
  execute function update_updated_at_column();

create trigger update_action_items_updated_at
  before update on action_items
  for each row
  execute function update_updated_at_column();

create trigger update_milestones_updated_at
  before update on milestones
  for each row
  execute function update_updated_at_column();

create trigger update_risks_updated_at
  before update on risks
  for each row
  execute function update_updated_at_column();

-- RLSポリシーの設定
alter table business_plans enable row level security;
alter table action_items enable row level security;
alter table milestones enable row level security;
alter table risks enable row level security;

create policy "ユーザーは自分の事業計画のみ参照可能"
  on business_plans for select
  to authenticated
  using (auth.uid() = user_id);

create policy "ユーザーは自分の事業計画のみ作成可能"
  on business_plans for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "ユーザーは自分の事業計画のみ更新可能"
  on business_plans for update
  to authenticated
  using (auth.uid() = user_id);

create policy "ユーザーは自分の事業計画のみ削除可能"
  on business_plans for delete
  to authenticated
  using (auth.uid() = user_id);

-- アクションアイテムのRLSポリシー
create policy "action_items_select"
  on action_items for select
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = action_items.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "action_items_insert"
  on action_items for insert
  to authenticated
  with check (exists (
    select 1 from business_plans
    where business_plans.id = action_items.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "action_items_update"
  on action_items for update
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = action_items.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "action_items_delete"
  on action_items for delete
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = action_items.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

-- マイルストーンのRLSポリシー
create policy "milestones_select"
  on milestones for select
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = milestones.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "milestones_insert"
  on milestones for insert
  to authenticated
  with check (exists (
    select 1 from business_plans
    where business_plans.id = milestones.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "milestones_update"
  on milestones for update
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = milestones.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "milestones_delete"
  on milestones for delete
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = milestones.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

-- リスクのRLSポリシー
create policy "risks_select"
  on risks for select
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = risks.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "risks_insert"
  on risks for insert
  to authenticated
  with check (exists (
    select 1 from business_plans
    where business_plans.id = risks.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "risks_update"
  on risks for update
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = risks.business_plan_id
    and business_plans.user_id = auth.uid()
  ));

create policy "risks_delete"
  on risks for delete
  to authenticated
  using (exists (
    select 1 from business_plans
    where business_plans.id = risks.business_plan_id
    and business_plans.user_id = auth.uid()
  )); 