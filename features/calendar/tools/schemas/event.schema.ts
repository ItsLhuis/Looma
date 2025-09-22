import { z } from "zod"

export const createEventToolSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  isAllDay: z.boolean().default(false)
})

export const updateEventToolSchema = z.object({
  id: z.uuid("Invalid event ID format"),
  title: z
    .string()
    .min(1, "Title is REQUIRED - always include the title field when updating")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAllDay: z.boolean().optional()
})

export const deleteEventToolSchema = z.object({
  id: z.uuid("Invalid event ID format"),
  title: z
    .string()
    .min(1, "Title is REQUIRED - always include the title field when deleting")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAllDay: z.boolean().optional()
})

export const getEventByIdToolSchema = z.object({
  id: z.uuid("Invalid event ID format")
})

export const listEventsToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  orderBy: z
    .object({
      column: z.enum(["createdAt", "updatedAt", "startTime", "endTime", "title"]),
      direction: z.enum(["asc", "desc"])
    })
    .optional(),
  filters: z
    .object({
      search: z.string().optional(),
      isAllDay: z.boolean().optional(),
      dateRange: z
        .object({
          start: z.string(),
          end: z.string()
        })
        .optional()
    })
    .optional()
})

export const searchEventsToolSchema = z.object({
  query: z.string().min(1, "Search query is required")
})

export const getEventsByDateRangeToolSchema = z.object({
  startDate: z.string(),
  endDate: z.string()
})

export const getEventsStatsToolSchema = z.object({
  dateRange: z
    .object({
      start: z.string(),
      end: z.string()
    })
    .optional()
})

export const getUpcomingEventsToolSchema = z.object({
  limit: z.number().min(1).max(50).default(10)
})

export const getTodayEventsToolSchema = z.object({})

export const getEventsByAllDayToolSchema = z.object({
  isAllDay: z.boolean()
})

export type CreateEventToolInput = z.infer<typeof createEventToolSchema>
export type UpdateEventToolInput = z.infer<typeof updateEventToolSchema>
export type DeleteEventToolInput = z.infer<typeof deleteEventToolSchema>
export type GetEventByIdToolInput = z.infer<typeof getEventByIdToolSchema>
export type ListEventsToolInput = z.infer<typeof listEventsToolSchema>
export type SearchEventsToolInput = z.infer<typeof searchEventsToolSchema>
export type GetEventsByDateRangeToolInput = z.infer<typeof getEventsByDateRangeToolSchema>
export type GetEventsStatsToolInput = z.infer<typeof getEventsStatsToolSchema>
export type GetUpcomingEventsToolInput = z.infer<typeof getUpcomingEventsToolSchema>
export type GetTodayEventsToolInput = z.infer<typeof getTodayEventsToolSchema>
export type GetEventsByAllDayToolInput = z.infer<typeof getEventsByAllDayToolSchema>

export const APPROVAL = {
  YES: "APPROVED",
  NO: "REJECTED"
} as const

export type ApprovalStatus = (typeof APPROVAL)[keyof typeof APPROVAL]
