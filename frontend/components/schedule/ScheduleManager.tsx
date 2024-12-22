"use client"

import type { Schedule } from "@/types/schedule"
import { useSchedule } from "@/hooks/schedule/useSchedule"
import format from "date-fns/format"
import getDay from "date-fns/getDay"
import { ja } from "date-fns/locale"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import { useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"

const locales = {
  ja,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function ScheduleManager() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")

  const {
    loading,
    error,
    createFromNaturalLanguage,
    getSchedules,
  } = useSchedule()

  // 自然言語入力からスケジュールを作成
  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!naturalLanguageInput.trim())
      return

    try {
      const schedule = await createFromNaturalLanguage({
        text: naturalLanguageInput,
        userId: "current-user-id", // TODO: 実際のユーザーIDを使用
        contextDate: selectedDate,
      })
      setSchedules(prev => [...prev, schedule])
      setNaturalLanguageInput("")
    }
    catch (error) {
      console.error("スケジュール作成エラー:", error)
    }
  }

  // カレンダーイベントの形式に変換
  const scheduleToEvent = (schedule: Schedule) => ({
    id: schedule.id,
    title: schedule.title,
    start: new Date(schedule.startDate),
    end: new Date(schedule.endDate),
    allDay: schedule.isAllDay,
  })

  return (
    <div className="p-4">
      <div className="mb-4">
        <form onSubmit={handleNaturalLanguageSubmit} className="flex gap-2">
          <input
            type="text"
            value={naturalLanguageInput}
            onChange={e => setNaturalLanguageInput(e.target.value)}
            placeholder="例: 明日の14時から1時間、会議室Aでミーティング"
            className="flex-1 rounded border p-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "作成中..." : "作成"}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">
          エラーが発生しました:
          {" "}
          {error.message}
        </div>
      )}

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={schedules.map(scheduleToEvent)}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          defaultView="week"
          views={["month", "week", "day"]}
          messages={{
            today: "今日",
            previous: "前へ",
            next: "次へ",
            month: "月",
            week: "週",
            day: "日",
            agenda: "アジェンダ",
          }}
          onNavigate={(date) => {
            setSelectedDate(date)
            // TODO: 日付範囲に基づいてスケジュールを取得
          }}
        />
      </div>
    </div>
  )
}
