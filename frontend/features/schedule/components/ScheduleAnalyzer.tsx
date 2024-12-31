"use client"

import type { Schedule } from "../types/Schedule"
import { useMemo } from "react"

interface ScheduleAnalyzerProps {
  schedules?: Schedule[]
}

interface AnalysisResult {
  totalMeetings: number
  totalDuration: number
  busyDays: string[]
  categories: Record<string, number>
}

export function ScheduleAnalyzer({ schedules = [] }: ScheduleAnalyzerProps) {
  const analysis = useMemo<AnalysisResult>(() => {
    const result: AnalysisResult = {
      totalMeetings: 0,
      totalDuration: 0,
      busyDays: [],
      categories: {},
    }

    const dayMeetings: Record<string, number> = {}

    schedules.forEach((schedule) => {
      // ミーティング数をカウント
      result.totalMeetings++

      // 所要時間を計算（分単位）
      const start = new Date(schedule.start)
      const end = new Date(schedule.end)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60)
      result.totalDuration += duration

      // 日付ごとのミーティング数をカウント
      const dateKey = start.toISOString().split("T")[0]
      dayMeetings[dateKey] = (dayMeetings[dateKey] || 0) + 1

      // カテゴリ分析（タイトルから推測）
      const category = guessCategory(schedule.title)
      result.categories[category] = (result.categories[category] || 0) + 1
    })

    // 忙しい日を特定（1日3ミーティング以上）
    result.busyDays = Object.entries(dayMeetings)
      .filter(([_, count]) => count >= 3)
      .map(([date]) => date)

    return result
  }, [schedules])

  if (!schedules.length) {
    return (
      <div className="text-center text-gray-500">
        分析するスケジュールがありません
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md bg-blue-50 p-3">
          <div className="text-sm text-blue-600">ミーティング数</div>
          <div className="text-2xl font-bold text-blue-700">
            {analysis.totalMeetings}
          </div>
        </div>
        <div className="rounded-md bg-green-50 p-3">
          <div className="text-sm text-green-600">合計時間</div>
          <div className="text-2xl font-bold text-green-700">
            {Math.round(analysis.totalDuration / 60)}
            時間
          </div>
        </div>
      </div>

      {analysis.busyDays.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">忙しい日</h4>
          <div className="text-sm text-gray-600">
            {analysis.busyDays.map(date => (
              <div key={date} className="mb-1">
                {new Date(date).toLocaleDateString("ja-JP")}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-2 text-sm font-medium">カテゴリ分布</h4>
        <div className="space-y-2">
          {Object.entries(analysis.categories).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{category}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function guessCategory(title: string): string {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes("mtg") || lowerTitle.includes("meeting")) {
    return "ミーティング"
  }
  if (lowerTitle.includes("review") || lowerTitle.includes("レビュー")) {
    return "レビュー"
  }
  if (lowerTitle.includes("interview") || lowerTitle.includes("面接")) {
    return "面接"
  }
  if (lowerTitle.includes("lunch") || lowerTitle.includes("ランチ")) {
    return "ランチ"
  }
  return "その他"
}
