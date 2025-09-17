import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm"

import { database } from "@/database/client"
import * as schema from "@/database/schema"

import { createInsertMemorySchema, createUpdateMemorySchema } from "@/features/memories/schemas"

import { getUser } from "@/lib/dal.server"

import type {
  InsertMemory,
  Memory,
  QueryMemoriesParams,
  UpdateMemory
} from "@/features/memories/types"

const { memories } = schema

function resolveOrderBy(orderBy?: QueryMemoriesParams["orderBy"]) {
  if (!orderBy) return desc(memories.updatedAt)

  const direction = orderBy.direction

  switch (orderBy.column) {
    case "updatedAt":
      return direction === "asc" ? asc(memories.updatedAt) : desc(memories.updatedAt)
    case "createdAt":
      return direction === "asc" ? asc(memories.createdAt) : desc(memories.createdAt)
    case "title":
      return direction === "asc" ? asc(memories.title) : desc(memories.title)
    case "importance":
      return direction === "asc" ? asc(memories.importance) : desc(memories.importance)
    case "isActive":
      return direction === "asc" ? asc(memories.isActive) : desc(memories.isActive)
    default:
      return desc(memories.updatedAt)
  }
}

export async function getMemories(params: QueryMemoriesParams = {}) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const { limit = 20, offset = 0, orderBy, filters } = params

  const filterConditions = []

  if (filters?.search) {
    filterConditions.push(
      or(like(memories.title, `%${filters.search}%`), like(memories.content, `%${filters.search}%`))
    )
  }

  if (filters?.importance) {
    if (Array.isArray(filters.importance)) {
      filterConditions.push(inArray(memories.importance, filters.importance))
    } else {
      filterConditions.push(eq(memories.importance, filters.importance))
    }
  }

  if (filters?.isActive !== undefined) {
    filterConditions.push(eq(memories.isActive, filters.isActive))
  }

  const where = and(eq(memories.userId, user.id), ...filterConditions)

  const [rows, totals] = await Promise.all([
    database
      .select()
      .from(memories)
      .where(where)
      .orderBy(resolveOrderBy(orderBy))
      .limit(limit)
      .offset(offset),
    database.select({ value: count() }).from(memories).where(where)
  ])

  const total = Number(totals[0]?.value ?? 0)
  return { data: rows as Memory[], total }
}

export async function getMemoryById(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [row] = await database
    .select()
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, user.id)))
  return (row ?? null) as Memory | null
}

export async function createMemory(input: InsertMemory) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const body = createInsertMemorySchema().parse(input) as InsertMemory

  const values = {
    ...body,
    userId: user.id
  }

  const [created] = await database.insert(memories).values(values).returning()

  return created as Memory
}

export async function updateMemory(id: string, input: UpdateMemory) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [existing] = await database
    .select()
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, user.id)))
  if (!existing) return undefined

  const merged = { ...existing, ...input }

  const body = createUpdateMemorySchema().parse(merged) as UpdateMemory

  const setValues = {
    ...body,
    userId: user.id
  }

  const [updated] = await database
    .update(memories)
    .set(setValues)
    .where(and(eq(memories.id, id), eq(memories.userId, user.id)))
    .returning()

  return (updated as Memory | undefined) ?? undefined
}

export async function deleteMemory(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [deleted] = await database
    .delete(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, user.id)))
    .returning()

  return (deleted as Memory | undefined) ?? undefined
}

export async function searchMemories(query: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const where = and(
    eq(memories.userId, user.id),
    or(like(memories.title, `%${query}%`), like(memories.content, `%${query}%`))
  )
  const rows = await database
    .select()
    .from(memories)
    .where(where)
    .orderBy(desc(memories.updatedAt))
    .limit(50)

  return rows as Memory[]
}
