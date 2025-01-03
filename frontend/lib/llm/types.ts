/**
 * チャットメッセージの型定義
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

/**
 * チャット履歴の型定義
 */
export interface ChatHistory {
  messages: ChatMessage[]
  metadata?: Record<string, unknown>
}
