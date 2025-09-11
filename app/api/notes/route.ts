import { createNote, getNotes } from "@/features/notes/api/dal"

import { ZodError } from "zod"

import type { NoteFilters, OrderableNoteColumns, QueryNotesParams } from "@/features/notes/types"

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

const validOrderByColumns: OrderableNoteColumns[] = [
  "createdAt",
  "updatedAt",
  "title",
  "priority",
  "isFavorite",
  "isArchived"
]

function isOrderByColumn(column: unknown): column is OrderableNoteColumns {
  return typeof column === "string" && validOrderByColumns.includes(column as OrderableNoteColumns)
}

function isNotePriority(
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
    const priorityParams =
      searchParams.getAll("filters[priority][]").length > 0
        ? searchParams.getAll("filters[priority][]")
        : searchParams.get("filters[priority]")
          ? [searchParams.get("filters[priority]")!]
          : []
    const isFavoriteParam = searchParams.get("filters[isFavorite]")
    const isArchivedParam = searchParams.get("filters[isArchived]")

    const orderBy =
      columnParam &&
      directionParam &&
      isOrderByDirection(directionParam) &&
      isOrderByColumn(columnParam)
        ? { column: columnParam, direction: directionParam }
        : undefined

    const filters: NoteFilters = {}

    if (search) filters.search = search

    if (priorityParams.length > 0) {
      const validPriorities = priorityParams.filter(isNotePriority)
      if (validPriorities.length > 0) {
        filters.priority = validPriorities.length === 1 ? validPriorities[0] : validPriorities
      }
    }

    if (isFavoriteParam !== null) {
      filters.isFavorite = isFavoriteParam === "true"
    }
    if (isArchivedParam !== null) {
      filters.isArchived = isArchivedParam === "true"
    }

    const params: QueryNotesParams = {
      limit: limitParam ? Number(limitParam) : undefined,
      offset: offsetParam ? Number(offsetParam) : undefined,
      orderBy,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }

    const result = await getNotes(params)

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

    const created = await createNote(body)

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
