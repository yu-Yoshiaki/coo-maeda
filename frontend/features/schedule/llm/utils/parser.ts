import type { DateTimeInfo, ScheduleAnalysisResult, ScheduleInfo } from "../types"
import { formatToISOString, resolveRelativeDateTime } from "./dateTime"

export function parseScheduleResponse(response: any): ScheduleInfo {
  return {
    title: response.title,
    description: response.description,
    startDate: formatToISOString(response.startDate),
    endDate: formatToISOString(response.endDate),
    isAllDay: response.isAllDay,
    location: response.location,
    participants: response.participants,
    reminders: response.reminders,
    recurrence: response.recurrence,
  }
}

export function parseDateTimeResponse(response: any): DateTimeInfo {
  const startDate = new Date(response.startDate)
  const endDate = new Date(response.endDate)
  return {
    startDate,
    endDate,
    isAllDay: response.isAllDay,
  }
}

/**
 * LLMの出力をパースしてスケジュール情報を抽出
 */
export function parseScheduleAnalysis(content: string): ScheduleAnalysisResult {
  try {
    const result = JSON.parse(content)

    // 必須フィールドの存在チェック
    if (!result.title || !result.startDate || !result.endDate) {
      throw new Error("必須フィールドが不足しています")
    }

    // 日時の正規化
    const startDate = formatToISOString(result.startDate)
    const endDate = formatToISOString(result.endDate)

    return {
      title: result.title,
      startDate,
      endDate,
      location: result.location,
      description: result.description,
      isAllDay: result.isAllDay ?? false,
    }
  }
  catch (error) {
    throw new Error(
      `スケジュール情報のパースに失敗しました: ${
        error instanceof Error ? error.message : "不明なエラー"
      }`,
    )
  }
}

/**
 * 日時表現をパースして標準形式に変換
 */
export function parseDateTimeExpression(expression: string): {
  startDate: string
  endDate: string
  isAllDay: boolean
} {
  // 終日イベントのパターン
  if (expression.includes("終日")) {
    const date = resolveRelativeDateTime(new Date(), expression)
    return {
      startDate: formatToISOString(date.toISOString().split("T")[0]),
      endDate: formatToISOString(date.toISOString().split("T")[0]),
      isAllDay: true,
    }
  }

  // 開始・終了時刻を含むパターン
  const startDate = resolveRelativeDateTime(new Date(), expression)
  const duration = expression.match(/(\d+)時間/)
  const endDate = duration
    ? new Date(startDate.getTime() + Number.parseInt(duration[1], 10) * 60 * 60 * 1000)
    : new Date(startDate.getTime() + 60 * 60 * 1000) // デフォルト1時間

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isAllDay: false,
  }
}
