import { z } from "zod"

/**
 * スケジュールの基本的な型定義
 */
export interface Schedule {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  isAllDay: boolean
  location?: string
  participants?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * スケジュール作成時の入力データの型定義
 */
export type CreateScheduleInput = Omit<Schedule, "id" | "createdAt" | "updatedAt">

/**
 * スケジュール更新時の入力データの型定義
 */
export type UpdateScheduleInput = Partial<Omit<Schedule, "id" | "createdAt" | "updatedAt">>

const baseScheduleSchema = z.object({
  title: z.string().min(1, "題名は必須です").max(100, "題名は100文字以内で入力してください"),
  description: z.string().max(1000, "説明は1000文字以内で入力してください").optional(),
  startDate: z.date(),
  endDate: z.date(),
  isAllDay: z.boolean(),
  location: z.string().max(200, "場所は200文字以内で入力してください").optional(),
  participants: z.array(z.string()).optional(),
  createdBy: z.string(),
})

export const scheduleSchema = baseScheduleSchema.refine((data) => {
  return data.startDate <= data.endDate
}, {
  message: "開始日時は終了日時より前である必要があります",
  path: ["startDate"],
})

export const createScheduleSchema = scheduleSchema

export const updateScheduleSchema = baseScheduleSchema.partial().refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate
  }
  return true
}, {
  message: "開始日時は終了日時より前である必要があります",
  path: ["startDate"],
})

/**
 * APIレスポンスの型定義
 */
export interface ScheduleResponse {
  data?: Schedule | Schedule[]
  error?: {
    message: string
    code: string
  }
}
