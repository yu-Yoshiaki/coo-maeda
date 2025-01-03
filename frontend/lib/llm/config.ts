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
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  model: "gpt-4",
  maxTokens: 2000,
  temperature: 0.7,
  timeout: 30000,
}

/**
 * OpenAI API設定クラス
 */
export class OpenAIConfig {
  private static instance: OpenAIConfig
  private config: OpenAIConfigType
  private api: OpenAI

  private constructor(config: Partial<OpenAIConfigType> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.api = new OpenAI({
      apiKey: this.config.apiKey,
    })
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(config?: Partial<OpenAIConfigType>): OpenAIConfig {
    if (!OpenAIConfig.instance) {
      OpenAIConfig.instance = new OpenAIConfig(config)
    }
    return OpenAIConfig.instance
  }

  /**
   * OpenAI APIインスタンスを取得
   */
  public getApi(): OpenAI {
    return this.api
  }

  /**
   * 現在の設定を取得
   */
  public getConfig(): OpenAIConfigType {
    return this.config
  }

  /**
   * エラーをOpenAIError型に変換
   */
  public static handleError(error: unknown): OpenAIError {
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
}

export default OpenAIConfig
