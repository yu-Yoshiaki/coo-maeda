import type { Config } from "jest"
import nextJest from "next/jest"

const createJestConfig = nextJest({
  // next.config.jsとテスト環境用の.envファイルが配置されたディレクトリをセット
  dir: "./",
})

// Jestのカスタム設定を設置する場所
const customJestConfig: Config = {
  // テストファイルのパターンを指定
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  // テスト環境を指定
  testEnvironment: "jest-environment-jsdom",
  // テストの前に実行するセットアップファイル
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // モジュール名のエイリアスを設定
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // カバレッジの設定
  collectCoverageFrom: [
    "features/**/*.{ts,tsx}",
    "!features/**/*.d.ts",
    "!features/**/index.ts",
  ],
}

// createJestConfigを定義することによって、本ファイルで定義された設定がNext.jsの設定に反映される
export default createJestConfig(customJestConfig)
