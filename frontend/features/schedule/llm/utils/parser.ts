import type { DateTimeInfo, ScheduleInfo } from "../types"

export function parseScheduleResponse(response: any): ScheduleInfo {
  return {
    title: response.title,
    description: response.description,
    startDate: new Date(response.startDate),
    endDate: new Date(response.endDate),
    isAllDay: response.isAllDay,
    location: response.location,
    participants: response.participants,
    reminders: response.reminders,
    recurrence: response.recurrence,
  }
}

export function parseDateTimeResponse(response: any): DateTimeInfo {
  return {
    startDate: new Date(response.startDate),
    endDate: new Date(response.endDate),
    isAllDay: response.isAllDay,
  }
}
