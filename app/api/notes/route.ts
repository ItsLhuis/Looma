import { createNote, getNotes } from "@/features/notes/api/dal"

import { ZodError } from "zod"

import type { NoteColumns, QueryNotesParams } from "@/features/notes/types"

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

const validNoteColumns: NoteColumns[] = [
  "id",
  "createdAt",
  "updatedAt",
  "userId",
  "title",
  "content",
  "categoryId",
  "summary",
  "isFavorite",
  "isArchived",
  "priority"
]

function isNoteColumn(column: unknown): column is NoteColumns {
  return typeof column === "string" && validNoteColumns.includes(column as NoteColumns)
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)

    const limitParam = searchParams.get("limit")
    const offsetParam = searchParams.get("offset")
    const columnParam = searchParams.get("orderBy[column]")
    const directionParam = searchParams.get("orderBy[direction]")
    const search = searchParams.get("filters[search]") || searchParams.get("search") || undefined

    const orderBy =
      columnParam &&
      directionParam &&
      isOrderByDirection(directionParam) &&
      isNoteColumn(columnParam)
        ? { column: columnParam, direction: directionParam }
        : undefined

    const params: QueryNotesParams = {
      limit: limitParam ? Number(limitParam) : undefined,
      offset: offsetParam ? Number(offsetParam) : undefined,
      orderBy,
      filters: { search: search || undefined }
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
