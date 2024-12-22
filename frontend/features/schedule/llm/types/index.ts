import type { Participant, RecurrenceRule, Reminder } from "../../types"

export interface BaseSchedule {
  title: string
  description?: string
  startDate: string
  endDate: string
  isAllDay: boolean
  location?: string
}

export interface ScheduleAnalyzerInput {
  text: string
  contextDate?: Date
}

export interface ScheduleInfo extends BaseSchedule {
  participants?: Array<{
    name: string
    email: string
    role: "organizer" | "attendee" | "optional"
  }>
  reminders?: Array<{
    minutes: number
    type: "email" | "notification"
  }>
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly"
    interval: number
    until?: string
    count?: number
  }
}

export interface DateTimeInfo {
  startDate: Date
  endDate: Date
  isAllDay: boolean
}

export interface ScheduleAnalysisResult extends BaseSchedule {}

export interface DateTimeAnalysisResult {
  startDate: string
  endDate: string
  isAllDay: boolean
}

export interface AnalyzerError extends Error {
  code: "INVALID_INPUT" | "API_ERROR" | "PARSE_ERROR"
}

export interface PromptConfig {
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}
