import type { BasePrompt } from "../types"
import { createOpenAIClient, handleOpenAIError } from "../config"

/**
 * プロンプトを解析して応答を取得
 */
export async function analyze(prompt: BasePrompt): Promise<string> {
  try {
    const api = createOpenAIClient()
    const response = await api.chat.completions.create({
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      model: "gpt-4o-mini",
      temperature: 1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    return content
  }
  catch (error) {
    throw handleOpenAIError(error)
  }
}

/**
 * プロンプトを解析してJSON形式で応答を取得
 */
export async function analyzeJSON<T>(prompt: BasePrompt): Promise<T> {
  const response = await analyze(prompt)
  try {
    return JSON.parse(response) as T
  }
  catch {
    throw new Error("Failed to parse JSON response")
  }
}
