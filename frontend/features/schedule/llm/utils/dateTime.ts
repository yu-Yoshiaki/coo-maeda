import {
  addDays,
  addHours,
  addMinutes,
  endOfDay,
  format,
  parse,
  startOfDay,
} from "date-fns"
import { ja } from "date-fns/locale"

/**
 * 相対的な日時表現を絶対的な日時に変換
 */
export function resolveRelativeDateTime(
  baseDate: Date,
  relativeExpression: string,
): Date {
  const now = new Date()

  // 「今日」「明日」などの処理
  if (relativeExpression.includes("今日")) {
    return startOfDay(now)
  }
  if (relativeExpression.includes("明日")) {
    return startOfDay(addDays(now, 1))
  }
  if (relativeExpression.includes("明後日")) {
    return startOfDay(addDays(now, 2))
  }

  // 「1時間後」「30分後」などの処理
  const hourMatch = relativeExpression.match(/(\d+)時間後/)
  if (hourMatch) {
    return addHours(now, Number.parseInt(hourMatch[1], 10))
  }

  const minuteMatch = relativeExpression.match(/(\d+)分後/)
  if (minuteMatch) {
    return addMinutes(now, Number.parseInt(minuteMatch[1], 10))
  }

  return baseDate
}

/**
 * 日時文字列をISOString形式に変換
 */
export function formatToISOString(dateStr: string, timeStr?: string): string {
  const date = parse(dateStr, "yyyy-MM-dd", new Date())
  if (!timeStr) {
    return startOfDay(date).toISOString()
  }

  const dateTime = parse(
    `${dateStr} ${timeStr}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  )
  return dateTime.toISOString()
}

/**
 * 日時の範囲を文字列で表現
 */
export function formatDateTimeRange(
  startDate: Date,
  endDate: Date,
  isAllDay: boolean,
): string {
  if (isAllDay) {
    return `${format(startDate, "M月d日", { locale: ja })}（終日）`
  }

  const isSameDay = format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")
  if (isSameDay) {
    return `${format(startDate, "M月d日 H:mm", { locale: ja })}～${format(
      endDate,
      "H:mm",
      { locale: ja },
    )}`
  }

  return `${format(startDate, "M月d日 H:mm", { locale: ja })}～${format(
    endDate,
    "M月d日 H:mm",
    { locale: ja },
  )}`
}

/**
 * 終日イベントの日時範囲を設定
 */
export function setAllDayRange(date: Date): {
  startDate: string
  endDate: string
} {
  return {
    startDate: startOfDay(date).toISOString(),
    endDate: endOfDay(date).toISOString(),
  }
}
