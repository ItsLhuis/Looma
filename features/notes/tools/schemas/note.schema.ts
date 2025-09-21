import { z } from "zod"

export const createNoteToolSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  content: z.string().optional(),
  summary: z.string().optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
  isFavorite: z.boolean().default(false),
  isArchived: z.boolean().default(false)
})

export const updateNoteToolSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z
    .string()
    .min(1, "Title is REQUIRED - always include the title field when updating")
    .max(255, "Title must be less than 255 characters"),
  content: z.string().optional(),
  summary: z.string().optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional()
})

export const deleteNoteToolSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z
    .string()
    .min(1, "Title is REQUIRED - always include the title field when deleting")
    .max(255, "Title must be less than 255 characters"),
  content: z.string().optional(),
  summary: z.string().optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional()
})

export const listNotesToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  orderBy: z
    .object({
      column: z.enum(["createdAt", "updatedAt", "title", "priority", "isFavorite", "isArchived"]),
      direction: z.enum(["asc", "desc"])
    })
    .optional(),
  filters: z
    .object({
      search: z.string().optional(),
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional(),
      isFavorite: z.boolean().optional(),
      isArchived: z.boolean().optional()
    })
    .optional()
})

export const getNoteByIdToolSchema = z.object({
  id: z.string().min(1, "Note ID is required")
})

export const searchNotesToolSchema = z.object({
  query: z.string().min(1, "Search query is required")
})

export const getNotesStatsToolSchema = z.object({
  filters: z
    .object({
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional(),
      isFavorite: z.boolean().optional(),
      isArchived: z.boolean().optional()
    })
    .optional()
})

export const getFavoriteNotesToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getArchivedNotesToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getNotesByPriorityToolSchema = z.object({
  priority: z.enum(["none", "low", "medium", "high", "urgent"]),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getOldestNotesToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getNewestNotesToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getNotesByDateRangeToolSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getRecentNotesToolSchema = z.object({
  days: z.number().min(1).max(365).default(7).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getNotesCountByPriorityToolSchema = z.object({
  filters: z
    .object({
      isFavorite: z.boolean().optional(),
      isArchived: z.boolean().optional()
    })
    .optional()
})

export const getNotesCountByDateToolSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export type CreateNoteToolInput = z.infer<typeof createNoteToolSchema>
export type UpdateNoteToolInput = z.infer<typeof updateNoteToolSchema>
export type DeleteNoteToolInput = z.infer<typeof deleteNoteToolSchema>
export type ListNotesToolInput = z.infer<typeof listNotesToolSchema>
export type GetNoteByIdToolInput = z.infer<typeof getNoteByIdToolSchema>
export type SearchNotesToolInput = z.infer<typeof searchNotesToolSchema>
export type GetNotesStatsToolInput = z.infer<typeof getNotesStatsToolSchema>
export type GetFavoriteNotesToolInput = z.infer<typeof getFavoriteNotesToolSchema>
export type GetArchivedNotesToolInput = z.infer<typeof getArchivedNotesToolSchema>
export type GetNotesByPriorityToolInput = z.infer<typeof getNotesByPriorityToolSchema>
export type GetOldestNotesToolInput = z.infer<typeof getOldestNotesToolSchema>
export type GetNewestNotesToolInput = z.infer<typeof getNewestNotesToolSchema>
export type GetNotesByDateRangeToolInput = z.infer<typeof getNotesByDateRangeToolSchema>
export type GetRecentNotesToolInput = z.infer<typeof getRecentNotesToolSchema>
export type GetNotesCountByPriorityToolInput = z.infer<typeof getNotesCountByPriorityToolSchema>
export type GetNotesCountByDateToolInput = z.infer<typeof getNotesCountByDateToolSchema>

export const APPROVAL = {
  YES: "APPROVED",
  NO: "REJECTED"
} as const

export type ApprovalStatus = (typeof APPROVAL)[keyof typeof APPROVAL]
