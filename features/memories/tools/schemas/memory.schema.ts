import { z } from "zod"

export const createMemoryToolSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  content: z.string().min(1, "Content is required"),
  importance: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  isActive: z.boolean().optional().default(true)
})

export const updateMemoryToolSchema = z.object({
  id: z.uuid("Invalid memory ID"),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  content: z.string().min(1, "Content is required"),
  importance: z.enum(["low", "medium", "high", "critical"]).optional(),
  isActive: z.boolean().optional()
})

export const deleteMemoryToolSchema = z.object({
  id: z.uuid("Invalid memory ID"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  importance: z.enum(["low", "medium", "high", "critical"]).optional(),
  isActive: z.boolean().optional()
})

export const getMemoryByIdToolSchema = z.object({
  id: z.uuid("Invalid memory ID")
})

export const listMemoriesToolSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  orderBy: z
    .object({
      column: z.enum(["createdAt", "updatedAt", "title", "importance", "isActive"]),
      direction: z.enum(["asc", "desc"])
    })
    .optional(),
  filters: z
    .object({
      search: z.string().optional(),
      importance: z
        .union([
          z.enum(["low", "medium", "high", "critical"]),
          z.array(z.enum(["low", "medium", "high", "critical"]))
        ])
        .optional(),
      isActive: z.boolean().optional()
    })
    .optional()
})

export const searchMemoriesToolSchema = z.object({
  query: z.string().min(1, "Search query is required")
})

export const getMemoriesStatsToolSchema = z.object({
  filters: z
    .object({
      search: z.string().optional(),
      importance: z
        .union([
          z.enum(["low", "medium", "high", "critical"]),
          z.array(z.enum(["low", "medium", "high", "critical"]))
        ])
        .optional(),
      isActive: z.boolean().optional()
    })
    .optional()
})

export const getMemoriesByImportanceToolSchema = z.object({
  importance: z.enum(["low", "medium", "high", "critical"]),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export const getActiveMemoriesToolSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export const getInactiveMemoriesToolSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export const getNewestMemoriesToolSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export const getOldestMemoriesToolSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export const getRecentMemoriesToolSchema = z.object({
  days: z.number().min(1).max(365).optional().default(7),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export const getMemoriesCountByImportanceToolSchema = z.object({
  filters: z
    .object({
      search: z.string().optional(),
      isActive: z.boolean().optional()
    })
    .optional()
})

export const getMemoriesCountByDateToolSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export const searchMemoriesSemanticToolSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(20).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.7)
})

export const getRelevantMemoriesToolSchema = z.object({
  context: z.string().min(1, "Context is required"),
  limit: z.number().min(1).max(10).optional().default(3),
  threshold: z.number().min(0).max(1).optional().default(0.6)
})

export type CreateMemoryToolInput = z.infer<typeof createMemoryToolSchema>
export type UpdateMemoryToolInput = z.infer<typeof updateMemoryToolSchema>
export type DeleteMemoryToolInput = z.infer<typeof deleteMemoryToolSchema>
export type GetMemoryByIdToolInput = z.infer<typeof getMemoryByIdToolSchema>
export type ListMemoriesToolInput = z.infer<typeof listMemoriesToolSchema>
export type SearchMemoriesToolInput = z.infer<typeof searchMemoriesToolSchema>
export type GetMemoriesStatsToolInput = z.infer<typeof getMemoriesStatsToolSchema>
export type GetMemoriesByImportanceToolInput = z.infer<typeof getMemoriesByImportanceToolSchema>
export type GetActiveMemoriesToolInput = z.infer<typeof getActiveMemoriesToolSchema>
export type GetInactiveMemoriesToolInput = z.infer<typeof getInactiveMemoriesToolSchema>
export type GetNewestMemoriesToolInput = z.infer<typeof getNewestMemoriesToolSchema>
export type GetOldestMemoriesToolInput = z.infer<typeof getOldestMemoriesToolSchema>
export type GetRecentMemoriesToolInput = z.infer<typeof getRecentMemoriesToolSchema>
export type GetMemoriesCountByImportanceToolInput = z.infer<
  typeof getMemoriesCountByImportanceToolSchema
>
export type GetMemoriesCountByDateToolInput = z.infer<typeof getMemoriesCountByDateToolSchema>
export type SearchMemoriesSemanticToolInput = z.infer<typeof searchMemoriesSemanticToolSchema>
export type GetRelevantMemoriesToolInput = z.infer<typeof getRelevantMemoriesToolSchema>

export const APPROVAL = {
  YES: "APPROVED",
  NO: "REJECTED"
} as const

export type ApprovalStatus = (typeof APPROVAL)[keyof typeof APPROVAL]
