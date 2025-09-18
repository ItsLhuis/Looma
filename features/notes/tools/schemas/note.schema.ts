import { z } from "zod"

export const createNoteToolSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  content: z.string().optional(),
  summary: z.string().optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
  isFavorite: z.boolean().default(false),
  isArchived: z.boolean().default(false)
})

export type CreateNoteToolInput = z.infer<typeof createNoteToolSchema>

export const APPROVAL = {
  YES: "APPROVED",
  NO: "REJECTED"
} as const

export type ApprovalStatus = (typeof APPROVAL)[keyof typeof APPROVAL]
