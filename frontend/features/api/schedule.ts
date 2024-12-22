import type {
  NaturalLanguageScheduleInput,
  Schedule,
  ScheduleCreateInput,
  ScheduleFilter,
  ScheduleUpdateInput,
} from "@/types/schedule"

export const scheduleApi = {
  // スケジュールの作成
  createSchedule: async (input: ScheduleCreateInput): Promise<Schedule> => {
    const response = await fetch("/api/schedules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
    return response.json()
  },

  // スケジュールの更新
  updateSchedule: async (id: string, input: ScheduleUpdateInput): Promise<Schedule> => {
    const response = await fetch(`/api/schedules/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
    return response.json()
  },

  // スケジュールの削除
  deleteSchedule: async (id: string): Promise<void> => {
    await fetch(`/api/schedules/${id}`, {
      method: "DELETE",
    })
  },

  // スケジュールの取得
  getSchedule: async (id: string): Promise<Schedule> => {
    const response = await fetch(`/api/schedules/${id}`)
    return response.json()
  },

  // スケジュール一覧の取得
  getSchedules: async (filter: ScheduleFilter): Promise<Schedule[]> => {
    const queryParams = new URLSearchParams()
    if (filter.startDate)
      queryParams.set("startDate", filter.startDate.toISOString())
    if (filter.endDate)
      queryParams.set("endDate", filter.endDate.toISOString())
    if (filter.status)
      queryParams.set("status", filter.status.join(","))
    if (filter.participantId)
      queryParams.set("participantId", filter.participantId)
    if (filter.searchQuery)
      queryParams.set("q", filter.searchQuery)

    const response = await fetch(`/api/schedules?${queryParams.toString()}`)
    return response.json()
  },

  // 自然言語からのスケジュール作成
  createFromNaturalLanguage: async (input: NaturalLanguageScheduleInput): Promise<Schedule> => {
    const response = await fetch("/api/schedules/natural-language", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
    return response.json()
  },

  // 外部カレンダーとの同期
  syncWithExternalCalendar: async (calendarId: string): Promise<void> => {
    await fetch(`/api/schedules/sync/${calendarId}`, {
      method: "POST",
    })
  },
}
