import type * as schema from "@/database/schema"

import { type QueryParams } from "@/lib/types/api"

export type MemoryColumns = keyof typeof schema.memories.$inferSelect

export type MemoryImportance = (typeof schema.memories.$inferSelect)["importance"]

export type Memory = typeof schema.memories.$inferSelect

export type InsertMemory = typeof schema.memories.$inferInsert
export type UpdateMemory = Partial<InsertMemory>

export type OrderableMemoryColumns = "createdAt" | "updatedAt" | "title" | "importance" | "isActive"

export type MemoryFilters = {
  search?: string
  importance?: MemoryImportance | MemoryImportance[]
  isActive?: boolean
}

export type QueryMemoriesParams = QueryParams<OrderableMemoryColumns, MemoryFilters>
