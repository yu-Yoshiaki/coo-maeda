-- 進捗管理機能のテーブルを削除

-- 事前チェック
DO $$
BEGIN
  -- テーブルの存在確認
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'progress_tasks',
        'progress_milestones',
        'progress_risks',
        'progress_alerts',
        'progress_reports'
      )
  ) THEN
    RAISE EXCEPTION 'テーブルが存在しません。ロールバックを中止します。';
  END IF;

  -- データの存在確認
  IF EXISTS (
    SELECT 1 FROM progress_tasks
    UNION ALL
    SELECT 1 FROM progress_milestones
    UNION ALL
    SELECT 1 FROM progress_risks
    UNION ALL
    SELECT 1 FROM progress_alerts
    UNION ALL
    SELECT 1 FROM progress_reports
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'テーブルにデータが存在します。手動でのデータバックアップを推奨します。';
  END IF;
END $$;

-- トリガーの削除
DROP TRIGGER IF EXISTS update_progress_tasks_updated_at ON progress_tasks;
DROP TRIGGER IF EXISTS update_progress_milestones_updated_at ON progress_milestones;
DROP TRIGGER IF EXISTS update_progress_risks_updated_at ON progress_risks;
DROP TRIGGER IF EXISTS update_progress_alerts_updated_at ON progress_alerts;

-- RLSポリシーの削除
DROP POLICY IF EXISTS "タスクの参照は全員可能" ON progress_tasks;
DROP POLICY IF EXISTS "タスクの作成は認証済みユーザーのみ可能" ON progress_tasks;
DROP POLICY IF EXISTS "タスクの更新は作成者のみ可能" ON progress_tasks;
DROP POLICY IF EXISTS "タスクの削除は作成者のみ可能" ON progress_tasks;

DROP POLICY IF EXISTS "マイルストーンの参照は全員可能" ON progress_milestones;
DROP POLICY IF EXISTS "マイルストーンの作成は認証済みユーザーのみ可能" ON progress_milestones;
DROP POLICY IF EXISTS "マイルストーンの更新は作成者のみ可能" ON progress_milestones;
DROP POLICY IF EXISTS "マイルストーンの削除は作成者のみ可能" ON progress_milestones;

DROP POLICY IF EXISTS "リスクの参照は全員可能" ON progress_risks;
DROP POLICY IF EXISTS "リスクの作成は認証済みユーザーのみ可能" ON progress_risks;
DROP POLICY IF EXISTS "リスクの更新は作成者のみ可能" ON progress_risks;
DROP POLICY IF EXISTS "リスクの削除は作成者のみ可能" ON progress_risks;

DROP POLICY IF EXISTS "アラートの参照は全員可能" ON progress_alerts;
DROP POLICY IF EXISTS "アラートの作成は認証済みユーザーのみ可能" ON progress_alerts;
DROP POLICY IF EXISTS "アラートの更新は作成者のみ可能" ON progress_alerts;
DROP POLICY IF EXISTS "アラートの削除は作成者のみ可能" ON progress_alerts;

DROP POLICY IF EXISTS "進捗レポートの参照は全員可能" ON progress_reports;
DROP POLICY IF EXISTS "進捗レポートの作成は認証済みユーザーのみ可能" ON progress_reports;
DROP POLICY IF EXISTS "進捗レポートの更新は作成者のみ可能" ON progress_reports;
DROP POLICY IF EXISTS "進捗レポートの削除は作成者のみ可能" ON progress_reports;

-- インデックスの削除
DROP INDEX IF EXISTS progress_tasks_status_idx;
DROP INDEX IF EXISTS progress_tasks_due_date_idx;
DROP INDEX IF EXISTS progress_tasks_progress_idx;
DROP INDEX IF EXISTS progress_milestones_due_date_idx;
DROP INDEX IF EXISTS progress_milestones_progress_idx;
DROP INDEX IF EXISTS progress_risks_severity_idx;
DROP INDEX IF EXISTS progress_alerts_is_read_idx;
DROP INDEX IF EXISTS progress_alerts_created_at_idx;

-- トリガー関数の削除
DROP FUNCTION IF EXISTS update_updated_at();

-- テーブルの削除（依存関係を考慮した順序）
DROP TABLE IF EXISTS progress_reports;
DROP TABLE IF EXISTS progress_alerts;
DROP TABLE IF EXISTS progress_risks;
DROP TABLE IF EXISTS progress_milestones;
DROP TABLE IF EXISTS progress_tasks;

-- 列挙型の削除
DROP TYPE IF EXISTS alert_type;
DROP TYPE IF EXISTS risk_severity;
DROP TYPE IF EXISTS task_status; 