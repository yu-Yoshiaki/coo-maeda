export interface Schedule {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  isAllDay: boolean
  location?: string
  participants: Participant[]
  recurrence?: RecurrenceRule
  reminders: Reminder[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  status: ScheduleStatus
}

export interface Participant {
  id: string
  name: string
  email: string
  status: ParticipantStatus
  role: ParticipantRole
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  endDate?: Date
  endCount?: number
  daysOfWeek?: number[]
  daysOfMonth?: number[]
  monthsOfYear?: number[]
}

export interface Reminder {
  id: string
  type: "email" | "notification"
  minutes: number
  status: "pending" | "sent" | "failed"
}

export type ScheduleStatus = "scheduled" | "cancelled" | "completed" | "draft"

export type ParticipantStatus = "pending" | "accepted" | "declined" | "tentative"

export type ParticipantRole = "organizer" | "attendee" | "optional"

export interface ScheduleFilter {
  startDate?: Date
  endDate?: Date
  status?: ScheduleStatus[]
  participantId?: string
  searchQuery?: string
}

export type ScheduleCreateInput = Omit<Schedule, "id" | "createdAt" | "updatedAt">

export type ScheduleUpdateInput = Partial<Omit<Schedule, "id" | "createdAt" | "updatedAt">>

export interface NaturalLanguageScheduleInput {
  text: string
  userId: string
  contextDate?: Date
}
