export interface Schedule {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  location?: string
  attendees?: string[]
  isAllDay?: boolean
  status: "confirmed" | "tentative" | "cancelled"
  source: "internal" | "google" | "outlook"
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleCreateInput {
  title: string
  description?: string
  start: Date
  end: Date
  location?: string
  attendees?: string[]
  isAllDay?: boolean
}

export interface ScheduleUpdateInput extends Partial<ScheduleCreateInput> {
  id: string
}
