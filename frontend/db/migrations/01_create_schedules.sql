-- スケジュールテーブルの作成
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  location VARCHAR(200),
  participants TEXT[],
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RLSポリシーの設定
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- 作成者とスケジュール参加者のみが閲覧可能
CREATE POLICY "スケジュールの閲覧権限" ON schedules
  FOR SELECT
  USING (
    auth.uid() = created_by
    OR auth.uid()::text = ANY(participants)
  );

-- 作成者のみが編集・削除可能
CREATE POLICY "スケジュールの編集権限" ON schedules
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "スケジュールの削除権限" ON schedules
  FOR DELETE
  USING (auth.uid() = created_by);

-- 認証済みユーザーのみが作成可能
CREATE POLICY "スケジュールの作成権限" ON schedules
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 