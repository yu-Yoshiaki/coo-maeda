# 操作フロー定義

## 1. テンプレート選択から LP 生成まで

```mermaid
sequenceDiagram
    actor User
    participant Template as テンプレート一覧
    participant Editor as エディター
    participant AI as AI生成エンジン
    participant Export as エクスポート

    User->>Template: テンプレート検索
    Template->>Template: フィルタリング
    Template-->>User: テンプレート表示

    User->>Template: テンプレート選択
    Template->>Editor: テンプレート読み込み
    Editor-->>User: エディター画面表示

    User->>AI: プロンプト入力
    AI->>AI: コンテンツ生成
    AI-->>Editor: 生成結果反映
    Editor-->>User: プレビュー表示

    User->>Editor: カスタマイズ
    Editor-->>User: リアルタイムプレビュー

    User->>Export: エクスポート開始
    Export->>Export: ファイル生成
    Export-->>User: ダウンロード完了
```

## 2. ユーザー認証フロー

```mermaid
sequenceDiagram
    actor User
    participant Auth as 認証画面
    participant API as 認証API
    participant DB as データベース

    User->>Auth: ログイン情報入力
    Auth->>API: 認証リクエスト
    API->>DB: ユーザー情報照会
    DB-->>API: ユーザー情報返却
    API-->>Auth: 認証結果

    alt 認証成功
        Auth->>User: ダッシュボード表示
    else 認証失敗
        Auth-->>User: エラーメッセージ表示
    end
```

## 3. AI コンテンツ生成フロー

```mermaid
sequenceDiagram
    actor User
    participant Editor as エディター
    participant AI as AI生成エンジン
    participant History as 生成履歴

    User->>Editor: プロンプト入力
    Editor->>AI: 生成リクエスト

    AI->>AI: コンテキスト解析
    AI->>AI: コンテンツ生成

    AI-->>Editor: 生成結果返却
    Editor-->>User: プレビュー表示

    alt 結果採用
        User->>Editor: 生成結果適用
        Editor->>History: 履歴保存
    else 再生成
        User->>Editor: プロンプト修正
        Editor->>AI: 再生成リクエスト
    end
```

## 4. カスタマイズフロー

```mermaid
sequenceDiagram
    actor User
    participant Editor as エディター
    participant Preview as プレビュー
    participant History as 変更履歴

    User->>Editor: 編集モード開��

    loop カスタマイズ
        User->>Editor: スタイル変更
        Editor->>Preview: リアルタイム更新
        Preview-->>User: プレビュー表示
        Editor->>History: 変更履歴保存
    end

    User->>Editor: 保存
    Editor->>History: バージョン作成
    History-->>User: 保存完了通知
```

## 5. エクスポート/デプロイフロー

```mermaid
sequenceDiagram
    actor User
    participant Export as エクスポート画面
    participant Build as ビルドシステム
    participant Deploy as デプロイサービス

    User->>Export: エクスポート設定
    Export->>Build: ビルド開始

    Build->>Build: アセット最適化
    Build->>Build: ファイル生成

    alt 直接ダウンロード
        Build-->>User: ファイル提供
    else デプロイ
        Build->>Deploy: デプロイ開始
        Deploy->>Deploy: 環境構築
        Deploy->>Deploy: サイト公開
        Deploy-->>User: 公開URL提供
    end
```

## 6. 設定変更フロー

```mermaid
sequenceDiagram
    actor User
    participant Settings as 設定画面
    participant Validate as 検証
    participant DB as データベース

    User->>Settings: 設定変更
    Settings->>Validate: 入力検証

    alt 検証成功
        Validate->>DB: 設定保存
        DB-->>User: 完了通知
    else 検証失敗
        Validate-->>User: エラー表示
    end
```

## 注意事項

1. エラーハンドリング

   - 各フローでエラー発生時の代替フローを用意
   - ユーザーへの適切なフィードバック提供
   - 自動リカバリーの実装

2. パフォーマンス最適化

   - 長時間処理の進捗表示
   - バックグラウンド処理の活用
   - キャッシュの適切な利用

3. セキュリティ考慮
   - セッション管理
   - 権限チェック
   - 入力値バリデーション
