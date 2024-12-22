import OpenAI from "openai"

// OpenAI APIの設定
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env.OPENAI_API_KEY")
}

// OpenAIクライアントの作成
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// テスト用のモック
export const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
}
