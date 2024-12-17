# テスト駆動開発ガイド

## 概要

このプロジェクトでは、テスト駆動開発（TDD）を採用し、高品質なコードベースを維持します。
TDD サイクル（Red-Green-Refactor）に従い、テストファーストな開発を行います。

## テスト戦略

### 1. テストレベル

1. ユニットテスト

   - 対象: 個別のコンポーネント、関数、フック
   - ツール: Jest, React Testing Library
   - カバレッジ目標: 80%以上

2. 統合テスト

   - 対象: コンポーネント間の連携、API との通信
   - ツール: Jest, MSW (Mock Service Worker)
   - 重点: データフローの検証

3. E2E テスト
   - 対象: ユーザーシナリオ、主要フロー
   - ツール: Cypress
   - 範囲: クリティカルパスの網羅

### 2. テスト分類

1. コンポーネントテスト

   ```typescript
   // tests/components/Button.test.tsx
   describe("Button", () => {
     it("renders children correctly", () => {
       render(<Button>Click me</Button>);
       expect(screen.getByText("Click me")).toBeInTheDocument();
     });

     it("handles click events", () => {
       const onClick = jest.fn();
       render(<Button onClick={onClick}>Click me</Button>);
       userEvent.click(screen.getByText("Click me"));
       expect(onClick).toHaveBeenCalled();
     });
   });
   ```

2. フックテスト

   ```typescript
   // tests/hooks/useTemplates.test.ts
   describe("useTemplates", () => {
     it("fetches templates successfully", async () => {
       const { result } = renderHook(() => useTemplates());
       await waitFor(() => {
         expect(result.current.templates).toHaveLength(2);
       });
     });

     it("handles error states", async () => {
       server.use(
         rest.get("/api/templates", (req, res, ctx) => {
           return res(ctx.status(500));
         })
       );
       const { result } = renderHook(() => useTemplates());
       await waitFor(() => {
         expect(result.current.error).toBeTruthy();
       });
     });
   });
   ```

3. ユーティリティテスト

   ```typescript
   // tests/utils/validation.test.ts
   describe("validateTemplate", () => {
     it("validates template structure", () => {
       const template = {
         name: "Test Template",
         content: "<div>Test</div>",
       };
       expect(validateTemplate(template)).toBe(true);
     });

     it("rejects invalid templates", () => {
       const template = {
         name: "",
       };
       expect(validateTemplate(template)).toBe(false);
     });
   });
   ```

### 3. テストカバレッジ要件

1. 必須カバレッジ対象

   - コンポーネントの Props
   - イベントハンドラ
   - 条件分岐
   - エラー処理
   - 非同期処理

2. カバレッジ目標
   - Statements: 80%以上
   - Branches: 80%以上
   - Functions: 80%以上
   - Lines: 80%以上

## 開発フロー

### 1. 新機能開発

1. テスト作成（Red）

   ```bash
   # テストファイルの作成
   touch tests/components/NewFeature.test.tsx

   # テストの実装
   describe('NewFeature', () => {
     it('implements required behavior', () => {
       // テストケース
     })
   })
   ```

2. 実装（Green）

   ```bash
   # 実装ファイルの作成
   touch components/NewFeature.tsx

   # テストが通るように実装
   export const NewFeature = () => {
     // 実装
   }
   ```

3. リファクタリング（Refactor）
   ```typescript
   // コードの改善
   export const NewFeature = () => {
     // リファクタリング後の実装
   };
   ```

### 2. バグ修正

1. 再現テスト作成

   ```typescript
   it("reproduces the bug", () => {
     // バグを再現するテストケース
   });
   ```

2. 修正実装

   ```typescript
   // バグ修正の実装
   ```

3. 回帰テスト追加
   ```typescript
   it("prevents regression", () => {
     // 回帰を防ぐテストケース
   });
   ```

## テストプラクティス

### 1. テストの構造

```typescript
describe("ComponentName", () => {
  // セットアップ
  beforeEach(() => {
    // テストの前準備
  });

  // 正常系テスト
  describe("when used normally", () => {
    it("behaves as expected", () => {
      // テストケース
    });
  });

  // エラー系テスト
  describe("when encountering errors", () => {
    it("handles errors gracefully", () => {
      // テストケース
    });
  });
});
```

### 2. モックの使用

1. API モック

   ```typescript
   // tests/mocks/api.ts
   export const mockApi = {
     getTemplates: jest.fn(),
   };
   ```

2. コンポーネントモック
   ```typescript
   // tests/mocks/components.tsx
   jest.mock("components/ComplexComponent", () => {
     return {
       ComplexComponent: () => <div>Mocked Component</div>,
     };
   });
   ```

### 3. テストユーティリティ

1. カスタムレンダラー

   ```typescript
   // tests/utils/render.tsx
   export const renderWithProviders = (
     ui: React.ReactElement,
     options = {}
   ) => {
     return render(<Providers>{ui}</Providers>, options);
   };
   ```

2. テストヘルパー
   ```typescript
   // tests/utils/helpers.ts
   export const waitForLoadingToFinish = () =>
     waitFor(() =>
       expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
     );
   ```

## レビュー基準

### 1. テスト品質チェック

- [ ] テストが理解しやすく記述されている
- [ ] テストが独立して実行可能
- [ ] テストが適切にモック化されている
- [ ] エッジケースが考慮されている

### 2. 実装品質チェック

- [ ] テストが意図した動作を検証している
- [ ] 不必要な実装が含まれていない
- [ ] パフォーマンスが考慮されている
- [ ] エラーハンドリングが適切

### 3. メンテナンス性チェック

- [ ] テストが壊れやすくない
- [ ] テストが実装の詳細に依存していない
- [ ] テストが適切に文書化されている
- [ ] テストが保守しやすい
