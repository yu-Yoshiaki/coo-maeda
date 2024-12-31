# COO 前田くん AI 操作フロー定義書

## 1. 基本操作フロー

### 1.1 チャットベースの操作

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Chat as チャットUI
    participant AI as AI処理
    participant DB as データベース

    User->>Chat: メッセージ入力
    Chat->>AI: 意図解析
    AI->>DB: コンテキスト取得
    DB-->>AI: コンテキスト
    AI->>AI: 応答生成
    AI-->>Chat: 応答表示
    opt アクション実行
        AI->>DB: アクション実行
        DB-->>Chat: 実行結果表示
    end
```

### 1.2 サイドメニュー操作

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Menu as サイドメニュー
    participant Chat as チャットUI
    participant DB as データベース

    User->>Menu: メニュー表示
    Menu-->>User: メニュー一覧
    User->>Menu: 項目選択
    Menu->>Chat: コンテキスト設定
    Chat->>DB: 関連データ取得
    DB-->>Chat: データ表示
```

## 2. 機能別フロー

### 2.1 タスク管理

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Chat as チャットUI
    participant AI as AI処理
    participant DB as データベース

    User->>Chat: タスク関連の指示
    Chat->>AI: 意図解析
    AI->>DB: タスク操作
    DB-->>Chat: 結果表示
    opt タスク一覧
        User->>Chat: 一覧表示要求
        Chat->>DB: タスク取得
        DB-->>Chat: タスク一覧表示
    end
```

### 2.2 スケジュール管理

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Chat as チャットUI
    participant AI as AI処理
    participant Calendar as カレンダーAPI

    User->>Chat: 予定関連の指示
    Chat->>AI: 意図解析
    AI->>Calendar: 予定確認/登録
    Calendar-->>Chat: 結果表示
    opt カレンダー表示
        User->>Chat: カレンダー表示要求
        Chat->>Calendar: 予定取得
        Calendar-->>Chat: カレンダー表示
    end
```

### 2.3 KPI 管理

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Chat as チャットUI
    participant AI as AI処理
    participant DB as データベース

    User->>Chat: KPI関連の指示
    Chat->>AI: 意図解析
    AI->>DB: データ分析
    DB-->>Chat: 分析結果表示
    opt グラフ表示
        Chat->>Chat: グラフ生成
        Chat-->>User: グラフ表示
    end
```

### 2.4 事業計画管理

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Chat as チャットUI
    participant AI as AI処理
    participant Plan as 事業計画処理
    participant DB as データベース

    User->>Chat: 事業計画の説明
    Chat->>AI: 意図解析・構造化
    AI->>Plan: 計画生成
    Plan->>DB: 計画保存
    DB-->>Chat: 構造化プラン表示

    opt リソース分析
        AI->>Plan: リソース要件分析
        Plan->>DB: リソース登録
        DB-->>Chat: リソース表示
    end

    opt リスク分析
        AI->>Plan: リスク分析
        Plan->>DB: リスク登録
        DB-->>Chat: リスク・対策表示
    end
```

## 3. 状態遷移

### 3.1 チャットコンテキスト

```mermaid
stateDiagram-v2
    [*] --> 通常会話
    通常会話 --> タスク管理: タスク関連の指示
    通常会話 --> スケジュール管理: 予定関連の指示
    通常会話 --> KPI確認: KPI関連の指示
    通常会話 --> 事業計画管理: 事業計画関連の指示
    タスク管理 --> 通常会話: 完了
    スケジュール管理 --> 通常会話: 完了
    KPI確認 --> 通常会話: 完了
    事業計画管理 --> 通常会話: 完了
```

### 3.2 サイドメニュー状態

```mermaid
stateDiagram-v2
    [*] --> 閉じた状態
    閉じた状態 --> 開いた状態: メニュー表示
    開いた状態 --> 閉じた状態: メニュー非表示
    開いた状態 --> タスク一覧: タスク選択
    開いた状態 --> カレンダー: カレンダー選択
    開いた状態 --> KPIダッシュボード: KPI選択
```

### 3.2 事業計画状態

```mermaid
stateDiagram-v2
    [*] --> 計画中
    計画中 --> 実行中: 計画承認
    実行中 --> 完了: 目標達成
    実行中 --> 中断: 一時停止
    中断 --> 実行中: 再開
    実行中 --> 中止: 中止決定
    中断 --> 中止: 中止決定
```

## 4. エラーハンドリング

### 4.1 入力エラー

1. 不明な指示の場合

   - AI が明確化を要求
   - 選択肢を提示

2. 必要情報の不足
   - AI が追加情報を要求
   - 具体例を提示

### 4.2 処理エラー

1. 実行エラー

   - エラー内容をわかりやすく表示
   - 代替案を提示

2. 権限エラー
   - 必要な権限を説明
   - 取得方法を案内

## 5. UI 表示ルール

### 5.1 メッセージ表示

- ユーザーメッセージ: 右寄せ、青系の背景
- AI メッセージ: 左寄せ、グレー系の背景
- システムメッセージ: 中央寄せ、薄い背景
- 事業計画表示: 構造化されたカード形式

### 5.2 アクション表示

- 実行中: プログレスインジケータ
- 完了: 緑のチェックマーク
- エラー: 赤の警告アイコン
- 計画フェーズ: 進捗バーとステータスアイコン

### 5.3 データ表示

- タスク: カード形式
- スケジュール: タイムライン形式
- KPI: グラフ/数値表示
- 事業計画:
  - フェーズ: ガントチャート
  - リソース: テーブル/グラフ
  - リスク: マトリックス表示

## 6. レスポンシブ対応

### 6.1 モバイル表示

- チャット中心の単一カラム
- スワイプでメニュー表示
- タップで詳細表示

### 6.2 デスクトップ表示

- チャット + サイドメニュー
- ドラッグ&ドロップ対応
- ホバーで詳細表示

## 7. ショートカット

### 7.1 キーボード操作

- Enter: メッセージ送信
- Ctrl + /: メニュー表示/非表示
- Esc: モーダル閉じる

### 7.2 ジェスチャー

- スワイプ右: メニュー表示
- スワイプ左: メニュー非表示
- ダブルタップ: 詳細表示
