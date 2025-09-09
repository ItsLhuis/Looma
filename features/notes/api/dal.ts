import { and, asc, count, desc, eq, like, or } from "drizzle-orm"

import { database } from "@/database/client"
import * as schema from "@/database/schema"

import { createInsertNoteSchema, createUpdateNoteSchema } from "@/features/notes/schemas"

import { getUser } from "@/lib/dal"

import { type QueryParams } from "@/lib/types/api"

import type { InsertNote, Note, NoteColumns, UpdateNote } from "@/features/notes/types"

const { notes } = schema

export type QueryNotesParams = QueryParams<NoteColumns>

function resolveOrderBy(orderBy?: QueryNotesParams["orderBy"]) {
  if (!orderBy) return desc(notes.updatedAt)

  const direction = orderBy.direction

  switch (orderBy.column) {
    case "updatedAt":
      return direction === "asc" ? asc(notes.updatedAt) : desc(notes.updatedAt)
    case "createdAt":
      return direction === "asc" ? asc(notes.createdAt) : desc(notes.createdAt)
    case "title":
      return direction === "asc" ? asc(notes.title) : desc(notes.title)
    case "priority":
      return direction === "asc" ? asc(notes.priority) : desc(notes.priority)
    case "isFavorite":
      return direction === "asc" ? asc(notes.isFavorite) : desc(notes.isFavorite)
    case "isArchived":
      return direction === "asc" ? asc(notes.isArchived) : desc(notes.isArchived)
    default:
      return desc(notes.updatedAt)
  }
}

export async function getNotes(params: QueryNotesParams = {}) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const { limit = 20, offset = 0, orderBy, filters } = params
  const where = and(
    eq(notes.userId, user.id),
    filters?.search
      ? or(
          like(notes.title, `%${filters.search}%`),
          like(notes.content, `%${filters.search}%`),
          like(notes.summary, `%${filters.search}%`)
        )
      : undefined
  )

  const [rows, totals] = await Promise.all([
    database
      .select()
      .from(notes)
      .where(where)
      .orderBy(resolveOrderBy(orderBy))
      .limit(limit)
      .offset(offset),
    database.select({ value: count() }).from(notes).where(where)
  ])

  const total = Number(totals[0]?.value ?? 0)
  return { data: rows as Note[], total }
}

export async function getNoteById(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [row] = await database
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
  return (row ?? null) as Note | null
}

export async function createNote(input: InsertNote) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const body = createInsertNoteSchema().parse(input) as InsertNote

  const values = {
    ...body,
    userId: user.id
  }

  const [created] = await database.insert(notes).values(values).returning()

  return created as Note
}

export async function updateNote(id: string, input: UpdateNote) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [existing] = await database
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
  if (!existing) return undefined

  const merged = { ...existing, ...input }

  const body = createUpdateNoteSchema().parse(merged) as UpdateNote

  const setValues = {
    ...body,
    userId: user.id
  }

  const [updated] = await database
    .update(notes)
    .set(setValues)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .returning()

  return (updated as Note | undefined) ?? undefined
}

export async function deleteNote(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [deleted] = await database
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .returning()

  return (deleted as Note | undefined) ?? undefined
}

export async function searchNotes(query: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const where = and(
    eq(notes.userId, user.id),
    or(
      like(notes.title, `%${query}%`),
      like(notes.content, `%${query}%`),
      like(notes.summary, `%${query}%`)
    )
  )
  const rows = await database
    .select()
    .from(notes)
    .where(where)
    .orderBy(desc(notes.updatedAt))
    .limit(50)
  return rows as Note[]
}
