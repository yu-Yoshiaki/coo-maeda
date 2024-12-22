import { z } from "zod"

export const scheduleSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  isAllDay: z.boolean(),
  location: z.string().optional(),
  status: z.enum(["scheduled", "cancelled", "completed", "draft"]),
  createdBy: z.string(),
  participants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      status: z.enum(["pending", "accepted", "declined", "tentative"]),
      role: z.enum(["organizer", "attendee", "optional"]),
    }),
  ),
  reminders: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["email", "notification"]),
      minutes: z.number(),
      status: z.enum(["pending", "sent", "failed"]),
    }),
  ),
  recurrence: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
      interval: z.number(),
      endDate: z.date().optional(),
      endCount: z.number().optional(),
      daysOfWeek: z.array(z.number()).optional(),
      daysOfMonth: z.array(z.number()).optional(),
      monthsOfYear: z.array(z.number()).optional(),
    })
    .optional(),
})
