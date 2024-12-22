import type { Participant, RecurrenceRule, Reminder } from "../../types"

export interface ScheduleAnalyzerInput {
  text: string
  contextDate?: Date
}

export interface ScheduleInfo {
  title: string
  description?: string
  startDate: Date
  endDate: Date
  isAllDay: boolean
  location?: string
  participants?: Omit<Participant, "id">[]
  reminders?: Omit<Reminder, "id" | "status">[]
  recurrence?: RecurrenceRule
}

export interface DateTimeInfo {
  startDate: Date
  endDate: Date
  isAllDay: boolean
}
