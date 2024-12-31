"use client"

import type { Schedule } from "@/features/schedule/types/Schedule"
import { scheduleApi } from "@/features/schedule/api/scheduleApi"
import { CalendarSync } from "@/features/schedule/components/CalendarSync"
import { ScheduleAnalyzer } from "@/features/schedule/components/ScheduleAnalyzer"
import { ScheduleCalendar } from "@/features/schedule/components/ScheduleCalendar"
import { ScheduleList } from "@/features/schedule/components/ScheduleList"
import { useEffect, useState } from "react"

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await scheduleApi.list()
        setSchedules(data)
        setLoading(false)
      }
      catch (err) {
        setError("スケジュールの取得に失敗しました")
        setLoading(false)
        console.error("Failed to fetch schedules:", err)
      }
    }

    fetchSchedules()
  }, [])

  const handleScheduleSelect = (schedule: Schedule) => {
    // TODO: スケジュール選択時の処理を実装
    console.info("Selected schedule:", schedule)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">スケジュール管理</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* メインカレンダー */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <ScheduleCalendar
              schedules={schedules}
              onScheduleSelect={handleScheduleSelect}
            />
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* カレンダー同期状態 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">カレンダー連携</h2>
            <CalendarSync />
          </div>

          {/* スケジュール分析 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">スケジュール分析</h2>
            <ScheduleAnalyzer schedules={schedules} />
          </div>
        </div>

        {/* 今後のスケジュール一覧 */}
        <div className="lg:col-span-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">今後のスケジュール</h2>
            <ScheduleList schedules={schedules} />
          </div>
        </div>
      </div>
    </div>
  )
}
