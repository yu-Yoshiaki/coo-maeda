import type OpenAI from "openai"
import { OpenAIConfig } from "../config"

/**
 * チャットメッセージの型定義
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: Date
}

/**
 * チャット履歴の型定義
 */
export interface ChatHistory {
  messages: ChatMessage[]
  metadata?: Record<string, unknown>
}

/**
 * LLMチャットサービス
 */
export class LLMChat {
  private openai: OpenAI
  private config: OpenAIConfig
  private history: ChatHistory

  constructor(initialHistory?: ChatHistory) {
    this.config = OpenAIConfig.getInstance()
    this.openai = this.config.getApi()
    this.history = initialHistory || { messages: [] }
  }

  /**
   * メッセージを送信して応答を取得
   */
  public async sendMessage(
    content: string,
    systemPrompt?: string,
  ): Promise<string> {
    try {
      // システムプロンプトがある場合は追加
      if (systemPrompt) {
        this.history.messages.push({
          role: "system",
          content: systemPrompt,
          timestamp: new Date(),
        })
      }

      // ユーザーメッセージを追加
      this.history.messages.push({
        role: "user",
        content,
        timestamp: new Date(),
      })

      const response = await this.openai.chat.completions.create({
        model: this.config.getConfig().model,
        messages: this.history.messages.map(({ role, content }) => ({
          role,
          content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      })

      if (!response.choices[0]?.message?.content) {
        throw new Error("No response from OpenAI")
      }

      // アシスタントの応答を履歴に追加
      const assistantMessage = {
        role: "assistant" as const,
        content: response.choices[0].message.content,
        timestamp: new Date(),
      }
      this.history.messages.push(assistantMessage)

      return assistantMessage.content
    }
    catch (error) {
      throw OpenAIConfig.handleError(error)
    }
  }

  /**
   * ストリーミングでメッセージを送信
   */
  public async *sendMessageStream(
    content: string,
    systemPrompt?: string,
  ): AsyncGenerator<string, void, unknown> {
    try {
      if (systemPrompt) {
        this.history.messages.push({
          role: "system",
          content: systemPrompt,
          timestamp: new Date(),
        })
      }

      this.history.messages.push({
        role: "user",
        content,
        timestamp: new Date(),
      })

      const stream = await this.openai.chat.completions.create({
        model: this.config.getConfig().model,
        messages: this.history.messages.map(({ role, content }) => ({
          role,
          content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      })

      let assistantMessage = ""
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          assistantMessage += chunk.choices[0].delta.content
          yield chunk.choices[0].delta.content
        }
      }

      this.history.messages.push({
        role: "assistant",
        content: assistantMessage,
        timestamp: new Date(),
      })
    }
    catch (error) {
      throw OpenAIConfig.handleError(error)
    }
  }

  /**
   * チャット履歴を取得
   */
  public getHistory(): ChatHistory {
    return this.history
  }

  /**
   * チャット履歴をクリア
   */
  public clearHistory(): void {
    this.history = { messages: [] }
  }

  /**
   * チャット履歴を設定
   */
  public setHistory(history: ChatHistory): void {
    this.history = history
  }
}
