import { z } from "zod"

export const scheduleSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string(),
  isAllDay: z.boolean().default(false),
})

export type Schedule = z.infer<typeof scheduleSchema>
