import type * as schema from "@/database/schema"

import { type QueryParams } from "@/lib/types/api"

export type EventColumns = keyof typeof schema.events.$inferSelect

export type Event = typeof schema.events.$inferSelect

export type InsertEvent = typeof schema.events.$inferInsert
export type UpdateEvent = Partial<InsertEvent>

export type OrderableEventColumns = "createdAt" | "updatedAt" | "startTime" | "endTime" | "title"

export type EventFilters = {
  search?: string
  isAllDay?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export type QueryEventsParams = QueryParams<OrderableEventColumns, EventFilters>
