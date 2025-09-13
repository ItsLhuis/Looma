import { createEvent, getEvents } from "@/features/calendar/api/dal"

import { ZodError } from "zod"

import type {
  EventFilters,
  OrderableEventColumns,
  QueryEventsParams
} from "@/features/calendar/types"

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

const validOrderByColumns: OrderableEventColumns[] = [
  "createdAt",
  "updatedAt",
  "startTime",
  "endTime",
  "title"
]

function isOrderByColumn(column: unknown): column is OrderableEventColumns {
  return typeof column === "string" && validOrderByColumns.includes(column as OrderableEventColumns)
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)

    const limitParam = searchParams.get("limit")
    const offsetParam = searchParams.get("offset")
    const columnParam = searchParams.get("orderBy[column]")
    const directionParam = searchParams.get("orderBy[direction]")

    const search = searchParams.get("filters[search]") || searchParams.get("search") || undefined
    const isAllDayParam = searchParams.get("filters[isAllDay]")
    const dateRangeStart = searchParams.get("filters[dateRange][start]")
    const dateRangeEnd = searchParams.get("filters[dateRange][end]")

    const orderBy =
      columnParam &&
      directionParam &&
      isOrderByDirection(directionParam) &&
      isOrderByColumn(columnParam)
        ? { column: columnParam, direction: directionParam }
        : undefined

    const filters: EventFilters = {}

    if (search) filters.search = search

    if (isAllDayParam !== null) {
      filters.isAllDay = isAllDayParam === "true"
    }

    if (dateRangeStart && dateRangeEnd) {
      filters.dateRange = {
        start: new Date(dateRangeStart),
        end: new Date(dateRangeEnd)
      }
    }

    const params: QueryEventsParams = {
      limit: limitParam ? Number(limitParam) : undefined,
      offset: offsetParam ? Number(offsetParam) : undefined,
      orderBy,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }

    const result = await getEvents(params)

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

    const created = await createEvent(body)

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
