-- RLSポリシーの削除
drop policy if exists "business_plans_select" on business_plans;
drop policy if exists "business_plans_insert" on business_plans;
drop policy if exists "business_plans_update" on business_plans;
drop policy if exists "business_plans_delete" on business_plans;

drop policy if exists "action_items_select" on action_items;
drop policy if exists "action_items_insert" on action_items;
drop policy if exists "action_items_update" on action_items;
drop policy if exists "action_items_delete" on action_items;

drop policy if exists "milestones_select" on milestones;
drop policy if exists "milestones_insert" on milestones;
drop policy if exists "milestones_update" on milestones;
drop policy if exists "milestones_delete" on milestones;

drop policy if exists "risks_select" on risks;
drop policy if exists "risks_insert" on risks;
drop policy if exists "risks_update" on risks;
drop policy if exists "risks_delete" on risks;

-- トリガーの削除
drop trigger if exists update_business_plans_updated_at on business_plans;
drop trigger if exists update_action_items_updated_at on action_items;
drop trigger if exists update_milestones_updated_at on milestones;
drop trigger if exists update_risks_updated_at on risks;

-- 関数の削除
drop function if exists update_updated_at_column();

-- テーブルの削除
drop table if exists risks;
drop table if exists milestones;
drop table if exists action_items;
drop table if exists business_plans;

-- 型の削除
drop type if exists business_plan_status;
drop type if exists action_item_status;
drop type if exists milestone_status;
drop type if exists impact_level;
drop type if exists probability_level; 