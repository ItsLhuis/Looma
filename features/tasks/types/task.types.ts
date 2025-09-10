import type * as schema from "@/database/schema"

import { type QueryParams } from "@/lib/types/api"

export type TaskColumns = keyof typeof schema.tasks.$inferSelect

export type TaskStatus = (typeof schema.tasks.$inferSelect)["status"]
export type TaskPriority = (typeof schema.tasks.$inferSelect)["priority"]

export type Task = typeof schema.tasks.$inferSelect

export type InsertTask = typeof schema.tasks.$inferInsert
export type UpdateTask = Partial<InsertTask>

export type OrderableTaskColumns =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "status"
  | "priority"
  | "dueDate"
  | "position"

export type TaskFilters = {
  search?: string
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  dueDate?: {
    from?: Date
    to?: Date
  }
  parentTaskId?: string | null
  hasSubtasks?: boolean
}

export type QueryTasksParams = QueryParams<OrderableTaskColumns, TaskFilters>
