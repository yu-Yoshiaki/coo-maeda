/* eslint-disable node/prefer-global/process */
import OpenAI from "openai"

/**
 * OpenAI APIの設定型定義
 */
export interface OpenAIConfigType {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  timeout: number
}

/**
 * OpenAI APIのエラー型定義
 */
export interface OpenAIError {
  code: string
  message: string
  type: "api_error" | "rate_limit" | "token_limit" | "timeout"
  original?: unknown
}

/**
 * デフォルトの設定値
 */
const DEFAULT_CONFIG: OpenAIConfigType = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4o-mini",
  maxTokens: 500,
  temperature: 1,
  timeout: 30000,
}

// シングルトンインスタンスを保持する変数
let instance: {
  config: OpenAIConfigType
  api: OpenAI
} | null = null

/**
 * OpenAI APIインスタンスを初期化して取得
 */
export function createOpenAIClient(config: Partial<OpenAIConfigType> = {}): OpenAI {
  if (typeof window !== "undefined") {
    throw new TypeError("OpenAI client can only be created on the server side")
  }

  if (!instance) {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config }
    if (!mergedConfig.apiKey) {
      throw new Error("OpenAI API key is not set")
    }

    instance = {
      config: mergedConfig,
      api: new OpenAI({
        apiKey: mergedConfig.apiKey,
      }),
    }
  }

  return instance.api
}

/**
 * 現在の設定を取得（APIキーを除く）
 */
export function getOpenAIConfig(): Omit<OpenAIConfigType, "apiKey"> {
  if (!instance) {
    throw new Error("OpenAI client has not been initialized")
  }

  const { apiKey: _, ...config } = instance.config
  return config
}

/**
 * エラーをOpenAIError型に変換
 */
export function handleOpenAIError(error: unknown): OpenAIError {
  if (error instanceof Error) {
    if ("response" in error) {
      return {
        code: "api_error",
        message: error.message,
        type: "api_error",
        original: error,
      }
    }
    return {
      code: error.name,
      message: error.message,
      type: "api_error",
      original: error,
    }
  }
  return {
    code: "unknown_error",
    message: "An unknown error occurred",
    type: "api_error",
    original: error,
  }
}

export default createOpenAIClient
