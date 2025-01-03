"use client"

import type { Schedule } from "../types"
import { useSchedule } from "@/hooks/schedule/useSchedule"
import { useState } from "react"

export function ScheduleManager() {
  const [_selectedSchedule, _setSelectedSchedule] = useState<Schedule | null>(null)
  const { schedules: _schedules, loading, error } = useSchedule()

  if (loading) {
    return <div>読み込み中...</div>
  }

  if (error) {
    return (
      <div>
        エラーが発生しました:
        {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-bold">スケジュール管理</h1>

      {/* カレンダー表示 */}
      <div className="flex-1">
        {/* ScheduleCalendarコンポーネントを追加予定 */}
      </div>

      {/* スケジュール作成/編集フォーム */}
      <div className="fixed bottom-4 right-4">
        {/* ScheduleFormコンポーネントを追加予定 */}
      </div>
    </div>
  )
}
