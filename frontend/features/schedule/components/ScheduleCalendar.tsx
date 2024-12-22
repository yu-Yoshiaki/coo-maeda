"use client"

import type { Schedule } from "../types"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

interface ScheduleCalendarProps {
  schedules: Schedule[]
  onScheduleSelect: (schedule: Schedule) => void
}

export function ScheduleCalendar({ schedules, onScheduleSelect }: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // 選択された日付のスケジュールを取得
  const getDaySchedules = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startDate)
      return (
        scheduleDate.getFullYear() === date.getFullYear()
        && scheduleDate.getMonth() === date.getMonth()
        && scheduleDate.getDate() === date.getDate()
      )
    })
  }

  return (
    <div className="flex flex-col space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
      />

      {/* 選択された日付のスケジュール一覧 */}
      {selectedDate && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {selectedDate.toLocaleDateString("ja-JP")}
            の予定
          </h2>
          <div className="space-y-2">
            {getDaySchedules(selectedDate).map(schedule => (
              <button
                key={schedule.id}
                onClick={() => onScheduleSelect(schedule)}
                className="w-full rounded-md border p-2 text-left hover:bg-gray-50"
              >
                <div className="font-medium">{schedule.title}</div>
                <div className="text-sm text-gray-500">
                  {new Date(schedule.startDate).toLocaleTimeString("ja-JP")}
                  {" "}
                  -
                  {new Date(schedule.endDate).toLocaleTimeString("ja-JP")}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
