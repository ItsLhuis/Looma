import { createTask, getTasks } from "@/features/tasks/api/dal"

import { ZodError } from "zod"

import type { OrderableTaskColumns, QueryTasksParams, TaskFilters } from "@/features/tasks/types"

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}

function isOrderByDirection(value: unknown): value is "asc" | "desc" {
  return value === "asc" || value === "desc"
}

const validOrderByColumns: OrderableTaskColumns[] = [
  "createdAt",
  "updatedAt",
  "title",
  "status",
  "priority",
  "dueDate",
  "position"
]

function isOrderByColumn(column: unknown): column is OrderableTaskColumns {
  return typeof column === "string" && validOrderByColumns.includes(column as OrderableTaskColumns)
}

function isTaskStatus(
  status: unknown
): status is "pending" | "inProgress" | "completed" | "cancelled" | "onHold" {
  return (
    typeof status === "string" &&
    ["pending", "inProgress", "completed", "cancelled", "onHold"].includes(status)
  )
}

function isTaskPriority(
  priority: unknown
): priority is "none" | "low" | "medium" | "high" | "urgent" {
  return (
    typeof priority === "string" && ["none", "low", "medium", "high", "urgent"].includes(priority)
  )
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)

    const limitParam = searchParams.get("limit")
    const offsetParam = searchParams.get("offset")
    const columnParam = searchParams.get("orderBy[column]")
    const directionParam = searchParams.get("orderBy[direction]")

    const search = searchParams.get("filters[search]") || searchParams.get("search") || undefined
    const statusParams =
      searchParams.getAll("filters[status][]").length > 0
        ? searchParams.getAll("filters[status][]")
        : searchParams.get("filters[status]")
          ? [searchParams.get("filters[status]")!]
          : []
    const priorityParams =
      searchParams.getAll("filters[priority][]").length > 0
        ? searchParams.getAll("filters[priority][]")
        : searchParams.get("filters[priority]")
          ? [searchParams.get("filters[priority]")!]
          : []
    const dueDateFromParam = searchParams.get("filters[dueDate][from]")
    const dueDateToParam = searchParams.get("filters[dueDate][to]")
    const parentTaskIdParam = searchParams.get("filters[parentTaskId]")
    const hasSubtasksParam = searchParams.get("filters[hasSubtasks]")

    const orderBy =
      columnParam &&
      directionParam &&
      isOrderByDirection(directionParam) &&
      isOrderByColumn(columnParam)
        ? { column: columnParam, direction: directionParam }
        : undefined

    const filters: TaskFilters = {}

    if (search) filters.search = search

    if (statusParams.length > 0) {
      const validStatuses = statusParams.filter(isTaskStatus)
      if (validStatuses.length > 0) {
        filters.status = validStatuses.length === 1 ? validStatuses[0] : validStatuses
      }
    }

    if (priorityParams.length > 0) {
      const validPriorities = priorityParams.filter(isTaskPriority)
      if (validPriorities.length > 0) {
        filters.priority = validPriorities.length === 1 ? validPriorities[0] : validPriorities
      }
    }

    if (dueDateFromParam || dueDateToParam) {
      filters.dueDate = {}
      if (dueDateFromParam) {
        filters.dueDate.from = new Date(dueDateFromParam)
      }
      if (dueDateToParam) {
        filters.dueDate.to = new Date(dueDateToParam)
      }
    }

    if (parentTaskIdParam !== null) {
      filters.parentTaskId = parentTaskIdParam === "null" ? null : parentTaskIdParam
    }

    if (hasSubtasksParam !== null) {
      filters.hasSubtasks = hasSubtasksParam === "true"
    }

    const params: QueryTasksParams = {
      limit: limitParam ? Number(limitParam) : undefined,
      offset: offsetParam ? Number(offsetParam) : undefined,
      orderBy,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }

    const result = await getTasks(params)
    return jsonResponse(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    const status = message === "UNAUTHORIZED" ? 401 : 500
    return jsonResponse({ error: message }, status)
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const created = await createTask({ ...body, dueDate: new Date(body.dueDate) })
    return jsonResponse({ data: created })
  } catch (error: unknown) {
    let status = 500
    let message: unknown = "Internal Server Error"

    if (isZodError(error)) {
      status = 400
      message = error.issues
    } else if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") status = 401
      message = error.message
    }

    return jsonResponse({ error: message }, status)
  }
}
