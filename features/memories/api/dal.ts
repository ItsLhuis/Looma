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

export async function searchMemoriesSemantic(
  query: string,
  limit: number = 5,
  threshold: number = 0.7
) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const where = and(
    eq(memories.userId, user.id),
    eq(memories.isActive, true),
    or(like(memories.title, `%${query}%`), like(memories.content, `%${query}%`))
  )

  const rows = await database
    .select()
    .from(memories)
    .where(where)
    .orderBy(desc(memories.importance), desc(memories.updatedAt))
    .limit(limit)

  const memoriesWithSimilarity = rows.map((memory, index) => ({
    ...memory,
    similarity: Math.max(0.7 - index * 0.1, 0.3)
  }))

  return memoriesWithSimilarity.filter((m) => m.similarity >= threshold)
}

export async function getRelevantMemories(
  context: string,
  limit: number = 3,
  threshold: number = 0.6
) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const keywords = context
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)

  if (keywords.length === 0) {
    return []
  }

  const searchConditions = keywords.map((keyword) =>
    or(like(memories.title, `%${keyword}%`), like(memories.content, `%${keyword}%`))
  )

  const where = and(
    eq(memories.userId, user.id),
    eq(memories.isActive, true),
    or(...searchConditions)
  )

  const rows = await database
    .select()
    .from(memories)
    .where(where)
    .orderBy(desc(memories.importance), desc(memories.updatedAt))
    .limit(limit * 2)

  const memoriesWithRelevance = rows.map((memory) => {
    const titleMatch = keywords.some((keyword) => memory.title.toLowerCase().includes(keyword))
    const contentMatch = keywords.some((keyword) => memory.content.toLowerCase().includes(keyword))

    let relevance = 0.3
    if (titleMatch) relevance += 0.4
    if (contentMatch) relevance += 0.3

    const importanceBoost =
      {
        low: 0.1,
        medium: 0.2,
        high: 0.3,
        critical: 0.4
      }[memory.importance] || 0

    relevance += importanceBoost

    return {
      ...memory,
      relevance: Math.min(relevance, 1.0),
      reason:
        titleMatch && contentMatch
          ? "Title and content match"
          : titleMatch
            ? "Title matches"
            : contentMatch
              ? "Content matches"
              : "Keyword match"
    }
  })

  return memoriesWithRelevance
    .filter((m) => m.relevance >= threshold)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
}
