import * as z from "zod"

export const businessPlanSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["draft", "in_progress", "completed"]).default("draft"),
  context: z.object({
    what: z.string().optional(),
    when: z.string().optional(),
    where: z.string().optional(),
    who: z.string().optional(),
    why: z.string().optional(),
    how: z.string().optional(),
  }).optional(),
})
