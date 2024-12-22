-- 進捗管理機能のテーブルを削除

-- トリガーの削除
DROP TRIGGER IF EXISTS update_progress_tasks_updated_at ON progress_tasks;
DROP TRIGGER IF EXISTS update_progress_milestones_updated_at ON progress_milestones;
DROP TRIGGER IF EXISTS update_progress_risks_updated_at ON progress_risks;
DROP TRIGGER IF EXISTS update_progress_alerts_updated_at ON progress_alerts;

-- トリガー関数の削除
DROP FUNCTION IF EXISTS update_updated_at();

-- テーブルの削除
DROP TABLE IF EXISTS progress_reports;
DROP TABLE IF EXISTS progress_alerts;
DROP TABLE IF EXISTS progress_risks;
DROP TABLE IF EXISTS progress_milestones;
DROP TABLE IF EXISTS progress_tasks;

-- 列挙型の削除
DROP TYPE IF EXISTS alert_type;
DROP TYPE IF EXISTS risk_severity;
DROP TYPE IF EXISTS task_status; 