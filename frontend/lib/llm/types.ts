import type { OpenAIConfigType } from "./config"

/**
 * チャットメッセージの型定義
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: string
}

/**
 * チャット履歴の型定義
 */
export interface ChatHistory {
  messages: ChatMessage[]
  metadata?: Record<string, unknown>
}

/**
 * プロンプトの基本型定義
 */
export interface BasePrompt {
  systemPrompt: string
  userPrompt: string
  config?: Partial<OpenAIConfigType>
}
