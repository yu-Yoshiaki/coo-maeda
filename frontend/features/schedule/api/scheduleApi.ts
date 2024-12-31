import type { Schedule, ScheduleCreateInput, ScheduleUpdateInput } from "../types/Schedule"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export const scheduleApi = {
  async list(): Promise<Schedule[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user)
      throw new Error("認証が必要です")

    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("start", { ascending: true })

    if (error)
      throw error

    // nullの場合は空配列を返す
    if (!data)
      return []

    return data.map(schedule => ({
      ...schedule,
      start: new Date(schedule.start),
      end: new Date(schedule.end),
      createdAt: new Date(schedule.created_at),
      updatedAt: new Date(schedule.updated_at),
      isAllDay: schedule.is_all_day,
    }))
  },

  async create(input: ScheduleCreateInput): Promise<Schedule> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user)
      throw new Error("認証が必要です")

    const { data, error } = await supabase
      .from("schedules")
      .insert([
        {
          title: input.title,
          description: input.description,
          start: input.start.toISOString(),
          end: input.end.toISOString(),
          location: input.location,
          attendees: input.attendees,
          is_all_day: input.isAllDay,
          status: "confirmed",
          source: "internal",
          user_id: user.id,
        },
      ])
      .select()
      .single()

    if (error)
      throw error
    return {
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isAllDay: data.is_all_day,
    }
  },

  async update(input: ScheduleUpdateInput): Promise<Schedule> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user)
      throw new Error("認証が必要です")

    const { data, error } = await supabase
      .from("schedules")
      .update({
        title: input.title,
        description: input.description,
        start: input.start?.toISOString(),
        end: input.end?.toISOString(),
        location: input.location,
        attendees: input.attendees,
        is_all_day: input.isAllDay,
      })
      .eq("id", input.id)
      .select()
      .single()

    if (error)
      throw error
    return {
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isAllDay: data.is_all_day,
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)

    if (error)
      throw error
  },

  async sync(provider: "google" | "outlook"): Promise<void> {
    // TODO: 外部カレンダーとの同期処理を実装
    throw new Error("Not implemented")
  },
}
