-- 進捗管理機能のためのテーブルを作成

-- タスクテーブル
CREATE TYPE task_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');

CREATE TABLE progress_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'NOT_STARTED',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_to UUID[] NOT NULL DEFAULT '{}',
  dependencies UUID[] NOT NULL DEFAULT '{}',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT valid_dates CHECK (start_date <= due_date)
);

-- マイルストーンテーブル
CREATE TABLE progress_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  tasks UUID[] NOT NULL DEFAULT '{}',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status task_status NOT NULL DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- リスクテーブル
CREATE TYPE risk_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE progress_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity risk_severity NOT NULL DEFAULT 'LOW',
  impact TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  related_tasks UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- アラートテーブル
CREATE TYPE alert_type AS ENUM ('DELAY', 'RISK', 'MILESTONE', 'DEPENDENCY');

CREATE TABLE progress_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type alert_type NOT NULL,
  message TEXT NOT NULL,
  task_id UUID REFERENCES progress_tasks(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 進捗レポートテーブル
CREATE TABLE progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  overall_progress INTEGER NOT NULL CHECK (overall_progress >= 0 AND overall_progress <= 100),
  milestones UUID[] NOT NULL DEFAULT '{}',
  tasks UUID[] NOT NULL DEFAULT '{}',
  risks UUID[] NOT NULL DEFAULT '{}',
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX progress_tasks_status_idx ON progress_tasks(status);
CREATE INDEX progress_tasks_due_date_idx ON progress_tasks(due_date);
CREATE INDEX progress_tasks_progress_idx ON progress_tasks(progress);
CREATE INDEX progress_milestones_due_date_idx ON progress_milestones(due_date);
CREATE INDEX progress_milestones_progress_idx ON progress_milestones(progress);
CREATE INDEX progress_risks_severity_idx ON progress_risks(severity);
CREATE INDEX progress_alerts_is_read_idx ON progress_alerts(is_read);
CREATE INDEX progress_alerts_created_at_idx ON progress_alerts(created_at);

-- RLSポリシーの設定
ALTER TABLE progress_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

-- タスクのポリシー
CREATE POLICY "タスクの参照は全員可能" ON progress_tasks
  FOR SELECT USING (true);

CREATE POLICY "タスクの作成は認証済みユーザーのみ可能" ON progress_tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "タスクの更新は作成者のみ可能" ON progress_tasks
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "タスクの削除は作成者のみ可能" ON progress_tasks
  FOR DELETE USING (auth.uid() = created_by);

-- マイルストーンのポリシー
CREATE POLICY "マイルストーンの参照は全員可能" ON progress_milestones
  FOR SELECT USING (true);

CREATE POLICY "マイルストーンの作成は認証済みユーザーのみ可能" ON progress_milestones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "マイルストーンの更新は作成者のみ可能" ON progress_milestones
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "マイルストーンの削除は作成者のみ可能" ON progress_milestones
  FOR DELETE USING (auth.uid() = created_by);

-- リスクのポリシー
CREATE POLICY "リスクの参照は全員可能" ON progress_risks
  FOR SELECT USING (true);

CREATE POLICY "リスクの作成は認証済みユーザーのみ可能" ON progress_risks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "リスクの更新は作成者のみ可能" ON progress_risks
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "リスクの削除は作成者のみ可能" ON progress_risks
  FOR DELETE USING (auth.uid() = created_by);

-- アラートのポリシー
CREATE POLICY "アラートの参照は全員可能" ON progress_alerts
  FOR SELECT USING (true);

CREATE POLICY "アラートの作成は認証済みユーザーのみ可能" ON progress_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "アラートの更新は作成者のみ可能" ON progress_alerts
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "アラートの削除は作成者のみ可能" ON progress_alerts
  FOR DELETE USING (auth.uid() = created_by);

-- 進捗レポートのポリシー
CREATE POLICY "進捗レポートの参照は全員可能" ON progress_reports
  FOR SELECT USING (true);

CREATE POLICY "進捗レポートの作成は認証済みユーザーのみ可能" ON progress_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "進捗レポートの更新は作成者のみ可能" ON progress_reports
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "進捗レポートの削除は作成者のみ可能" ON progress_reports
  FOR DELETE USING (auth.uid() = created_by);

-- トリガー関数の作成
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新日時の自動更新トリガーを設定
CREATE TRIGGER update_progress_tasks_updated_at
  BEFORE UPDATE ON progress_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_milestones_updated_at
  BEFORE UPDATE ON progress_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_risks_updated_at
  BEFORE UPDATE ON progress_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_alerts_updated_at
  BEFORE UPDATE ON progress_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 