"use client"

import type { Schedule } from "@/lib/validations/schedule"
import { useSchedule } from "@/hooks/schedule/useSchedule"
import { useScheduleAnalyzer } from "@/hooks/schedule/useScheduleAnalyzer"
import { useState } from "react"
import { toast } from "sonner"
import { ScheduleCalendar } from "./ScheduleCalendar"

export function ScheduleManager() {
  const [text, setText] = useState("")
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const { schedules, createSchedule, updateSchedule, deleteSchedule } = useSchedule()
  const { analyzeSchedule } = useScheduleAnalyzer()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!text)
      return

    try {
      const schedule = await analyzeSchedule(text)
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.id!, schedule)
      }
      else {
        await createSchedule(schedule)
      }
      setText("")
      setSelectedSchedule(null)
    }
    catch (error) {
      console.error(error)
      toast.error("予定の解析に失敗しました")
    }
  }

  const handleSelectEvent = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setText(`${schedule.title}を${schedule.startDate}から${schedule.endDate}まで${schedule.location}で`)
  }

  const handleDelete = async () => {
    if (!selectedSchedule)
      return
    try {
      await deleteSchedule(selectedSchedule.id!)
      setText("")
      setSelectedSchedule(null)
    }
    catch (error) {
      console.error(error)
      toast.error("予定の削除に失敗しました")
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <ScheduleCalendar
            schedules={schedules}
            onSelectEvent={handleSelectEvent}
          />
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700"
              >
                予定を自然な言葉で入力
              </label>
              <textarea
                id="text"
                rows={3}
                className="mt-1 block w-full rounded-md border p-2"
                placeholder="例: 明日の14時から1時間、会議室Aでミーティング"
                value={text}
                onChange={e => setText(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                解析
              </button>
              {selectedSchedule && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  aria-label="削除"
                >
                  削除
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
