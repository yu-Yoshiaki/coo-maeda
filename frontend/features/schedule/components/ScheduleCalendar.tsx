"use client"

import { useState } from 'react'
import Calendar from 'react-calendar'
import { Schedule } from '../types/Schedule'
import 'react-calendar/dist/Calendar.css'

export interface ScheduleCalendarProps {
  schedules: Schedule[]
  onScheduleSelect: (schedule: Schedule) => void
}

export function ScheduleCalendar({ schedules, onScheduleSelect }: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const schedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start)
      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate()
      )
    })
  }

  return (
    <div className="space-y-4">
      <Calendar
        value={selectedDate}
        onChange={(value) => setSelectedDate(value as Date)}
        className="w-full rounded-md border"
        locale="ja-JP"
      />

      <div className="space-y-2">
        <h3 className="font-medium">{selectedDate.toLocaleDateString('ja-JP')}の予定</h3>
        <div className="space-y-1">
          {schedulesForDate(selectedDate).map(schedule => (
            <button
              key={schedule.id}
              onClick={() => onScheduleSelect(schedule)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{schedule.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(schedule.start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {schedule.location && (
                <span className="text-sm text-gray-500">{schedule.location}</span>
              )}
            </button>
          ))}
          {schedulesForDate(selectedDate).length === 0 && (
            <p className="text-gray-500 text-sm">予定はありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
