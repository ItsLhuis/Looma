import { deleteMemory, getMemoryById, updateMemory } from "@/features/memories/api/dal"

import { ZodError } from "zod"

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const memory = await getMemoryById(id)

    if (!memory) {
      return jsonResponse({ error: "Memory not found" }, 404)
    }

    return jsonResponse({ data: memory })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    const status = message === "UNAUTHORIZED" ? 401 : 500

    return jsonResponse({ error: message }, status)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await updateMemory(id, body)

    if (!updated) {
      return jsonResponse({ error: "Memory not found" }, 404)
    }

    return jsonResponse({ data: updated })
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const deleted = await deleteMemory(id)

    if (!deleted) {
      return jsonResponse({ error: "Memory not found" }, 404)
    }

    return jsonResponse({ data: deleted })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    const status = message === "UNAUTHORIZED" ? 401 : 500

    return jsonResponse({ error: message }, status)
  }
}
