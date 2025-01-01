-- アクションアイテムにstart_dateカラムを追加
alter table action_items
add column start_date date not null default current_date;

-- デフォルト値を削除
alter table action_items
alter column start_date drop default; 