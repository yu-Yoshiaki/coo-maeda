import type { ScheduleAnalysisResult } from "../types"

/**
 * スケジュール情報のバリデーション
 */
export function validateSchedule(schedule: ScheduleAnalysisResult): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 必須フィールドのチェック
  if (!schedule.title?.trim()) {
    errors.push("タイトルは必須です")
  }
  if (!schedule.startDate) {
    errors.push("開始日時は必須です")
  }
  if (!schedule.endDate) {
    errors.push("終了日時は必須です")
  }

  // 日時の妥当性チェック
  try {
    const startDate = new Date(schedule.startDate)
    const endDate = new Date(schedule.endDate)

    if (Number.isNaN(startDate.getTime())) {
      errors.push("開始日時が不正です")
    }
    if (Number.isNaN(endDate.getTime())) {
      errors.push("終了日時が不正です")
    }
    if (startDate > endDate) {
      errors.push("終了日時は開始日時より後である必要があります")
    }
  }
  catch (error) {
    errors.push("日時の形式が不正です")
  }

  // 文字数制限チェック
  if (schedule.title && schedule.title.length > 100) {
    errors.push("タイトルは100文字以内である必要があります")
  }
  if (schedule.description && schedule.description.length > 1000) {
    errors.push("説明は1000文字以内である必要があります")
  }
  if (schedule.location && schedule.location.length > 100) {
    errors.push("場所は100文字以内である必要があります")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 入力テキストの事前バリデーション
 */
export function validateInput(text: string): {
  isValid: boolean
  error?: string
} {
  if (!text?.trim()) {
    return {
      isValid: false,
      error: "テキストを入力してください",
    }
  }

  if (text.length > 1000) {
    return {
      isValid: false,
      error: "テキストは1000文字以内である必要があります",
    }
  }

  return {
    isValid: true,
  }
}
