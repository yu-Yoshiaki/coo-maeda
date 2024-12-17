# コントリビューションガイド

## 開発環境のセットアップ

1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/infinite-lp-generator.git
cd infinite-lp-generator
```

2. 依存関係のインストール

```bash
cd frontend
npm install
```

3. 環境変数の設定

```bash
cp .env.example .env.local
# 必要な環境変数を設定
```

4. 開発サーバーの起動

```bash
npm run dev
```

## 開発ワークフロー

1. 新しい機能やバグ修正を開始する前に、最新の`main`ブランチから新しいブランチを作成

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

2. コミットメッセージの規約

- feat: 新機能
- fix: バグ修正
- docs: ドキュメントのみの変更
- style: コードの意味に影響を与えない変更
- refactor: バグ修正や機能追加を含まないコードの変更
- test: テストの追加や修正
- chore: ビルドプロセスやツールの変更

例:

```bash
git commit -m "feat: Add new template selection component"
```

3. プルリクエストの作成

- 変更内容の説明
- 関連する Issue への参照
- スクリーンショットや動画（UI 変更の場合）

## コーディング規約

1. TypeScript

- 型定義を明示的に記述
- `any`型の使用を避ける
- インターフェースを積極的に活用

2. React コンポーネント

- 関数コンポーネントを使用
- Hooks の命名規則に従う
- Props 型を明示的に定義

3. スタイリング

- TailwindCSS クラスを使用
- カスタムユーティリティの作成
- レスポンシブデザインの考慮

4. テスト

- ユニットテストの作成
- インテグレーションテストの作成
- E2E テストの作成（必要な場合）

## レビュープロセス

1. コードレビュー

- 機能要件の確認
- コーディング規約の遵守
- パフォーマンスの考慮
- セキュリティの確認

2. テスト

- 自動テストの実行
- 手動テストの実行
- クロスブラウザテスト

3. デプロイ

- ステージング環境でのテスト
- 本番環境へのデプロイ
- デプロイ後の確認

## ヘルプとサポート

- Issue 作成前に既存の Issue を確認
- 質問は Discussion セクションを使用
- バグ報告には再現手順を記載
- 機能提案には具体的なユースケースを記載
