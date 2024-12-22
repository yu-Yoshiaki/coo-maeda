import { z } from "zod"

// 参加者のスキーマ
const participantSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  role: z.enum(["organizer", "attendee", "optional"]),
})

// リマインダーのスキーマ
const reminderSchema = z.object({
  type: z.enum(["email", "notification"]),
  minutes: z.number().int().positive(),
})

// 繰り返しルールのスキーマ
const recurrenceSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number().int().positive(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  until: z.date().optional(),
  count: z.number().int().positive().optional(),
})

// スケジュールのスキーマ
export const scheduleSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  isAllDay: z.boolean(),
  location: z.string().optional(),
  participants: z.array(participantSchema).optional(),
  reminders: z.array(reminderSchema).optional(),
  recurrence: recurrenceSchema.optional(),
})

export type Schedule = z.infer<typeof scheduleSchema>
