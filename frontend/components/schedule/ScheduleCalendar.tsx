"use client"

import type { Schedule } from "@/lib/validations/schedule"
import { format, getDay, parse, startOfWeek } from "date-fns"
import { ja } from "date-fns/locale"
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

interface ScheduleCalendarProps {
  schedules: Schedule[]
  onSelectEvent?: (event: Schedule) => void
  onSelectSlot?: (slotInfo: { start: Date, end: Date }) => void
}

export function ScheduleCalendar({
  schedules,
  onSelectEvent,
  onSelectSlot,
}: ScheduleCalendarProps) {
  const events = schedules.map(schedule => ({
    ...schedule,
    start: new Date(schedule.startDate),
    end: new Date(schedule.endDate),
  }))

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        defaultView="week"
        views={["month", "week", "day"]}
        selectable
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        messages={{
          today: "今日",
          previous: "前へ",
          next: "次へ",
          month: "月",
          week: "週",
          day: "日",
          agenda: "予定",
          date: "日付",
          time: "時間",
          event: "予定",
          noEventsInRange: "この期間に予定はありません",
        }}
      />
    </div>
  )
}
