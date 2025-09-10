import type * as schema from "@/database/schema"

import { type QueryParams } from "@/lib/types/api"

export type NoteColumns = keyof typeof schema.notes.$inferSelect

export type NotePriority = (typeof schema.notes.$inferSelect)["priority"]

export type Note = typeof schema.notes.$inferSelect

export type InsertNote = typeof schema.notes.$inferInsert
export type UpdateNote = Partial<InsertNote>

export type OrderableNoteColumns =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "priority"
  | "isFavorite"
  | "isArchived"

export type NoteFilters = {
  search?: string
  priority?: NotePriority | NotePriority[]
  isFavorite?: boolean
  isArchived?: boolean
}

export type QueryNotesParams = QueryParams<OrderableNoteColumns, NoteFilters>
