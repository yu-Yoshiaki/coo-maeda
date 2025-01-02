-- business_plansテーブルにis_deletedカラムを追加
ALTER TABLE business_plans
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- インデックスを追加（検索パフォーマンス向上のため）
CREATE INDEX idx_business_plans_is_deleted ON business_plans(is_deleted);

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."business_plans";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."business_plans";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."business_plans";

-- 新しいポリシーを作成
CREATE POLICY "Enable read access for all users" 
ON "public"."business_plans"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Enable insert for authenticated users" 
ON "public"."business_plans"
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" 
ON "public"."business_plans"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 