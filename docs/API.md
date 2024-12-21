# COO 前田くん AI API 仕様書

## 1. Supabase 認証 API

### 1.1 サインアップ

```typescript
// Supabaseの組み込み認証を使用
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      name: string,
      avatar_url: string,
    },
  },
});
```

### 1.2 ログイン

```typescript
// Supabaseの組み込み認証を使用
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string,
});
```

### 1.3 ログアウト

```typescript
// Supabaseの組み込み認証を使用
const { error } = await supabase.auth.signOut();
```

### 1.4 セッション管理

```typescript
// セッション取得
const {
  data: { session },
  error,
} = await supabase.auth.getSession();

// セッション更新
const {
  data: { session },
  error,
} = await supabase.auth.refreshSession();
```

## 2. チャット API

### 2.1 メッセージ送信

```typescript
// Edge Function経由でOpenAIと通信
POST /functions/v1/chat
Request:
{
  content: string;
  attachments?: {
    file_path: string;  // Supabase Storageのパス
    file_type: string;
  }[];
  context?: {
    previous_messages?: string[];
    metadata?: Record<string, any>;
  };
}

Response:
{
  message_id: string;
  content: string;
  created_at: string;
  attachments?: {
    id: string;
    file_path: string;
    file_type: string;
  }[];
}
```

### 2.2 チャット履歴取得

```typescript
// Supabase Queryを使用
const { data, error } = await supabase
  .from("chat_messages")
  .select(
    `
    id,
    content,
    role,
    created_at,
    attachments (
      id,
      file_path,
      file_type
    )
  `
  )
  .order("created_at", { ascending: false })
  .range(0, 49); // ページネーション

// リアルタイム購読
const subscription = supabase
  .channel("chat_messages")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "chat_messages",
  })
  .subscribe();
```

## 3. タスク API

### 3.1 タスク作成

```typescript
// Supabase Queryを使用
const { data, error } = await supabase
  .from("tasks")
  .insert({
    title: string,
    description: string,
    due_date: string,
    priority: number,
    metadata: Record<string, any>,
  })
  .select()
  .single();
```

### 3.2 タスク一覧取得

```typescript
// Supabase Queryを使用（フィルタリング付き）
const { data, error } = await supabase
  .from("tasks")
  .select()
  .eq("status", status)
  .gte("due_date", due_date_from)
  .lte("due_date", due_date_to)
  .order("priority", { ascending: false });

// リアルタイム購読
const subscription = supabase
  .channel("tasks")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "tasks",
  })
  .subscribe();
```

## 4. スケジュール API

### 4.1 予定作成

```typescript
// Supabase Queryを使用
const { data, error } = await supabase
  .from('schedules')
  .insert({
    title: string,
    description?: string,
    start_time: string,
    end_time: string,
    location?: string,
    attendees?: {
      email: string,
      name?: string
    }[],
    metadata?: Record<string, any>
  })
  .select()
  .single();
```

### 4.2 予定一覧取得

```typescript
// Supabase Queryを使用（関連データ取得付き）
const { data, error } = await supabase
  .from("schedules")
  .select(
    `
    *,
    attendees (*)
  `
  )
  .gte("start_time", start_date)
  .lte("end_time", end_date);

// リアルタイム購読
const subscription = supabase
  .channel("schedules")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "schedules",
  })
  .subscribe();
```

## 5. KPI API

### 5.1 KPI データ取得

```typescript
// Supabase Queryを使用（集計とトレンド取得）
const { data, error } = await supabase
  .from("kpis")
  .select(
    `
    *,
    kpi_histories (
      value,
      recorded_at
    )
  `
  )
  .eq("category", category)
  .gte("recorded_at", start_date)
  .lte("recorded_at", end_date);
```

### 5.2 KPI 更新

```typescript
// Supabase Queryを使用（トランザクション的な更新）
const { data, error } = await supabase.rpc("update_kpi", {
  p_kpi_id: string,
  p_value: number,
  p_recorded_at: string,
  p_metadata: Record<string, any>,
});
```

## 6. ファイル処理 API

### 6.1 ファイルアップロード

```typescript
// Supabase Storageを使用
const { data, error } = await supabase.storage
  .from("files")
  .upload(filePath, file, {
    contentType: string,
    metadata: {
      // カスタムメタデータ
    },
  });
```

### 6.2 ファイル分析

```typescript
// Edge Function経由で分析
POST /functions/v1/analyze-file
Request:
{
  file_path: string,  // Supabase Storageのパス
  analysis_type: "text" | "data" | "image",
  options?: Record<string, any>
}

Response:
{
  id: string;
  analysis_result: {
    type: string;
    content: any;
    metadata: Record<string, any>;
  };
  created_at: string;
}
```

## 7. データベースポリシー

### 7.1 Row Level Security (RLS)

```sql
-- チャットメッセージのポリシー
CREATE POLICY "ユーザーは自分のメッセージのみアクセス可能"
ON chat_messages
FOR ALL
USING (auth.uid() = user_id);

-- タスクのポリシー
CREATE POLICY "ユーザーは自分のタスクのみアクセス可能"
ON tasks
FOR ALL
USING (auth.uid() = user_id);

-- スケジュールのポリシー
CREATE POLICY "ユーザーは関連する予定のみアクセス可能"
ON schedules
FOR ALL
USING (
  auth.uid() = user_id OR
  auth.uid() IN (
    SELECT attendee_id
    FROM schedule_attendees
    WHERE schedule_id = id
  )
);
```

## 8. リアルタイム機能

### 8.1 購読設定

```typescript
// 複数テーブルの同時購読
const subscription = supabase
  .channel("db-changes")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "tasks",
  })
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "schedules",
  })
  .on("presence", { event: "sync" }, () => {
    // プレゼンス状態の同期
  })
  .subscribe();
```

## 9. Edge Functions

### 9.1 デプロイ設定

```bash
# Edge Functionsのデプロイ
supabase functions deploy chat
supabase functions deploy analyze-file
supabase functions deploy kpi-aggregation
```

## 10. 共通仕様

### 10.1 認証

- Supabase Auth 使用
- JWT トークンによる認証
- Row Level Security (RLS)による権限制御

### 10.2 データベース

- PostgreSQL 15
- PostGIS 拡張（位置情報）
- pgvector 拡張（ベクトル検索）

### 10.3 ストレージ

- Supabase Storage 使用
- バケット分離（public, private）
- セキュリティルールによるアクセス制御

### 10.4 パフォーマンス

- インデックス最適化
- キャッシュ戦略
- Connection Pooling
