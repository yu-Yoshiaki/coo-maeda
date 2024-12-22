import type { ScheduleAnalysisResult } from "./types"
import { openai } from "@/lib/openai"
import {
  dateTimeAnalysisPrompt,
  scheduleAnalysisPrompt,
  scheduleProposalPrompt,
} from "./prompts"
import { formatToISOString } from "./utils/dateTime"
import { parseScheduleAnalysis } from "./utils/parser"
import { validateInput, validateSchedule } from "./utils/validator"

/**
 * スケジュールの自然言語解析
 */
export async function analyzeSchedule(text: string): Promise<ScheduleAnalysisResult> {
  // 入力バリデーション
  const inputValidation = validateInput(text)
  if (!inputValidation.isValid) {
    throw new Error(inputValidation.error)
  }

  try {
    // OpenAI APIを呼び出してスケジュール情報を抽出
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: scheduleAnalysisPrompt.systemPrompt,
        },
        {
          role: "user",
          content: `${scheduleAnalysisPrompt.userPrompt}\n${text}`,
        },
      ],
      temperature: scheduleAnalysisPrompt.temperature,
      max_tokens: scheduleAnalysisPrompt.maxTokens,
      response_format: { type: "json_object" },
    })

    // 結果をパース
    const result = parseScheduleAnalysis(
      completion.choices[0]?.message?.content || "",
    )

    // バリデーション
    const validation = validateSchedule(result)
    if (!validation.isValid) {
      throw new Error(validation.errors.join("\n"))
    }

    return result
  }
  catch (error) {
    if (error instanceof Error && error.message.includes("必須フィールド")) {
      throw error
    }
    throw new Error(
      `予定の解析に失敗しました: ${
        error instanceof Error ? error.message : "不明なエラー"
      }`,
    )
  }
}

/**
 * スケジュールの提案生成
 */
export async function proposeSchedule(
  text: string,
  existingSchedules: ScheduleAnalysisResult[],
): Promise<
    Array<{
      startDate: string
      endDate: string
      reason: string
    }>
  > {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: scheduleProposalPrompt.systemPrompt,
        },
        {
          role: "user",
          content: `${
            scheduleProposalPrompt.userPrompt
          }\n\n要望: ${text}\n\n既存の予定:\n${JSON.stringify(
            existingSchedules,
            null,
            2,
          )}`,
        },
      ],
      temperature: scheduleProposalPrompt.temperature,
      max_tokens: scheduleProposalPrompt.maxTokens,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}")
    return result.proposals || []
  }
  catch (error) {
    throw new Error(
      `スケジュールの提案生成に失敗しました: ${
        error instanceof Error ? error.message : "不明なエラー"
      }`,
    )
  }
}

/**
 * 日時表現の解析
 */
export async function analyzeDateTimeExpression(
  text: string,
): Promise<{
    startDate: string
    endDate: string
    isAllDay: boolean
  }> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: dateTimeAnalysisPrompt.systemPrompt,
        },
        {
          role: "user",
          content: `${dateTimeAnalysisPrompt.userPrompt}\n${text}`,
        },
      ],
      temperature: dateTimeAnalysisPrompt.temperature,
      max_tokens: dateTimeAnalysisPrompt.maxTokens,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}")
    if (!result.startDate || !result.endDate) {
      throw new Error("日時の解析に失敗しました")
    }

    // 日時文字列をISOString形式に変換
    return {
      startDate: formatToISOString(result.startDate),
      endDate: formatToISOString(result.endDate),
      isAllDay: result.isAllDay || false,
    }
  }
  catch (error) {
    throw new Error(
      `日時表現の解析に失敗しました: ${
        error instanceof Error ? error.message : "不明なエラー"
      }`,
    )
  }
}
