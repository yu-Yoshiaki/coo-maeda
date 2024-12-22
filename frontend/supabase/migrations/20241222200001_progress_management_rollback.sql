-- 進捗管理機能のテーブルを削除

-- トリガーの削除
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
DROP TRIGGER IF EXISTS update_risks_updated_at ON risks;
DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;

-- トリガー関数の削除
DROP FUNCTION IF EXISTS update_updated_at();

-- テーブルの削除
DROP TABLE IF EXISTS progress_reports;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS tasks;

-- 列挙型の削除
DROP TYPE IF EXISTS alert_type;
DROP TYPE IF EXISTS risk_severity;
DROP TYPE IF EXISTS task_status; 