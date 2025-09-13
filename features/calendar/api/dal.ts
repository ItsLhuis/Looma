import { and, asc, count, desc, eq, gte, like, lte, or } from "drizzle-orm"

import { database } from "@/database/client"
import * as schema from "@/database/schema"

import { createInsertEventSchema, createUpdateEventSchema } from "@/features/calendar/schemas"

import { getUser } from "@/lib/dal.server"

import type { Event, InsertEvent, QueryEventsParams, UpdateEvent } from "@/features/calendar/types"

const { events } = schema

function resolveOrderBy(orderBy?: QueryEventsParams["orderBy"]) {
  if (!orderBy) return desc(events.updatedAt)

  const direction = orderBy.direction

  switch (orderBy.column) {
    case "updatedAt":
      return direction === "asc" ? asc(events.updatedAt) : desc(events.updatedAt)
    case "createdAt":
      return direction === "asc" ? asc(events.createdAt) : desc(events.createdAt)
    case "title":
      return direction === "asc" ? asc(events.title) : desc(events.title)
    case "startTime":
      return direction === "asc" ? asc(events.startTime) : desc(events.startTime)
    case "endTime":
      return direction === "asc" ? asc(events.endTime) : desc(events.endTime)
    default:
      return desc(events.updatedAt)
  }
}

export async function getEvents(params: QueryEventsParams = {}) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const { limit = 20, offset = 0, orderBy, filters } = params

  const filterConditions = []

  if (filters?.search) {
    filterConditions.push(
      or(like(events.title, `%${filters.search}%`), like(events.description, `%${filters.search}%`))
    )
  }

  if (filters?.isAllDay !== undefined) {
    filterConditions.push(eq(events.isAllDay, filters.isAllDay))
  }

  if (filters?.dateRange) {
    const startTimestamp = Math.floor(filters.dateRange.start.getTime() / 1000)
    const endTimestamp = Math.floor(filters.dateRange.end.getTime() / 1000)

    filterConditions.push(
      and(
        gte(events.startTime, new Date(startTimestamp * 1000)),
        lte(events.startTime, new Date(endTimestamp * 1000))
      )
    )
  }

  const where = and(eq(events.userId, user.id), ...filterConditions)

  const [rows, totals] = await Promise.all([
    database
      .select()
      .from(events)
      .where(where)
      .orderBy(resolveOrderBy(orderBy))
      .limit(limit)
      .offset(offset),
    database.select({ value: count() }).from(events).where(where)
  ])

  const total = Number(totals[0]?.value ?? 0)
  return { data: rows as Event[], total }
}

export async function getEventById(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [row] = await database
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.userId, user.id)))
  return (row ?? null) as Event | null
}

export async function createEvent(input: InsertEvent) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const body = createInsertEventSchema().parse(input) as InsertEvent

  const values = {
    ...body,
    userId: user.id
  }

  const [created] = await database.insert(events).values(values).returning()

  return created as Event
}

export async function updateEvent(id: string, input: UpdateEvent) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [existing] = await database
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.userId, user.id)))
  if (!existing) return undefined

  const merged = { ...existing, ...input }

  const body = createUpdateEventSchema().parse(merged) as UpdateEvent

  const setValues = {
    ...body,
    userId: user.id
  }

  const [updated] = await database
    .update(events)
    .set(setValues)
    .where(and(eq(events.id, id), eq(events.userId, user.id)))
    .returning()

  return (updated as Event | undefined) ?? undefined
}

export async function deleteEvent(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [deleted] = await database
    .delete(events)
    .where(and(eq(events.id, id), eq(events.userId, user.id)))
    .returning()

  return (deleted as Event | undefined) ?? undefined
}

export async function getEventsByDateRange(startDate: Date, endDate: Date) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const where = and(
    eq(events.userId, user.id),
    gte(events.startTime, startDate),
    lte(events.startTime, endDate)
  )

  const rows = await database.select().from(events).where(where).orderBy(asc(events.startTime))

  return rows as Event[]
}
