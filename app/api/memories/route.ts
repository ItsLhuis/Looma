import { createMemory, getMemories } from "@/features/memories/api/dal"

import { ZodError } from "zod"

import type {
  MemoryFilters,
  OrderableMemoryColumns,
  QueryMemoriesParams
} from "@/features/memories/types"

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

const validOrderByColumns: OrderableMemoryColumns[] = [
  "createdAt",
  "updatedAt",
  "title",
  "importance",
  "isActive"
]

function isOrderByColumn(column: unknown): column is OrderableMemoryColumns {
  return (
    typeof column === "string" && validOrderByColumns.includes(column as OrderableMemoryColumns)
  )
}

function isMemoryImportance(
  importance: unknown
): importance is "low" | "medium" | "high" | "critical" {
  return (
    typeof importance === "string" && ["low", "medium", "high", "critical"].includes(importance)
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
    const importanceParams =
      searchParams.getAll("filters[importance][]").length > 0
        ? searchParams.getAll("filters[importance][]")
        : searchParams.get("filters[importance]")
          ? [searchParams.get("filters[importance]")!]
          : []
    const isActiveParam = searchParams.get("filters[isActive]")

    const orderBy =
      columnParam &&
      directionParam &&
      isOrderByDirection(directionParam) &&
      isOrderByColumn(columnParam)
        ? { column: columnParam, direction: directionParam }
        : undefined

    const filters: MemoryFilters = {}

    if (search) filters.search = search

    if (importanceParams.length > 0) {
      const validImportances = importanceParams.filter(isMemoryImportance)
      if (validImportances.length > 0) {
        filters.importance = validImportances.length === 1 ? validImportances[0] : validImportances
      }
    }

    if (isActiveParam !== null) {
      filters.isActive = isActiveParam === "true"
    }

    const params: QueryMemoriesParams = {
      limit: limitParam ? Number(limitParam) : undefined,
      offset: offsetParam ? Number(offsetParam) : undefined,
      orderBy,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }

    const result = await getMemories(params)

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

    const created = await createMemory(body)

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
