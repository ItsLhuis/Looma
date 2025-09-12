import { and, asc, count, desc, eq, gte, inArray, isNull, like, lte, or } from "drizzle-orm"

import { database } from "@/database/client"
import * as schema from "@/database/schema"

import { createInsertTaskSchema, createUpdateTaskSchema } from "@/features/tasks/schemas"

import { getUser } from "@/lib/dal.server"

import type { InsertTask, QueryTasksParams, Task, UpdateTask } from "@/features/tasks/types"

const { tasks } = schema

function resolveOrderBy(orderBy?: QueryTasksParams["orderBy"]) {
  if (!orderBy) return [desc(tasks.updatedAt)]

  const direction = orderBy.direction

  switch (orderBy.column) {
    case "updatedAt":
      return [direction === "asc" ? asc(tasks.updatedAt) : desc(tasks.updatedAt)]
    case "createdAt":
      return [direction === "asc" ? asc(tasks.createdAt) : desc(tasks.createdAt)]
    case "title":
      return [direction === "asc" ? asc(tasks.title) : desc(tasks.title)]
    case "status":
      return [direction === "asc" ? asc(tasks.status) : desc(tasks.status)]
    case "priority":
      return [direction === "asc" ? asc(tasks.priority) : desc(tasks.priority)]
    case "dueDate":
      return [direction === "asc" ? asc(tasks.dueDate) : desc(tasks.dueDate)]
    case "position":
      return [direction === "asc" ? asc(tasks.position) : desc(tasks.position)]
    default:
      return [desc(tasks.updatedAt)]
  }
}

export async function getTasks(params: QueryTasksParams = {}) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const { limit = 20, offset = 0, orderBy, filters } = params

  const filterConditions = []

  if (filters?.search) {
    filterConditions.push(
      or(like(tasks.title, `%${filters.search}%`), like(tasks.description, `%${filters.search}%`))
    )
  }

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filterConditions.push(inArray(tasks.status, filters.status))
    } else {
      filterConditions.push(eq(tasks.status, filters.status))
    }
  }

  if (filters?.priority) {
    if (Array.isArray(filters.priority)) {
      filterConditions.push(inArray(tasks.priority, filters.priority))
    } else {
      filterConditions.push(eq(tasks.priority, filters.priority))
    }
  }

  if (filters?.dueDate) {
    if (filters.dueDate.from) {
      filterConditions.push(gte(tasks.dueDate, filters.dueDate.from))
    }
    if (filters.dueDate.to) {
      filterConditions.push(lte(tasks.dueDate, filters.dueDate.to))
    }
  }

  if (filters?.parentTaskId !== undefined) {
    if (filters.parentTaskId === null) {
      filterConditions.push(isNull(tasks.parentTaskId))
    } else {
      filterConditions.push(eq(tasks.parentTaskId, filters.parentTaskId))
    }
  }

  const where = and(eq(tasks.userId, user.id), ...filterConditions)

  const [rows, totals] = await Promise.all([
    database
      .select()
      .from(tasks)
      .where(where)
      .orderBy(...resolveOrderBy(orderBy))
      .limit(limit)
      .offset(offset),
    database.select({ value: count() }).from(tasks).where(where)
  ])

  const total = Number(totals[0]?.value ?? 0)
  return { data: rows as Task[], total }
}

export async function getTaskById(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [row] = await database
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
  return (row ?? null) as Task | null
}

export async function getTasksByParentId(parentId: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const rows = await database
    .select()
    .from(tasks)
    .where(and(eq(tasks.parentTaskId, parentId), eq(tasks.userId, user.id)))
    .orderBy(asc(tasks.position), asc(tasks.createdAt))

  return rows as Task[]
}

export async function createTask(input: InsertTask) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const body = createInsertTaskSchema().parse(input) as InsertTask

  const [lastTask] = await database
    .select({ position: tasks.position })
    .from(tasks)
    .where(and(eq(tasks.userId, user.id), eq(tasks.status, body.status || "pending")))
    .orderBy(desc(tasks.position))
    .limit(1)

  const nextPosition = (lastTask?.position ?? 0) + 1

  const values = {
    ...body,
    userId: user.id,
    position: nextPosition,
    completedAt: body.status === "completed" ? new Date() : null
  }

  const [created] = await database.insert(tasks).values(values).returning()

  return created as Task
}

export async function updateTask(id: string, input: UpdateTask) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [existing] = await database
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
  if (!existing) return undefined

  const merged = { ...existing, ...input }

  const body = createUpdateTaskSchema().parse(merged) as UpdateTask

  const now = new Date()
  const setValues = {
    ...body,
    userId: user.id,
    completedAt: body.status === "completed" ? now : existing.completedAt,
    updatedAt: now
  }

  const [updated] = await database
    .update(tasks)
    .set(setValues)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning()

  return (updated as Task | undefined) ?? undefined
}

export async function updateTaskStatus(id: string, status: Task["status"]) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [existing] = await database
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
  if (!existing) return undefined

  const now = new Date()
  const setValues = {
    status,
    completedAt: status === "completed" ? now : null,
    updatedAt: now
  }

  const [updated] = await database
    .update(tasks)
    .set(setValues)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning()

  return (updated as Task | undefined) ?? undefined
}

export async function reorderTask(id: string, newPosition: number, newStatus?: Task["status"]) {
  const user = await getUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }

  const [existing] = await database
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))

  if (!existing) {
    return undefined
  }

  const finalStatus = newStatus || existing.status
  const now = new Date()

  const completedAt =
    finalStatus === "completed" && existing.status !== "completed"
      ? now
      : finalStatus !== "completed"
        ? null
        : existing.completedAt

  const setValues = {
    position: newPosition,
    status: finalStatus,
    completedAt,
    updatedAt: now
  }

  const [updated] = await database
    .update(tasks)
    .set(setValues)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning()

  return updated as Task
}

export async function deleteTask(id: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [deleted] = await database
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning()

  return (deleted as Task | undefined) ?? undefined
}

export async function searchTasks(query: string) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const where = and(
    eq(tasks.userId, user.id),
    or(like(tasks.title, `%${query}%`), like(tasks.description, `%${query}%`))
  )
  const rows = await database
    .select()
    .from(tasks)
    .where(where)
    .orderBy(desc(tasks.position), desc(tasks.updatedAt))
    .limit(50)

  return rows as Task[]
}
