import type OpenAI from "openai"
import type { BasePrompt } from "../prompts/business-plans"
import { OpenAIConfig, OpenAIError } from "../config"

/**
 * LLM分析サービス
 */
export class LLMAnalyzer {
  private openai: OpenAI
  private config: OpenAIConfig

  constructor() {
    this.config = OpenAIConfig.getInstance()
    this.openai = this.config.getApi()
  }

  /**
   * プロンプトを実行して結果を取得
   */
  public async analyze(prompt: BasePrompt): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.getConfig().model,
        messages: [
          {
            role: "system",
            content: prompt.systemPrompt,
          },
          {
            role: "user",
            content: prompt.userPrompt,
          },
        ],
        ...prompt.config,
      })

      if (!response.choices[0]?.message?.content) {
        throw new Error("No response from OpenAI")
      }

      return response.choices[0].message.content
    }
    catch (error) {
      throw OpenAIConfig.handleError(error)
    }
  }

  /**
   * ストリーミングでプロンプトを実行
   */
  public async *analyzeStream(
    prompt: BasePrompt,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.openai.chat.completions.create({
        model: this.config.getConfig().model,
        messages: [
          {
            role: "system",
            content: prompt.systemPrompt,
          },
          {
            role: "user",
            content: prompt.userPrompt,
          },
        ],
        ...prompt.config,
        stream: true,
      })

      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          yield chunk.choices[0].delta.content
        }
      }
    }
    catch (error) {
      throw OpenAIConfig.handleError(error)
    }
  }

  /**
   * 複数のプロンプトを順次実行
   */
  public async analyzeSequence(
    prompts: BasePrompt[],
  ): Promise<string[]> {
    const results: string[] = []
    for (const prompt of prompts) {
      const result = await this.analyze(prompt)
      results.push(result)
    }
    return results
  }

  /**
   * プロンプトの実行結果をJSON形式で取得
   */
  public async analyzeJSON<T>(prompt: BasePrompt): Promise<T> {
    const result = await this.analyze(prompt)
    try {
      return JSON.parse(result) as T
    }
    catch {
      throw new Error("Failed to parse JSON response")
    }
  }
}
