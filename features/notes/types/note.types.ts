import type * as schema from "@/database/schema"

import { type QueryParams } from "@/lib/types/api"

export type NoteColumns = keyof typeof schema.notes.$inferSelect

export type NotePriority = (typeof schema.notes.$inferSelect)["priority"]

export type Note = typeof schema.notes.$inferSelect

export type InsertNote = typeof schema.notes.$inferInsert
export type UpdateNote = Partial<InsertNote>

export type QueryNotesParams = QueryParams<NoteColumns>
