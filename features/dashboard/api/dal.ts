import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm"

import { database } from "@/database/client"
import * as schema from "@/database/schema"

import { getUser } from "@/lib/dal.server"

import type { DashboardFilters, DashboardOverview } from "../types"

const { tasks, notes, events } = schema

function getDateRange(filters?: DashboardFilters) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - today.getDay())

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  return {
    today,
    tomorrow,
    weekStart,
    weekEnd,
    customStart: filters?.dateRange?.start,
    customEnd: filters?.dateRange?.end
  }
}

function getDayOfWeek(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[date.getDay()]
}

export async function getDashboardStats(filters?: DashboardFilters) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const { today, weekEnd } = getDateRange(filters)

  const [
    totalTasksResult,
    completedTasksResult,
    pendingTasksResult,
    overdueTasksResult,
    totalNotesResult,
    totalEventsResult,
    todayEventsResult,
    thisWeekEventsResult
  ] = await Promise.all([
    database.select({ count: count() }).from(tasks).where(eq(tasks.userId, user.id)),

    database
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, user.id), eq(tasks.status, "completed"))),

    database
      .select({ count: count() })
      .from(tasks)
      .where(
        and(eq(tasks.userId, user.id), sql`${tasks.status} IN ('pending', 'inProgress', 'onHold')`)
      ),

    database
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          sql`${tasks.status} IN ('pending', 'inProgress', 'onHold')`,
          lte(tasks.dueDate, today)
        )
      ),

    database
      .select({ count: count() })
      .from(notes)
      .where(
        and(
          eq(notes.userId, user.id),
          filters?.includeArchived ? undefined : eq(notes.isArchived, false)
        )
      ),

    database.select({ count: count() }).from(events).where(eq(events.userId, user.id)),

    database
      .select({ count: count() })
      .from(events)
      .where(
        and(
          eq(events.userId, user.id),
          gte(events.startTime, today),
          lte(events.startTime, new Date(today.getTime() + 24 * 60 * 60 * 1000))
        )
      ),

    database
      .select({ count: count() })
      .from(events)
      .where(
        and(
          eq(events.userId, user.id),
          gte(events.startTime, today),
          lte(events.startTime, weekEnd)
        )
      )
  ])

  const totalTasks = Number(totalTasksResult[0]?.count ?? 0)
  const completedTasks = Number(completedTasksResult[0]?.count ?? 0)
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return {
    totalTasks,
    completedTasks,
    pendingTasks: Number(pendingTasksResult[0]?.count ?? 0),
    overdueTasks: Number(overdueTasksResult[0]?.count ?? 0),
    totalNotes: Number(totalNotesResult[0]?.count ?? 0),
    totalEvents: Number(totalEventsResult[0]?.count ?? 0),
    todayEvents: Number(todayEventsResult[0]?.count ?? 0),
    thisWeekEvents: Number(thisWeekEventsResult[0]?.count ?? 0),
    completionRate
  }
}

export async function getTodaysFocus(filters?: DashboardFilters) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const { today, tomorrow } = getDateRange(filters)

  const [eventsData, tasksData] = await Promise.all([
    database
      .select({
        id: events.id,
        title: events.title,
        startTime: events.startTime,
        endTime: events.endTime,
        isAllDay: events.isAllDay
      })
      .from(events)
      .where(
        and(
          eq(events.userId, user.id),
          gte(events.startTime, today),
          lte(events.startTime, tomorrow)
        )
      )
      .orderBy(events.startTime),

    database
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          sql`${tasks.status} IN ('pending', 'inProgress', 'onHold')`,
          lte(tasks.dueDate, tomorrow)
        )
      )
      .orderBy(tasks.priority, tasks.dueDate)
  ])

  const now = new Date()
  const tasksWithOverdue = tasksData.map((task) => ({
    ...task,
    isOverdue: task.dueDate ? task.dueDate < now : false
  }))

  const overdueCount = tasksWithOverdue.filter((task) => task.isOverdue).length

  return {
    events: eventsData.map((event) => ({
      ...event,
      startTime: event.startTime,
      endTime: event.endTime || undefined
    })),
    tasks: tasksWithOverdue.map((task) => ({
      ...task,
      dueDate: task.dueDate || undefined
    })),
    stats: {
      eventsCount: eventsData.length,
      tasksCount: tasksWithOverdue.length,
      overdueCount
    }
  }
}

export async function getWeeklyOverview(filters?: DashboardFilters) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const { today, weekEnd } = getDateRange(filters)

  const [eventsData, tasksData, completedTasksData] = await Promise.all([
    database
      .select({
        id: events.id,
        title: events.title,
        startTime: events.startTime,
        endTime: events.endTime,
        isAllDay: events.isAllDay
      })
      .from(events)
      .where(
        and(
          eq(events.userId, user.id),
          gte(events.startTime, today),
          lte(events.startTime, weekEnd)
        )
      )
      .orderBy(events.startTime),

    database
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          sql`${tasks.status} IN ('pending', 'inProgress', 'onHold')`,
          gte(tasks.dueDate, today),
          lte(tasks.dueDate, weekEnd)
        )
      )
      .orderBy(tasks.dueDate),

    database
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, today),
          lte(tasks.completedAt, weekEnd)
        )
      )
  ])

  const totalTasksThisWeek = tasksData.length
  const completedTasksThisWeek = Number(completedTasksData[0]?.count ?? 0)
  const totalTasksWithCompleted = totalTasksThisWeek + completedTasksThisWeek

  return {
    events: eventsData.map((event) => ({
      ...event,
      startTime: event.startTime,
      endTime: event.endTime || undefined,
      dayOfWeek: getDayOfWeek(event.startTime)
    })),
    tasks: tasksData.map((task) => ({
      ...task,
      dueDate: task.dueDate || undefined,
      dayOfWeek: task.dueDate ? getDayOfWeek(task.dueDate) : "No due date"
    })),
    completionProgress: {
      completed: completedTasksThisWeek,
      total: totalTasksWithCompleted,
      percentage:
        totalTasksWithCompleted > 0
          ? Math.round((completedTasksThisWeek / totalTasksWithCompleted) * 100)
          : 0
    }
  }
}

export async function getRecentActivity(filters?: DashboardFilters) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const [notesData, tasksData, eventsData] = await Promise.all([
    database
      .select({
        id: notes.id,
        title: notes.title,
        updatedAt: notes.updatedAt,
        priority: notes.priority
      })
      .from(notes)
      .where(
        and(
          eq(notes.userId, user.id),
          filters?.includeArchived ? undefined : eq(notes.isArchived, false)
        )
      )
      .orderBy(desc(notes.updatedAt))
      .limit(5),

    database
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        updatedAt: tasks.updatedAt,
        completedAt: tasks.completedAt
      })
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .orderBy(desc(tasks.updatedAt))
      .limit(5),

    database
      .select({
        id: events.id,
        title: events.title,
        startTime: events.startTime,
        updatedAt: events.updatedAt
      })
      .from(events)
      .where(eq(events.userId, user.id))
      .orderBy(desc(events.updatedAt))
      .limit(5)
  ])

  return {
    notes: notesData.map((note) => ({
      ...note,
      updatedAt: note.updatedAt
    })),
    tasks: tasksData.map((task) => ({
      ...task,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt || undefined
    })),
    events: eventsData.map((event) => ({
      ...event,
      startTime: event.startTime,
      updatedAt: event.updatedAt
    }))
  }
}

export async function getDashboardOverview(filters?: DashboardFilters): Promise<DashboardOverview> {
  const [stats, todaysFocus, weeklyOverview, recentActivity] = await Promise.all([
    getDashboardStats(filters),
    getTodaysFocus(filters),
    getWeeklyOverview(filters),
    getRecentActivity(filters)
  ])

  return {
    stats,
    todaysFocus,
    weeklyOverview,
    recentActivity
  }
}
