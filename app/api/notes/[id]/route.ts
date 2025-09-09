import { deleteNote, getNoteById, updateNote } from "@/features/notes/api/dal"

import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}

export async function GET(_request: Request, context: Params): Promise<Response> {
  try {
    const { id } = await context.params
    const note = await getNoteById(id)
    if (!note) return jsonResponse({ error: "Not Found" }, 404)
    return jsonResponse({ data: note })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    const status = message === "UNAUTHORIZED" ? 401 : 500
    return jsonResponse({ error: message }, status)
  }
}

export async function PUT(request: Request, context: Params): Promise<Response> {
  try {
    const body = await request.json()
    const { id } = await context.params
    const updated = await updateNote(id, body)
    if (!updated) return jsonResponse({ error: "Not Found" }, 404)
    return jsonResponse({ data: updated })
  } catch (error: unknown) {
    let status = 500
    let message: unknown = "Internal Server Error"

    if (isZodError(error)) {
      status = 400
      message = error.issues
    } else if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        status = 401
      }
      message = error.message
    }

    return jsonResponse({ error: message }, status)
  }
}

export async function DELETE(_request: Request, context: Params): Promise<Response> {
  try {
    const { id } = await context.params
    const deleted = await deleteNote(id)
    if (!deleted) return jsonResponse({ error: "Not Found" }, 404)
    return jsonResponse({ data: deleted })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    const status = message === "UNAUTHORIZED" ? 401 : 500
    return jsonResponse({ error: message }, status)
  }
}
